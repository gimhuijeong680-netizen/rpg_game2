PK.systems = PK.systems || {};

// 집 꾸미기: 가구 선택 → 배치 / 기존 가구 선택 → 이동 · 삭제
// 마우스(터치) 클릭과 키보드(방향키 커서 + E) 모두 지원
PK.deco = {
  start(state) {
    state.ui.deco = {
      mode: 'browse',        // browse | place | move
      type: null,            // place: 놓을 가구 종류
      sel: null,             // 선택된 가구 uid
      moving: null,          // move: { uid, type, from: {x,y} }
      cursor: { x: 160, y: 150 },
      ghost: null,           // { type, x, y, valid }
    };
  },

  exit(state) {
    state.ui.deco = null;
  },

  // 커서가 발밑 중앙에 오도록 스프라이트 좌상단 계산 (격자 스냅)
  ghostPos(type, cursor) {
    const def = PK.data.furniture[type];
    const g = PK.config.DECO_GRID;
    const x = Math.round((cursor.x - def.w / 2) / g) * g;
    const y = Math.round((cursor.y - def.foot.y - def.foot.h / 2) / g) * g;
    return { x, y };
  },

  // 배치 가능 여부: 바닥 안 / 출입구 비움 / 다른 가구와 겹침 없음 / 플레이어와 겹침 없음
  canPlace(state, type, x, y, ignoreUid) {
    const world = PK.data.worlds.house;
    const def = PK.data.furniture[type];
    const r = PK.game.footRect({ type }, x, y);
    const F = world.floorRect;
    if (r.x < F.x || r.y < F.y || r.x + r.w > F.x + F.w || r.y + r.h > F.y + F.h) return false;
    // 스프라이트가 방 밖(좌우)으로 삐져나가지 않도록
    if (x < 0 || x + def.w > world.width || y < 0) return false;
    const overlap = PK.collision.rectsOverlap;
    if (world.reserved.some((z) => overlap(r, z))) return false;
    for (const f of state.house.furniture) {
      if (f.uid === ignoreUid) continue;
      const other = PK.data.furniture[f.type];
      if (!!other.floor !== !!def.floor) continue;   // 러그 위에는 가구를 올릴 수 있다
      if (overlap(r, PK.game.footRect(f))) return false;
    }
    if (!def.floor && overlap(r, state.player)) return false;
    return true;
  },

  // 커서 아래 가구 (위에 그려진 것 우선, 러그는 마지막)
  hitTest(state, pt) {
    const list = state.house.furniture.slice().sort((a, b) => {
      const fa = PK.data.furniture[a.type].floor ? 0 : 1, fb = PK.data.furniture[b.type].floor ? 0 : 1;
      if (fa !== fb) return fb - fa;
      return (b.y + PK.data.furniture[b.type].h) - (a.y + PK.data.furniture[a.type].h);
    });
    return list.find((f) => {
      const def = PK.data.furniture[f.type];
      return pt.x >= f.x && pt.x < f.x + def.w && pt.y >= f.y && pt.y < f.y + def.h;
    }) || null;
  },

  pick(state, type) {
    const d = state.ui.deco;
    if (d.moving) PK.deco.cancelMove(state);
    if (state.house.furniture.length >= PK.config.DECO_MAX) {
      PK.actions.toast(state, '방이 가득 찼어요! 가구를 하나 치워주세요.', 'iconHouse');
      return;
    }
    d.mode = 'place';
    d.type = type;
    d.sel = null;
  },

  startMove(state) {
    const d = state.ui.deco;
    const f = state.house.furniture.find((it) => it.uid === d.sel);
    if (!f) return;
    d.mode = 'move';
    d.moving = { uid: f.uid, type: f.type, from: { x: f.x, y: f.y } };
    const def = PK.data.furniture[f.type];
    d.cursor = { x: f.x + def.w / 2, y: f.y + def.foot.y + def.foot.h / 2 };
  },

  cancelMove(state) {
    const d = state.ui.deco;
    d.moving = null;
    d.mode = 'browse';
  },

  remove(state) {
    const d = state.ui.deco;
    const i = state.house.furniture.findIndex((it) => it.uid === d.sel);
    if (i < 0) return;
    const [f] = state.house.furniture.splice(i, 1);
    d.sel = null;
    d.moving = null;
    d.mode = 'browse';
    const name = PK.data.furniture[f.type].name;
    const code = name.charCodeAt(name.length - 1) - 0xac00;
    PK.actions.toast(state, `${name}${code >= 0 && code % 28 ? '을' : '를'} 치웠어요`, 'iconHouse');
  },

  click(state) {
    const d = state.ui.deco;
    if (d.mode === 'place' || d.mode === 'move') {
      const g = d.ghost;
      if (!g || !g.valid) {
        PK.actions.toast(state, '여기에는 놓을 수 없어요', 'iconHouse');
        return;
      }
      if (d.mode === 'place') {
        const uid = state.house.nextUid++;
        state.house.furniture.push({ uid, type: d.type, x: g.x, y: g.y });
        d.sel = uid;
        PK.actions.toast(state, `${PK.data.furniture[d.type].name} 배치 완료!`, 'iconHouse');
      } else {
        const f = state.house.furniture.find((it) => it.uid === d.moving.uid);
        f.x = g.x; f.y = g.y;
        d.sel = f.uid;
        d.moving = null;
      }
      d.mode = 'browse';
      d.type = null;
      return;
    }
    const hit = PK.deco.hitTest(state, d.cursor);
    d.sel = hit ? hit.uid : null;
  },
};

