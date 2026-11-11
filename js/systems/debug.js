PK.systems = PK.systems || {};

// ` 키로 충돌 영역 표시 on/off
PK.systems.debugToggle = function (state, input) {
  if (input.justPressed.debug) state.debug = !state.debug;
};
