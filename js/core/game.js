// 게임 루프 한 프레임 = 시스템들을 정해진 순서로 실행
// (렌더링과 분리되어 있어서 Node 테스트에서도 그대로 돌릴 수 있다)
PK.game = {
  // 실행 순서 고정. 새 기능은 여기에 한 줄 추가
  order: [
    'debugToggle',
    'clock',
    'dialogue',
    'banner',
    'brew',
    'npcMotion',
    'inventory',
    'decorate',
    'movement',
    'interaction',
    'pet',
    'scene',
    'camera',
  ],

  step(state, input, dt) {
    const world = PK.data.worlds[state.scene];
    for (const name of PK.game.order) PK.systems[name](state, input, dt, PK.data.worlds[state.scene] || world);
  },

  // 대화·가방·꾸미기·장면전환 중에는 이동/상호작용을 막는다
  busy(state) {
    const u = state.ui;
    return !!(u.dialog || u.inventoryOpen || u.deco || u.fade || u.brew || (u.banner && !u.banner.pending));
  },

  // NPC 현재 발 위치. spots 가 있는 NPC(모모)는 상태에 따라 이동한다
  npcPos(state, n) {
    if (!n.spots) return { x: n.x, y: n.y };
    const s = state.npcs[n.id];
    const to = n.spots[s.spot] || Object.values(n.spots)[0];
    const from = n.spots[s.from] || to;
    const t = Math.max(0, Math.min(1, s.moveT));
    const e = t * t * (3 - 2 * t);
    return { x: Math.round(from.x + (to.x - from.x) * e), y: Math.round(from.y + (to.y - from.y) * e) };
  },

  // 한 시스템이 처리한 키 입력을 뒤 시스템이 다시 쓰지 않도록
  consume(input, ...names) {
    for (const n of names) input.justPressed[n] = false;
  },

  // 현재 장면의 모든 충돌 영역
  solids(state, world) {
    const list = [];
    for (const o of world.objects) {
      if (o.collider) list.push(o.collider);
      if (o.colliders) list.push(...o.colliders);
    }
    for (const n of world.npcs) list.push(PK.game.npcCollider(PK.game.npcPos(state, n)));
    if (state.scene === 'house') {
      const moving = state.ui.deco && state.ui.deco.moving;
      for (const f of state.house.furniture) {
        const def = PK.data.furniture[f.type];
        if (def.floor || (moving && moving.uid === f.uid)) continue;
        list.push(PK.game.footRect(f));
      }
    }
    return list;
  },

  npcCollider(n) {
    return { x: n.x - 7, y: n.y - 6, w: 14, h: 6 };
  },

  footRect(f, x = f.x, y = f.y) {
    const foot = PK.data.furniture[f.type].foot;
    return { x: x + foot.x, y: y + foot.y, w: foot.w, h: foot.h };
  },

  feet(p) {
    return { x: p.x + p.w / 2, y: p.y + p.h };
  },
};
