// 저장 / 불러오기 (브라우저 localStorage)
// 진행 상태(위치, 퀘스트, 이벤트, 인벤토리, 집 가구, 시간)만 저장. 화면 UI 상태는 저장하지 않는다
PK.save = {
  KEY: 'pinkle-save-v1',
  VERSION: 1,
  SLICES: ['scene', 'player', 'npcs', 'quest', 'events', 'inventory', 'world', 'house', 'clock'],
  last: null,

  serialize(state) {
    const out = { v: PK.save.VERSION };
    for (const k of PK.save.SLICES) out[k] = state[k];
    return JSON.stringify(out);
  },

  // 저장 데이터를 새 상태 위에 덮어쓴다 (새로 추가된 필드는 기본값 유지)
  apply(state, data) {
    if (!data || data.v !== PK.save.VERSION) return false;
    const isObj = (o) => o && typeof o === 'object' && !Array.isArray(o);
    const merge = (dst, src) => {
      for (const k of Object.keys(src)) {
        if (isObj(src[k]) && isObj(dst[k])) merge(dst[k], src[k]);
        else dst[k] = src[k];
      }
    };
    for (const k of PK.save.SLICES) {
      if (!(k in data)) continue;
      if (isObj(state[k]) && isObj(data[k])) merge(state[k], data[k]);
      else state[k] = data[k];
    }
    if (!PK.data.worlds[state.scene]) state.scene = 'village';
    state.player.moving = false;
    state.npcs.momo.moveT = 1;
    return true;
  },

  write(state) {
    try {
      const s = PK.save.serialize(state);
      if (s === PK.save.last) return;
      window.localStorage.setItem(PK.save.KEY, s);
      PK.save.last = s;
    } catch (e) { /* 저장 불가(사생활 보호 모드 등) — 게임은 계속 */ }
  },

  read() {
    try {
      const raw = window.localStorage.getItem(PK.save.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  },

  clear() {
    try { window.localStorage.removeItem(PK.save.KEY); } catch (e) { /* 무시 */ }
    PK.save.last = null;
  },
};
