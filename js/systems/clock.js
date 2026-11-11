PK.systems = PK.systems || {};

// 게임 시간 (1초 = 게임 2분) + 알림 타이머
PK.systems.clock = function (state, input, dt) {
  state.time += dt;

  if (!state.ui.dialog && !state.ui.fade) {
    const c = state.clock;
    c.minutes += dt * 2;
    if (c.minutes >= 24 * 60) {
      c.minutes = 6 * 60;
      c.day += 1;
    }
  }

  const toasts = state.ui.toasts;
  for (const t of toasts) t.t -= dt;
  while (toasts.length && toasts[0].t <= 0) toasts.shift();
};
