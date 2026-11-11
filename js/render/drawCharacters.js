(function () {
  const WALK = ['stepA', 'pass', 'stepB', 'pass'];

  function shadow(ctx, fx, fy) {
    ctx.globalAlpha = 0.35;
    PK.sprites.draw(ctx, 'shadowS', fx - 8, fy - 3);
    ctx.globalAlpha = 1;
  }

  // 플레이어: 방향별 행 + 걷기 4프레임 / 대기 2프레임(숨쉬기)
  function witch(ctx, p, t) {
    const ch = PK.atlas.characters.witch;
    const name = p.moving
      ? WALK[Math.floor(p.walkTime * PK.config.WALK_FPS) % WALK.length]
      : (t % 1.4 < 0.7 ? 'idle0' : 'idle1');
    const fx = Math.round(p.x + p.w / 2), fy = Math.round(p.y + p.h);
    shadow(ctx, fx, fy);
    PK.sprites.frame(ctx, 'witch', ch.rows[p.dir], ch.frames.indexOf(name), fx - 12, fy - 35);
  }

  // NPC: 숨쉬기 + 가끔 눈 깜빡임(베리는 윙크)
  function npc(ctx, n, t) {
    const ch = PK.atlas.characters.npcs;
    const off = n.id === 'momo' ? 0 : 1.1;
    const tt = t + off;
    let name, dy = 0;
    if (n.pet) {
      // 쓰다듬기 반응: 2프레임 반복 + 주민별 모션
      const pt = n.pet.t;
      name = Math.floor(pt / 0.18) % 2 ? 'pet1' : 'pet0';
      if (n.id === 'cherry') dy = -Math.round(Math.abs(Math.sin(pt * Math.PI * 3)) * 5);   // 통통 점프
      else if (n.id === 'momo') dy = -Math.round(Math.abs(Math.sin(pt * Math.PI * 2)) * 2);
      else if (n.id === 'lumi') dy = -3 - Math.round(Math.abs(Math.sin(pt * Math.PI * 4)) * 2); // 파닥이며 떠오름
    } else if (n.walking) {
      name = Math.floor(t * 8) % 2 ? 'idle1' : 'idle0';   // 걷는 중에는 통통 튀며 이동
    } else {
      name = tt % 3.3 < 0.16 ? 'blink' : (tt % 1.6 < 0.8 ? 'idle0' : 'idle1');
    }
    // 루미는 항상 살짝 떠 있다
    if (n.id === 'lumi' && !n.pet) dy = -2 - (Math.floor(t * 2) % 2);
    shadow(ctx, n.x, n.y);
    PK.sprites.frame(ctx, 'npcs', ch.rows[n.id], ch.frames.indexOf(name), n.x - 12, n.y - 35 + dy);
  }

  PK.drawCharacters = { witch, npc };
})();
