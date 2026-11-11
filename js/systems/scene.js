PK.systems = PK.systems || {};

// 장면 전환 (마을 ↔ 집). 화면이 살짝 어두워졌다가 밝아진다
PK.scene = {
  DURATION: 0.5,
  go(state, door) {
    if (state.ui.fade) return;
    state.ui.fade = { t: 0, to: door.to, spawn: door.spawn, switched: false };
    state.player.moving = false;
  },
};

PK.systems.scene = function (state, input, dt, world) {
  const f = state.ui.fade;
  if (f) {
    f.t += dt;
    if (!f.switched && f.t >= PK.scene.DURATION / 2) {
      f.switched = true;
      state.scene = f.to;
      const p = state.player;
      p.x = f.spawn.x;
      p.y = f.spawn.y;
      p.dir = f.spawn.dir;
      state.ui.prompt = null;
    }
    if (f.t >= PK.scene.DURATION) state.ui.fade = null;
    return;
  }
  if (PK.game.busy(state)) return;

  // 문 쪽으로 걸어가면 바로 들어간다
  const p = state.player;
  for (const door of world.doors) {
    if (door.walkDir && input[door.walkDir] && PK.collision.rectsOverlap(p, door.trigger)) {
      PK.scene.go(state, door);
      return;
    }
  }
};

// 카메라: 플레이어를 따라가되 맵 밖은 보이지 않게
// 화면(view)이 맵보다 크면(작은 방 등) 맵을 화면 가운데에 둔다
PK.systems.camera = function (state) {
  const world = PK.data.worlds[state.scene];
  const v = state.view || { w: PK.config.WIDTH, h: PK.config.HEIGHT };
  const f = PK.game.feet(state.player);
  const axis = (focus, size, view) => (size <= view
    ? Math.floor((size - view) / 2)
    : Math.round(Math.max(0, Math.min(size - view, focus - view / 2))));
  state.camera.x = axis(f.x, world.width, v.w);
  state.camera.y = axis(f.y - 16, world.height, v.h);
};
