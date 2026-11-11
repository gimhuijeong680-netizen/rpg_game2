(function () {
  const C = PK.config;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');

  const state = PK.createInitialState();
  PK.state = state;   // 콘솔 디버깅용

  // ---- 풀스크린 캔버스 ----
  // 창 크기(실제 기기 픽셀)를 정수 배율로 나눠 '보이는 도트 수(view)'를 정한다.
  // → 어떤 화면 비율에서도 찌그러짐 없이, 픽셀 1도트 = 기기 픽셀 N x N 으로 선명하게
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const W = Math.round(window.innerWidth * dpr);
    const H = Math.round(window.innerHeight * dpr);
    // 짧은 쪽에 약 240도트가 보이도록 (방 하나가 화면을 넉넉히 채움)
    const scale = Math.max(1, Math.round(Math.min(W, H) / C.HEIGHT));
    const vw = Math.ceil(W / scale), vh = Math.ceil(H / scale);
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw;
      canvas.height = vh;
    }
    canvas.style.width = (vw * scale) / dpr + 'px';
    canvas.style.height = (vh * scale) / dpr + 'px';
    ctx.imageSmoothingEnabled = false;
    state.view = { w: vw, h: vh };
    PK.viewScale = scale;
  }
  window.addEventListener('resize', resize);
  document.addEventListener('fullscreenchange', resize);
  resize();

  // ---- 저장 ----
  function save() {
    if (!PK.save.disabled && !/demo=/.test(location.hash)) PK.save.write(state);
  }

  function start() {
    PK.ui.setupHud();
    PK.ui.setupPanels();
    PK.ui.setupTouch();
    if (/demo=/.test(location.hash)) PK.demo.apply(state, location.hash);
    else PK.save.apply(state, PK.save.read());
    PK.systems.camera(state);

    setInterval(save, 1000);
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });

    let last = performance.now();
    function frame(now) {
      const dt = Math.max(0, Math.min((now - last) / 1000, C.MAX_DT));
      last = now;
      try {
        const input = PK.input.snapshot();
        PK.game.step(state, input, dt);
        PK.input.endFrame();

        PK.render(ctx, state, PK.data.worlds[state.scene]);
        PK.ui.syncHud(state);
        PK.ui.syncPanels(state);
      } catch (err) {
        // 오류가 나도 화면이 조용히 멈추지 않도록 표시
        const box = document.getElementById('loading');
        box.hidden = false;
        box.textContent = '오류: ' + err.message;
        console.error(err);
        return;
      }
      requestAnimationFrame(frame);
    }
    canvas.focus();
    requestAnimationFrame(frame);
  }

  PK.assets.load().then(start, (err) => {
    document.getElementById('loading').textContent = err.message;
    console.error(err);
  });
})();
