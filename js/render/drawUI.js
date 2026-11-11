// 월드 안에 그리는 작은 UI (말풍선, E 키, 꾸미기 고스트). 글자는 DOM UI(js/ui)가 담당
(function () {
  const P = PK.palette;

  // 1px 픽셀 사각 테두리
  function box(ctx, r, color) {
    ctx.fillStyle = color;
    ctx.fillRect(r.x, r.y, r.w, 1);
    ctx.fillRect(r.x, r.y + r.h - 1, r.w, 1);
    ctx.fillRect(r.x, r.y, 1, r.h);
    ctx.fillRect(r.x + r.w - 1, r.y, 1, r.h);
  }

  function npcBubbles(ctx, state, world, t) {
    const target = state.ui.prompt;
    for (const n of world.npcs) {
      if (target && target.kind === 'npc' && target.id === n.id) continue;
      if (state.ui.brew || state.ui.pets[n.id]) continue;
      let bubble = null;
      const stage = state.quest.lostFlower.stage;
      if (n.id === 'momo') {
        const ev = state.events.moonPotion;
        const need = PK.data.quests.moonPotion.need;
        if (stage === 'found') bubble = 'bubbleFlower';
        else if (ev.status === 'NOT_STARTED') bubble = 'bubbleExcl';
        else if (ev.status === 'COLLECTING') bubble = PK.actions.count(state, 'moonFlower') >= need ? 'bubbleFlower' : 'bubbleDots';
        else if (ev.status === 'READY_TO_BREW' || ev.status === 'BREWING') bubble = 'bubbleHeart';
        else if (stage === 'none') bubble = 'bubbleExcl';
        else if (stage === 'done') bubble = 'bubbleHeart';
      } else if (n.id === 'berry' && !state.npcs.berry.gaveCookie) {
        bubble = 'bubbleHeart';
      }
      if (bubble) {
        const pos = PK.game.npcPos(state, n);
        const bob = Math.round(Math.sin(t * 4 + pos.x) * 1);
        PK.sprites.draw(ctx, bubble, pos.x - 6, pos.y - 48 + bob);
      }
    }
  }

  function prompt(ctx, state, t) {
    const pr = state.ui.prompt;
    if (!pr || PK.game.busy(state)) return;
    const bob = Math.round(Math.sin(t * 6) * 1);
    let y = pr.y - 12;
    if (pr.kind === 'npc') y = pr.y - 12;
    if (pr.pet && !state.ui.pets[pr.id]) {
      // 대화(E) + 쓰다듬기(♥) 둘 다 가능
      PK.sprites.draw(ctx, 'keyE', Math.round(pr.x) - 11, Math.round(y) + bob);
      PK.sprites.draw(ctx, 'bubbleHeart', Math.round(pr.x) + 1, Math.round(y) - 1 + bob);
    } else if (!pr.pet) {
      PK.sprites.draw(ctx, 'keyE', Math.round(pr.x) - 5, Math.round(y) + bob);
    }
  }

  // 쓰다듬기 효과: 핑크 하트가 퐁퐁 떠올라 사라지고, 별이 반짝
  function petFx(ctx, state, world) {
    for (const n of world.npcs) {
      const r = state.ui.pets[n.id];
      if (!r) continue;
      const pos = PK.game.npcPos(state, n);
      const top = pos.y - 32;
      for (let i = 0; i < 5; i++) {
        const local = (r.t - i * 0.13) / 0.95;
        if (local <= 0 || local >= 1) continue;
        const x = pos.x - 11 + i * 5 + Math.round(Math.sin(local * 7 + i) * 2);
        const y = top - Math.round(local * 20) - (i % 2) * 3;
        ctx.globalAlpha = local > 0.65 ? 1 - (local - 0.65) / 0.35 : 1;
        PK.sprites.draw(ctx, i === 2 ? 'iconHeart' : 'heartFx', x - (i === 2 ? 4 : 2), y);
      }
      ctx.globalAlpha = 1;
      if (r.t < 1.1) {
        const k = Math.floor(r.t * 8);
        PK.sprites.draw(ctx, k % 2 ? 'sparkle0' : 'sparkle1', pos.x - 16, top + 6 - (k % 3));
        PK.sprites.draw(ctx, k % 2 ? 'sparkle1' : 'sparkle0', pos.x + 10, top + 2 + (k % 3));
      }
    }
  }

  function deco(ctx, state, t) {
    const d = state.ui.deco;
    if (!d) return;
    const world = PK.data.worlds.house;
    // 배치 가능한 바닥 안내 (점선)
    ctx.fillStyle = P.pinkMid;
    const F = world.floorRect;
    for (let x = F.x; x < F.x + F.w; x += 4) { ctx.fillRect(x, F.y, 2, 1); ctx.fillRect(x, F.y + F.h - 1, 2, 1); }
    for (let y = F.y; y < F.y + F.h; y += 4) { ctx.fillRect(F.x, y, 1, 2); ctx.fillRect(F.x + F.w - 1, y, 1, 2); }
    for (const z of world.reserved) box(ctx, z, P.rose);

    // 선택된 가구: 깜빡이는 테두리
    if (d.sel != null && d.mode === 'browse') {
      const f = state.house.furniture.find((it) => it.uid === d.sel);
      if (f) {
        const def = PK.data.furniture[f.type];
        const r = { x: f.x - 2, y: f.y - 2, w: def.w + 4, h: def.h + 4 };
        box(ctx, r, Math.floor(t * 3) % 2 ? P.pinkDeep : P.white);
        PK.sprites.draw(ctx, 'sparkle1', r.x - 3, r.y - 3);
      }
    }

    // 고스트: 반투명 가구 + 바닥 영역 (초록=가능, 빨강=불가)
    if (d.ghost) {
      const def = PK.data.furniture[d.ghost.type];
      ctx.globalAlpha = 0.7;
      PK.sprites.draw(ctx, def.sprite, d.ghost.x, d.ghost.y);
      ctx.globalAlpha = 1;
      const fr = PK.game.footRect({ type: d.ghost.type }, d.ghost.x, d.ghost.y);
      box(ctx, fr, d.ghost.valid ? P.mintDark : P.rose);
      if (!d.ghost.valid) {
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = P.rose;
        ctx.fillRect(fr.x, fr.y, fr.w, fr.h);
        ctx.globalAlpha = 1;
      }
    }

    // 커서 (+)
    const c = d.cursor;
    ctx.fillStyle = P.outline;
    ctx.fillRect(Math.round(c.x) - 3, Math.round(c.y), 7, 1);
    ctx.fillRect(Math.round(c.x), Math.round(c.y) - 3, 1, 7);
    ctx.fillStyle = P.white;
    ctx.fillRect(Math.round(c.x), Math.round(c.y), 1, 1);
  }

  function fade(ctx, state) {
    const f = state.ui.fade;
    if (!f) return;
    const k = 1 - Math.abs((f.t / PK.scene.DURATION) * 2 - 1);
    ctx.globalAlpha = Math.max(0, Math.min(1, k));
    ctx.fillStyle = P.pinkPale;
    ctx.fillRect(0, 0, state.view.w, state.view.h);
    ctx.globalAlpha = 1;
  }

  PK.drawUI = { npcBubbles, prompt, petFx, deco, fade, box };
})();
