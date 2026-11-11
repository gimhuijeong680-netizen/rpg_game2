// DOM HUD: 매 프레임 state 를 읽어 바뀐 부분만 갱신한다 (state 는 수정하지 않음)
// 클릭은 PK.input.push(...) 로 게임 시스템에 전달
(function () {
  const $ = (id) => document.getElementById(id);
  const last = {};
  function changed(key, value) {
    const v = typeof value === 'string' ? value : JSON.stringify(value);
    if (last[key] === v) return false;
    last[key] = v;
    return true;
  }
  const pad = (n) => String(n).padStart(2, '0');
  let questOpen = false;

  function fillIcons(root = document) {
    for (const el of root.querySelectorAll('.icon-slot[data-icon]')) {
      if (el.firstChild) continue;
      el.appendChild(PK.sprites.canvas(el.dataset.icon, 2));
    }
  }

  function syncTop(state) {
    const c = state.clock;
    const m = Math.floor(c.minutes);
    const h = Math.floor(m / 60);
    const text = `${c.day}일 · ${h < 12 ? '오전' : '오후'} ${pad(((h + 11) % 12) + 1)}:${pad(Math.floor((m % 60) / 10) * 10)}`;
    if (changed('date', text)) $('hudDate').textContent = text;

    const count = state.inventory.items.reduce((s, it) => s + it.count, 0);
    if (changed('bag', count)) {
      $('bagCount').textContent = count;
      const btn = $('bagBtn');
      btn.classList.remove('bump');
      void btn.offsetWidth;
      btn.classList.add('bump');
    }
    const showDeco = state.scene === 'house' && !state.ui.deco;
    if (changed('decoBtn', showDeco)) $('decoBtn').hidden = !showDeco;

    // 대화·가방·제작 등 창이 열려 있으면 터치 패드/퀘스트 숨김
    const u = state.ui;
    const modal = !!(u.dialog || u.inventoryOpen || u.deco || u.brew || (u.banner && !u.banner.pending));
    if (changed('modal', modal)) $('hud').classList.toggle('modal', modal);
    const hideQuest = !!(u.deco || u.brew);
    if (changed('questHidden', hideQuest)) $('quest').hidden = hideQuest;
  }

  // 퀘스트: 평소엔 한두 줄, 누르면 단계 목록
  function syncQuest(state) {
    const list = PK.questView(state);
    const active = list.filter((q) => q.active);
    // 진행 중인 게 없으면 아직 시작 안 한 것 하나를 안내
    const shown = active.length ? active : list.filter((q) => !q.done).slice(0, 1);
    const key = { shown: shown.map((q) => q.id + q.current), all: list.map((q) => q.steps.map((s) => s.done)), questOpen };
    if (!changed('quest', key)) return;

    const btn = $('questToggle');
    btn.hidden = !shown.length;
    btn.innerHTML = '';
    for (const q of shown) {
      const row = document.createElement('span');
      row.className = 'q-row';
      const title = document.createElement('span');
      title.className = 'q-title';
      title.textContent = q.title;
      const step = document.createElement('span');
      step.className = 'q-step';
      step.textContent = '▸ ' + q.current;
      row.append(PK.sprites.canvas(q.icon, 2), title, step);
      btn.appendChild(row);
    }
    btn.setAttribute('aria-expanded', String(questOpen));
    btn.title = '눌러서 퀘스트 자세히 보기';

    const det = $('questDetail');
    det.hidden = !questOpen || !shown.length;
    det.innerHTML = '';
    for (const q of list.filter((x) => x.started || shown.includes(x))) {
      const h = document.createElement('h3');
      h.textContent = q.title + (q.done ? ' ✓' : '');
      const ol = document.createElement('ol');
      let nowSet = false;
      for (const s of q.steps) {
        const li = document.createElement('li');
        li.textContent = s.text;
        if (s.done) li.className = 'done';
        else if (!nowSet) { li.className = 'now'; nowSet = true; }
        ol.appendChild(li);
      }
      det.append(h, ol);
    }
  }

  function syncPrompt(state) {
    const pr = state.ui.prompt;
    const show = pr && !PK.game.busy(state);
    const touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const key = show ? pr.label + (pr.pet ? '|pet' : '') + touch : '';
    if (!changed('prompt', key)) return;
    const el = $('prompt');
    el.hidden = !show;
    if (!show) return;
    el.textContent = '';
    const part = (k, text) => {
      const kb = document.createElement('kbd');
      kb.textContent = k;
      const sp = document.createElement('span');
      sp.textContent = text;
      el.append(kb, sp);
    };
    part('E', pr.label);
    if (pr.pet) {
      const sep = document.createElement('span');
      sep.className = 'sep';
      el.appendChild(sep);
      part(touch ? '♥' : 'P', '쓰다듬기');
    }
  }

  // 쓰다듬기 반응 말풍선: 주민 머리 위에 잠깐 떠올랐다 사라짐 (+ 효과음)
  const petSeen = {};
  function syncPetBubbles(state) {
    const box = $('petBubbles');
    const world = PK.data.worlds[state.scene];
    const pets = state.ui.pets;
    const ids = Object.keys(pets);
    if (!ids.length) { if (box.childElementCount) box.innerHTML = ''; return; }
    const cv = $('game').getBoundingClientRect();
    const k = cv.width / state.view.w;
    for (const id of ids) {
      const r = pets[id];
      const n = world.npcs.find((it) => it.id === id);
      if (!n) continue;
      let el = box.querySelector(`[data-id="${id}"]`);
      if (!el) {
        el = document.createElement('div');
        el.className = 'pill pet-bubble';
        el.dataset.id = id;
        box.appendChild(el);
      }
      if (el.dataset.seq !== String(r.seq)) {
        el.dataset.seq = String(r.seq);
        el.textContent = r.line;
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
      }
      if (petSeen[id] !== r.seq) { petSeen[id] = r.seq; PK.sfx.pet(id); }
      const pos = PK.game.npcPos(state, n);
      // 화면 가장자리에서 잘리지 않도록 안쪽으로
      const half = el.offsetWidth / 2 + 6;
      const sx = cv.left + (pos.x - state.camera.x) * k;
      el.style.left = Math.round(Math.max(half, Math.min(window.innerWidth - half, sx))) + 'px';
      el.style.top = Math.round(cv.top + (pos.y - 52 - state.camera.y) * k) + 'px';
      el.style.opacity = r.t > PK.pet.DURATION - 0.3 ? String((PK.pet.DURATION - r.t) / 0.3) : '1';
    }
    for (const el of [...box.children]) if (!pets[el.dataset.id]) el.remove();
  }

  // 작은 효과음 (WebAudio, 파일 없음). 주민마다 음 높이가 다르다
  PK.sfx = {
    ctx: null,
    pet(id) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        const ac = PK.sfx.ctx || (PK.sfx.ctx = new AC());
        const base = { momo: 880, berry: 740, flora: 660, lumi: 990, cherry: 1046 }[id] || 800;
        [0, 0.09].forEach((delay, i) => {
          const o = ac.createOscillator();
          const g = ac.createGain();
          o.type = 'triangle';
          o.frequency.value = base * (i ? 1.26 : 1);
          const t0 = ac.currentTime + delay;
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.exponentialRampToValueAtTime(0.08, t0 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
          o.connect(g).connect(ac.destination);
          o.start(t0);
          o.stop(t0 + 0.18);
        });
      } catch (e) { /* 소리를 낼 수 없는 환경이면 조용히 */ }
    },
  };

  function syncToasts(state) {
    const list = state.ui.toasts;
    if (!changed('toasts', list.map((t) => t.text))) return;
    const box = $('toasts');
    box.innerHTML = '';
    for (const t of list) {
      const el = document.createElement('div');
      el.className = 'pill toast';
      if (t.icon) el.appendChild(PK.sprites.canvas(t.icon, 2));
      el.appendChild(document.createTextNode(t.text));
      box.appendChild(el);
    }
  }

  function setupFullscreen() {
    const btn = $('fullBtn');
    const root = document.documentElement;
    if (!root.requestFullscreen) { btn.hidden = true; return; }
    btn.addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else root.requestFullscreen().catch(() => {});
      $('game').focus();
    });
    document.addEventListener('fullscreenchange', () => {
      btn.title = document.fullscreenElement ? '전체 화면 끄기' : '전체 화면';
    });
  }

  function setup() {
    fillIcons();
    $('bagBtn').addEventListener('click', () => PK.input.push({ type: 'toggleInventory' }));
    $('decoBtn').addEventListener('click', () => PK.input.push({ type: 'decoToggle' }));
    $('questToggle').addEventListener('click', () => { questOpen = !questOpen; last.quest = null; });
    $('helpBtn').addEventListener('click', () => { $('help').hidden = !$('help').hidden; });
    $('helpClose').addEventListener('click', () => { $('help').hidden = true; $('game').focus(); });
    $('resetBtn').addEventListener('click', () => {
      if (!window.confirm('저장된 진행 상황을 지우고 처음부터 시작할까요?')) return;
      PK.save.disabled = true;
      PK.save.clear();
      location.hash = '';
      location.reload();
    });
    setupFullscreen();
    $('loading').hidden = true;
  }

  PK.ui = PK.ui || {};
  PK.ui.changed = changed;
  PK.ui.fillIcons = fillIcons;
  PK.ui.setupHud = setup;
  PK.ui.syncHud = function (state) {
    syncTop(state);
    syncQuest(state);
    syncPrompt(state);
    syncPetBubbles(state);
    syncToasts(state);
  };
})();