PK.systems.decorate = function (state, input) {
  const ui = state.ui;
  const jp = input.justPressed;
  const toggle = jp.decorate || input.actions.some((a) => a.type === 'decoToggle');

  if (!ui.deco) {
    if (toggle && state.scene === 'house' && !ui.dialog && !ui.inventoryOpen && !ui.fade) {
      PK.deco.start(state);
      PK.game.consume(input, 'decorate', 'interact');
    }
    return;
  }
  if (state.scene !== 'house') { PK.deco.exit(state); return; }
  const d = ui.deco;

  if (toggle) {
    PK.deco.exit(state);
    PK.game.consume(input, 'decorate', 'interact');
    return;
  }

  for (const a of input.actions) {
    if (a.type === 'decoPick') PK.deco.pick(state, a.furniture);
    else if (a.type === 'decoMove') PK.deco.startMove(state);
    else if (a.type === 'decoDelete') PK.deco.remove(state);
    else if (a.type === 'decoCancel') { if (d.moving) PK.deco.cancelMove(state); d.mode = 'browse'; d.type = null; }
    else if (a.type === 'decoPointer') {
      d.cursor = { x: a.x, y: a.y };
      if (a.click) { PK.deco.updateGhost(state); PK.deco.click(state); }
    }
  }

  // 키보드: 방향키로 커서 이동, E 로 클릭, M 이동, X 삭제, Esc 취소/종료
  const g = PK.config.DECO_GRID;
  if (jp.left) d.cursor.x -= g;
  if (jp.right) d.cursor.x += g;
  if (jp.up) d.cursor.y -= g;
  if (jp.down) d.cursor.y += g;
  d.cursor.x = Math.max(0, Math.min(319, d.cursor.x));
  d.cursor.y = Math.max(40, Math.min(239, d.cursor.y));

  if (jp.move && d.sel != null) PK.deco.startMove(state);
  if (jp.remove && d.sel != null && d.mode === 'browse') PK.deco.remove(state);
  PK.deco.updateGhost(state);
  if (jp.interact) PK.deco.click(state);
  if (jp.cancel) {
    if (d.mode === 'move') PK.deco.cancelMove(state);
    else if (d.mode === 'place') { d.mode = 'browse'; d.type = null; }
    else if (d.sel != null) d.sel = null;
    else PK.deco.exit(state);
  }
  PK.game.consume(input, 'interact', 'cancel', 'inventory');
};

PK.deco.updateGhost = function (state) {
  const d = state.ui.deco;
  if (!d) return;
  const type = d.mode === 'place' ? d.type : d.mode === 'move' ? d.moving.type : null;
  if (!type) { d.ghost = null; return; }
  const pos = PK.deco.ghostPos(type, d.cursor);
  d.ghost = { type, x: pos.x, y: pos.y, valid: PK.deco.canPlace(state, type, pos.x, pos.y, d.moving && d.moving.uid) };
};
