window.PK = window.PK || {};

PK.config = {
  TILE: 16,
  WIDTH: 320,           // 논리 해상도 = 픽셀 아트 1도트 (20 x 15 타일)
  HEIGHT: 240,          // 화면에는 CSS 로 정수배 확대 (image-rendering: pixelated)
  PLAYER_SPEED: 78,     // 도트/초
  MAX_DT: 0.05,         // 탭 전환 후 순간이동 방지
  INTERACT_RANGE: 20,   // 발 기준 상호작용 거리
  WALK_FPS: 8,
  TYPE_SPEED: 38,       // 대화 글자/초
  DECO_GRID: 8,         // 가구 배치 격자
  DECO_MAX: 16,

  // e.code 기준이라 한글 입력 상태에서도 동작함
  KEYS: {
    up: ['KeyW', 'ArrowUp'],
    down: ['KeyS', 'ArrowDown'],
    left: ['KeyA', 'ArrowLeft'],
    right: ['KeyD', 'ArrowRight'],
    interact: ['KeyE', 'Space', 'Enter'],
    pet: ['KeyP'],
    inventory: ['KeyI'],
    decorate: ['KeyF'],
    move: ['KeyM'],
    remove: ['KeyX', 'Delete', 'Backspace'],
    cancel: ['Escape'],
    debug: ['Backquote'],
  },
};
