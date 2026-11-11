PK.data = PK.data || {};
PK.data.worlds = PK.data.worlds || {};

// 마녀의 집 내부 (320 x 240 = 한 화면). 가구는 state.house.furniture 에 있다
PK.data.worlds.house = {
  width: 320,
  height: 240,
  bounds: { x: 6, y: 62, w: 308, h: 176 },
  ground: 'room',
  tiles: { wall: 'wall', wainscot: 'wainscot', floor: 'floor', lace: 'lace' },
  wallHeight: 64,                                // 벽지 + 몰딩

  // 가구를 놓을 수 있는 바닥 / 출입구 앞은 비워둔다
  floorRect: { x: 8, y: 64, w: 304, h: 168 },
  reserved: [{ x: 136, y: 212, w: 48, h: 28 }],

  objects: [
    { sprite: 'window', x: 138, y: 6, layer: 'wall' },
    { sprite: 'curtain', x: 126, y: 4, layer: 'wall' },
    { sprite: 'curtain', x: 180, y: 4, layer: 'wall', flip: true },
    { sprite: 'hangStar', x: 40, y: 8, layer: 'wall' },
    { sprite: 'hangStar', x: 92, y: 8, layer: 'wall', swing: 1 },
    { sprite: 'hangStar', x: 226, y: 8, layer: 'wall', swing: 2 },
    { sprite: 'hangStar', x: 276, y: 8, layer: 'wall' },
    { sprite: 'doorMat', x: 144, y: 226, layer: 'ground' },
  ],

  npcs: [],
  pickups: [],
  doors: [
    { id: 'houseExit', label: '밖으로 나가기', trigger: { x: 144, y: 228, w: 32, h: 12 }, walkDir: 'down',
      to: 'village', spawn: { x: 58, y: 124, dir: 'down' } },
  ],
  signs: [],
  decor: [],
  paths: [],
};
