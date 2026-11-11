PK.systems = PK.systems || {};

// 가까운 NPC / 아이템 / 문 / 사물을 찾아 프롬프트를 띄우고, E 로 실행
PK.interact = {
  find(state, world) {
    const p = state.player;
    const f = PK.game.feet(p);
    const R = PK.config.INTERACT_RANGE;
    const near = [];
    const dist = (x, y) => Math.hypot(x - f.x, y - f.y);
    const grow = (r, g) => ({ x: r.x - g, y: r.y - g, w: r.w + g * 2, h: r.h + g * 2 });
    const overlap = PK.collision.rectsOverlap;

    for (const n of world.npcs) {
      const pos = PK.game.npcPos(state, n);
      const d = dist(pos.x, pos.y - 2);
      if (d <= R) near.push({ kind: 'npc', id: n.id, d, label: `${PK.data.speakers[n.id].name}와 대화하기`, x: pos.x, y: pos.y - 36 });
    }
    for (const st of world.stations || []) {
      if (overlap(p, grow(st.rect, 4))) {
        near.push({ kind: 'station', id: st.id, d: 2, label: PK.brew.label(state), x: st.rect.x + st.rect.w / 2, y: st.rect.y - 34 });
      }
    }
    for (const it of world.pickups) {
      if (state.world.collected[it.id]) continue;
      const name = Array.isArray(it.sprite) ? it.sprite[0] : it.sprite;
      const [, , w, h] = PK.atlas.sprites[name];
      const cx = it.x + w / 2, cy = it.y + h - 2;
      const d = dist(cx, cy);
      if (d <= R) {
        const ok = !it.requires || PK.requirements[it.requires](state);
        near.push({ kind: 'pickup', id: it.id, d, label: ok ? `${PK.data.items[it.item].name} 줍기` : '살펴보기', x: cx, y: it.y - 4 });
      }
    }
    for (const door of world.doors || []) {
      if (overlap(p, grow(door.trigger, 4))) near.push({ kind: 'door', id: door.id, d: 0, label: door.label, x: door.trigger.x + door.trigger.w / 2, y: door.trigger.y - 30 });
    }
    for (const s of world.signs) {
      if (overlap(p, grow(s.rect, 4))) near.push({ kind: 'sign', id: s.id, d: 1, label: s.label, x: s.rect.x + s.rect.w / 2, y: s.rect.y - 14 });
    }
    near.sort((a, b) => a.d - b.d);
    return near[0] || null;
  },

  activate(state, target, world) {
    if (target.kind === 'npc') {
      const n = world.npcs.find((it) => it.id === target.id);
      const pos = PK.game.npcPos(state, n);
      const f = PK.game.feet(state.player);
      // 플레이어 쪽을 바라봄
      state.npcs[n.id].facing = Math.abs(f.x - pos.x) > Math.abs(f.y - pos.y) ? (f.x < pos.x ? 'left' : 'right') : (f.y < pos.y ? 'up' : 'down');
      PK.dialogue.talkTo(state, n.id);
    } else if (target.kind === 'station') {
      if (target.id === 'cauldron') PK.brew.interact(state);
    } else if (target.kind === 'pickup') {
      const it = world.pickups.find((x) => x.id === target.id);
      if (it.requires && !PK.requirements[it.requires](state)) {
        PK.dialogue.start(state, [{ who: null, text: it.lockedText || '아직은 주울 수 없을 것 같다.' }]);
        return;
      }
      if (PK.actions.addItem(state, it.item, 1)) {
        state.world.collected[it.id] = true;
        PK.actions.onPickup(state, it.item);
      }
    } else if (target.kind === 'door') {
      PK.scene.go(state, world.doors.find((d) => d.id === target.id));
    } else if (target.kind === 'sign') {
      const s = world.signs.find((x) => x.id === target.id);
      PK.dialogue.start(state, s.lines.map((text) => ({ who: null, text })));
    }
  },
};

PK.systems.interaction = function (state, input, dt, world) {
  const ui = state.ui;
  if (PK.game.busy(state)) { ui.prompt = null; return; }
  const target = PK.interact.find(state, world);
  ui.prompt = target;
  if (target && target.kind === 'npc') target.pet = !!PK.pet.REACTIONS[target.id];

  // P (또는 터치 ♥) = 쓰다듬기 — 대화(E)와 별개
  const petPressed = input.justPressed.pet || input.actions.some((a) => a.type === 'pet');
  if (target && target.pet && petPressed) {
    PK.game.consume(input, 'pet');
    PK.pet.start(state, target.id);
    return;
  }
  if (target && input.justPressed.interact) {
    PK.game.consume(input, 'interact');
    PK.interact.activate(state, target, world);
    ui.prompt = null;
  }
};
