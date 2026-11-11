PK.data = PK.data || {};
PK.data.worlds = PK.data.worlds || {};

// 모모의 포션 가게 내부 — 작은 마녀의 연금술 작업실 (320 x 240)
// special: 상태에 따라 다르게 그려지는 오브젝트 (js/render/drawShop.js)
PK.data.worlds.shop = {
  width: 320,
  height: 240,
  bounds: { x: 6, y: 62, w: 308, h: 176 },
  ground: 'room',
  tiles: { wall: 'shopWall', wainscot: 'shopWainscot', floor: 'shopFloor' },
  wallHeight: 64,

  objects: [
    // 벽 장식
    { sprite: 'roundWindow', x: 144, y: 8, layer: 'wall' },
    { sprite: 'garland', x: 64, y: 2, layer: 'wall' },
    { sprite: 'garland', x: 178, y: 2, layer: 'wall' },
    { sprite: 'herbs', x: 112, y: 14, layer: 'wall', swing: 1 },
    { sprite: 'herbs', x: 196, y: 14, layer: 'wall', swing: 2 },
    { sprite: 'wallSign', x: 74, y: 30, layer: 'wall' },
    { sprite: 'magicCircle', x: 116, y: 128, layer: 'ground' },
    { sprite: 'doorMat', x: 144, y: 226, layer: 'ground' },

    // 2. 왼쪽 포션 진열 선반 (완성 포션이 진열됨)
    { id: 'potionShelf', sprite: 'potionShelf', special: 'potionShelf', x: 10, y: 28, collider: { x: 11, y: 72, w: 42, h: 14 } },
    // 3. 오른쪽 재료 보관 선반
    { id: 'ingredientShelf', sprite: 'ingredientShelf', x: 266, y: 28, collider: { x: 267, y: 72, w: 42, h: 14 } },
    // 8. 모모의 작업 공간
    { id: 'momoDesk', sprite: 'momoDesk', x: 62, y: 70, collider: { x: 63, y: 86, w: 54, h: 18 } },
    // 1. 중앙 가마솥
    { id: 'cauldron', sprite: 'cauldron', special: 'cauldron', x: 136, y: 112, collider: { x: 141, y: 136, w: 38, h: 18 } },
    // 6. 작업 테이블 (+ 7. 포션병과 재료)
    { id: 'workTable', sprite: 'workTable', x: 234, y: 150, collider: { x: 235, y: 166, w: 50, h: 16 } },
    // 4. 작은 꽃병
    { sprite: 'flowerVase', x: 24, y: 138, collider: { x: 28, y: 160, w: 10, h: 8 } },
    // 5. 마법책
    { sprite: ['bookStand0', 'bookStand1'], fps: 2, x: 94, y: 162, collider: { x: 98, y: 184, w: 12, h: 6 } },
    // 7. 재료 자루 / 병 상자
    { sprite: 'sack', x: 16, y: 200, collider: { x: 18, y: 208, w: 14, h: 9 } },
    { sprite: 'sack', x: 246, y: 76, collider: { x: 248, y: 84, w: 14, h: 9 } },
    { sprite: 'bottleCrate', x: 282, y: 204, collider: { x: 283, y: 213, w: 22, h: 10 } },
    { sprite: 'plant', x: 300, y: 90, collider: { x: 303, y: 107, w: 10, h: 8 } },
  ],

  // 모모는 상태에 따라 작업 공간 ↔ 가마솥 앞을 오간다 (x,y = 발 위치)
  npcs: [
    { id: 'momo', spots: { desk: { x: 132, y: 102 }, cauldron: { x: 198, y: 152 } } },
  ],

  // 상호작용 가능한 작업대 (가마솥)
  stations: [
    { id: 'cauldron', rect: { x: 136, y: 132, w: 48, h: 26 } },
  ],

  pickups: [],
  doors: [
    { id: 'shopExit', label: '밖으로 나가기', trigger: { x: 144, y: 228, w: 32, h: 12 }, walkDir: 'down',
      to: 'village', spawn: { x: 426, y: 124, dir: 'down' } },
  ],
  signs: [
    { id: 'ingredients', label: '재료 선반 보기', rect: { x: 267, y: 86, w: 42, h: 6 },
      lines: ['유리병마다 「별사탕 가루」, 「구름 솜」, 「무지개 버섯」 같은 이름표가 붙어 있다.'] },
  ],
  decor: [],
  paths: [],
};
