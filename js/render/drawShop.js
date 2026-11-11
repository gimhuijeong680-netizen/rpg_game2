// 포션 가게의 상태별 오브젝트와 포션 제작 연출 (state 는 읽기만 한다)
(function () {
  const P = PK.palette;

  function px(ctx, x, y, color, w = 1, h = 1) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  }

  // 가마솥: 몸통 + 상태별 물약 + 보글보글 거품 + 제작 연출
  function cauldron(ctx, o, state, t) {
    PK.sprites.draw(ctx, 'cauldron', o.x, o.y);
    const kind = PK.brew.liquid(state);
    PK.sprites.draw(ctx, `liquid${kind}${Math.floor(t * 3) % 2}`, o.x + 8, o.y + 9);

    const cx = o.x + 24, top = o.y + 10;
    const hi = { Lav: P.lavPale, Moon: P.skyPale, Pink: P.pink, Glow: P.white, Done: P.pinkPale }[kind];
    const count = { Lav: 2, Moon: 3, Pink: 4, Glow: 6, Done: 1 }[kind];
    // 위로 올라가는 거품 (단계가 진행될수록 많아짐)
    for (let i = 0; i < count; i++) {
      const ph = (t * (0.7 + i * 0.13) + i / count) % 1;
      const x = cx - 11 + ((i * 7) % 22);
      const y = top - ph * 16;
      const size = ph < 0.6 ? 2 : 1;
      px(ctx, x, y, hi, size, size);
      if (size === 2) px(ctx, x, y, P.white);
    }
    if (kind === 'Done' && Math.floor(t * 1.5) % 3 === 0) {
      PK.sprites.draw(ctx, 'heartFx', cx - 2, top - 8 - ((t * 10) % 8));
    }
  }

  // 포션 진열 선반: 완성 후 분홍 포션이 빈 칸에 진열된다
  function potionShelf(ctx, o, state, t) {
    PK.sprites.draw(ctx, 'potionShelf', o.x, o.y);
    if (state.events.moonPotion.status === 'COMPLETED') {
      PK.sprites.draw(ctx, 'sweetPotionSmall', o.x + 30, o.y + 35);
      if (Math.floor(t * 2) % 2) PK.sprites.draw(ctx, 'sparkle0', o.x + 36, o.y + 31);
    }
  }

  // 제작 연출 (가마솥 위에 겹쳐 그림)
  function brewFx(ctx, state, world, t) {
    const b = state.ui.brew;
    const o = world.objects.find((it) => it.special === 'cauldron');
    if (!o) return;
    const cx = o.x + 24, cy = o.y + 12;

    if (b && b.anim) {
      const a = b.anim.t;
      if (b.anim.kind === 'add') {
        // 달빛 꽃 3송이가 플레이어 쪽에서 포물선을 그리며 가마솥으로 퐁당
        const p = state.player;
        const sx = p.x + p.w / 2, sy = p.y - 26;
        for (let k = 0; k < 3; k++) {
          const u = (a - k * 0.3) / 0.6;
          if (u > 0 && u < 1) {
            const x = sx + (cx - sx) * u;
            const y = sy + (cy - sy) * u - Math.sin(u * Math.PI) * 26;
            PK.sprites.draw(ctx, 'iconMoonFlower', x - 8, y - 8);
          } else if (u >= 1 && u < 1.5) {
            const s = (u - 1) * 10;
            for (const [dx, dy] of [[-1, -1], [1, -1], [-1.5, 0], [1.5, 0]]) px(ctx, cx + dx * (4 + s), cy - 2 + dy * (3 + s), P.skyPale, 2, 2);
          }
        }
      } else if (b.anim.kind === 'stir') {
        // 국자가 좌우로 휘젓고, 물약 표면에 소용돌이
        const pos = [-9, -3, 4, 9, 4, -3];
        const k = Math.floor(a * 11) % pos.length;
        PK.sprites.draw(ctx, 'ladle', cx + pos[k] - 4, cy - 18);
        for (let i = 0; i < 10; i++) {
          const ang = a * 12 + (i / 10) * Math.PI * 2;
          px(ctx, cx + Math.cos(ang) * 12, cy + 2 + Math.sin(ang) * 2.6, P.white);
        }
      } else if (b.anim.kind === 'magic') {
        // 분홍 마법 링 + 반짝이는 별과 하트가 퍼져 나감
        const dur = PK.brew.STEPS[2].dur;
        const ring = Math.min(1, a / 1.2);
        if (a < 1.4) {
          const rx = 6 + ring * 30, ry = 2 + ring * 10;
          for (let i = 0; i < 36; i++) {
            const ang = (i / 36) * Math.PI * 2;
            px(ctx, cx + Math.cos(ang) * rx, cy + 4 + Math.sin(ang) * ry, i % 2 ? P.pinkMid : P.pink);
          }
        }
        for (let i = 0; i < 12; i++) {
          const ang = (i / 12) * Math.PI * 2 + i;
          const r = 6 + a * (14 + (i % 4) * 5);
          const x = cx + Math.cos(ang) * r * 1.3;
          const y = cy - a * 22 + Math.sin(ang) * r * 0.6;
          if (a > dur) continue;
          if (i % 3 === 0) PK.sprites.draw(ctx, 'heartFx', x - 2, y - 2);
          else PK.sprites.draw(ctx, (Math.floor(a * 8) + i) % 2 ? 'sparkle0' : 'sparkle1', x - 3, y - 3);
        }
        // 완성된 포션이 떠오름
        if (a > 1.2) {
          const rise = Math.min(1, (a - 1.2) / 0.8);
          PK.sprites.draw(ctx, 'iconSweetPotion', cx - 8, cy - 10 - rise * 22);
        }
      }
    }
    // 결과 화면이 떠 있는 동안 포션이 가마솥 위에서 반짝
    if (b && b.result) {
      PK.sprites.draw(ctx, 'iconSweetPotion', cx - 8, cy - 32 + Math.round(Math.sin(t * 3)));
      PK.sprites.draw(ctx, Math.floor(t * 4) % 2 ? 'sparkle0' : 'sparkle1', cx + 6, cy - 36);
    }
  }

  PK.drawShop = { cauldron, potionShelf, brewFx };
})();
