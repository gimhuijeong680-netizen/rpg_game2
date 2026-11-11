PK.data = PK.data || {};
PK.data.worlds = PK.data.worlds || {};

// 핑크빛 마법 마을 (480 x 352 = 30 x 22 타일, 카메라가 따라감)
// objects: sprite = 아틀라스 이름(배열이면 애니메이션), x,y = 그리기 좌상단, collider = 충돌 영역
//          layer 'ground' 오브젝트는 항상 캐릭터 아래에 그려진다
(function () {
  const objects = [];
  const add = (o) => { objects.push(o); return o; };

  // ---- 건물 ----
  add({ id: 'witchHouse', sprite: 'houseWitch', x: 28, y: 40, collider: { x: 36, y: 80, w: 56, h: 32 } });
  add({ id: 'bakery', sprite: 'shopBakery', x: 193, y: 26, collider: { x: 201, y: 62, w: 56, h: 32 } });
  add({ id: 'potionShop', sprite: 'shopPotion', x: 385, y: 48, collider: { x: 393, y: 82, w: 56, h: 34 } });

  // ---- 광장 ----
  add({ id: 'fountain', sprite: ['fountain0', 'fountain1'], fps: 3, x: 216, y: 150, collider: { x: 219, y: 170, w: 42, h: 22 } });
  add({ id: 'pond', sprite: 'pond', layer: 'ground', x: 32, y: 250,
    colliders: [{ x: 40, y: 256, w: 80, h: 44 }, { x: 34, y: 264, w: 92, h: 28 }] });

  // ---- 나무 / 덤불 ----
  const tree = (x, y, pink) => add({ sprite: pink ? 'treePink' : 'tree', x, y, collider: { x: x + 11, y: y + 30, w: 10, h: 8 } });
  tree(112, 40); tree(150, 64, true); tree(290, 34, true); tree(334, 56);
  tree(446, 128); tree(150, 214); tree(296, 246, true); tree(186, 270);
  tree(250, 302); tree(0, 300); tree(132, 312, true); tree(-6, 124, true);
  const bush = (x, y) => add({ sprite: 'bush', x, y, collider: { x: x + 2, y: y + 6, w: 16, h: 7 } });
  bush(104, 98); bush(10, 98); bush(176, 102); bush(282, 100); bush(458, 100); bush(310, 214);

  // ---- 소품 ----
  const lamp = (x, y) => add({ sprite: 'lamp', x, y, collider: { x: x + 3, y: y + 29, w: 6, h: 5 } });
  lamp(166, 98); lamp(302, 98); lamp(166, 220);
  add({ id: 'witchSign', sprite: 'sign', x: 90, y: 112, collider: { x: 96, y: 124, w: 6, h: 5 } });
  add({ id: 'mailbox', sprite: 'mailbox', x: 18, y: 104, collider: { x: 21, y: 118, w: 6, h: 5 } });

  // ---- 꽃밭 울타리 (가운데 위쪽은 입구) ----
  const fenceH = (x, y) => add({ sprite: 'fenceH', x, y, collider: { x, y: y + 8, w: 16, h: 6 } });
  const fenceV = (x, y) => add({ sprite: 'fenceV', x, y, collider: { x: x + 5, y, w: 6, h: 16 } });
  for (const x of [336, 384, 400, 416, 432, 448]) fenceH(x, 232);
  for (let x = 336; x <= 448; x += 16) fenceH(x, 330);
  for (let y = 246; y < 330; y += 16) { fenceV(328, y); fenceV(456, y); }

  // ---- 바닥: 길 (타일 단위로 칠해짐) ----
  const paths = [
    { x: 16, y: 176, w: 448, h: 32 },   // 큰길
    { x: 176, y: 128, w: 128, h: 112 }, // 중앙 광장
    { x: 48, y: 112, w: 32, h: 64 },    // 마녀의 집 앞
    { x: 224, y: 96, w: 32, h: 32 },    // 빵집 앞
    { x: 416, y: 112, w: 32, h: 64 },   // 포션 가게 앞
    { x: 352, y: 208, w: 32, h: 32 },   // 꽃밭 입구
  ];

  PK.data.worlds.village = {
    width: 480,
    height: 352,
    bounds: { x: 2, y: 30, w: 476, h: 320 },   // 모자가 화면 밖으로 잘리지 않도록 위쪽 여유
    ground: 'grass',
    paths,
    objects,

    // 모모는 포션 가게 안에 있다 (js/data/shopMap.js)
    npcs: [
      { id: 'berry', x: 212, y: 118 },   // x,y = 발 위치
      { id: 'flora', x: 104, y: 236 },   // 연못가 풀밭
      { id: 'lumi', x: 326, y: 152 },    // 광장 오른쪽 가로등 옆
      { id: 'cherry', x: 132, y: 150 },  // 마녀의 집 옆 나무 아래
    ],

    // 줍는 아이템 (requires: 퀘스트 단계 조건)
    pickups: [
      { id: 'flower1', item: 'magicFlower', sprite: ['magicFlower0', 'magicFlower1'], x: 412, y: 280, requires: 'questAsked',
        lockedText: '라벤더빛으로 반짝이는 신비한 꽃이다. 누군가 찾고 있는 꽃일지도…?' },
      { id: 'star1', item: 'star', sprite: 'starItem', x: 150, y: 278 },
      // 이벤트: 달빛 꽃 3송이 (모모의 부탁을 받은 뒤에만 주울 수 있음)
      { id: 'moon1', item: 'moonFlower', sprite: ['moonFlower0', 'moonFlower1'], x: 350, y: 256, requires: 'moonCollecting',
        lockedText: '달빛을 머금은 하늘색 꽃이 피어 있다. 지금은 그냥 바라만 보자.' },
      { id: 'moon2', item: 'moonFlower', sprite: ['moonFlower0', 'moonFlower1'], x: 432, y: 254, requires: 'moonCollecting',
        lockedText: '달빛을 머금은 하늘색 꽃이 피어 있다. 지금은 그냥 바라만 보자.' },
      { id: 'moon3', item: 'moonFlower', sprite: ['moonFlower0', 'moonFlower1'], x: 372, y: 306, requires: 'moonCollecting',
        lockedText: '달빛을 머금은 하늘색 꽃이 피어 있다. 지금은 그냥 바라만 보자.' },
    ],

    // 문: 걸어 들어가거나(walkDir) E 로 이동
    doors: [
      { id: 'witchDoor', label: '집에 들어가기', trigger: { x: 56, y: 110, w: 16, h: 10 }, walkDir: 'up',
        to: 'house', spawn: { x: 154, y: 206, dir: 'up' } },
      { id: 'shopDoor', label: '포션 가게 들어가기', trigger: { x: 424, y: 114, w: 16, h: 8 }, walkDir: 'up',
        to: 'shop', spawn: { x: 154, y: 206, dir: 'up' } },
    ],

    // 말 거는 사물
    signs: [
      { id: 'witchSign', label: '팻말 읽기', rect: { x: 90, y: 118, w: 18, h: 14 },
        lines: ['「 꼬마 마녀의 집 」 — 노크는 세 번, 쿠키는 언제나 환영!'] },
      { id: 'mailbox', label: '우편함 보기', rect: { x: 16, y: 112, w: 16, h: 14 },
        lines: ['우편함이 비어 있다. 내일은 편지가 올까?'] },
      { id: 'bakeryDoor', label: '빵집 문', rect: { x: 230, y: 90, w: 20, h: 10 },
        lines: ['베리의 작은 빵집. 문틈으로 고소한 빵 냄새가 솔솔 난다.'] },
      { id: 'fountainWish', label: '소원 빌기', rect: { x: 216, y: 188, w: 48, h: 10 },
        lines: ['분수에 조용히 소원을 빌었다. 물방울이 반짝 빛난 것 같다!'] },
    ],

    // 충돌 없는 바닥 장식 (꽃, 풀, 돌) — 아래에서 자동 배치
    decor: [],
  };

  // ---- 바닥 장식 자동 배치 (길·충돌 영역을 피해서, 매번 같은 결과) ----
  const world = PK.data.worlds.village;
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  const hit = (x, y, w, h, list) => list.some((r) => x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y);
  const blocked = [];
  for (const o of objects) {
    if (o.collider) blocked.push(o.collider);
    if (o.colliders) blocked.push(...o.colliders);
  }
  blocked.push({ x: 32, y: 250, w: 96, h: 56 });     // 연못 전체
  const kinds = ['flowerPink', 'flowerWhite', 'flowerLav', 'tuft', 'tuft', 'rock', 'flowerPink'];
  for (let i = 0; i < 110; i++) {
    const x = Math.floor(rnd() * 470), y = 34 + Math.floor(rnd() * 310);
    if (hit(x - 2, y - 2, 11, 11, paths) || hit(x, y, 7, 7, blocked)) continue;
    if (x > 330 && x < 460 && y > 238 && y < 334) continue;   // 꽃밭은 따로
    world.decor.push({ sprite: kinds[Math.floor(rnd() * kinds.length)], x, y });
  }
  // 꽃밭: 분홍/하양/라벤더 꽃을 줄지어
  for (let y = 252; y < 326; y += 10) {
    for (let x = 344; x < 452; x += 10) {
      // 마법 꽃 / 달빛 꽃 자리는 비워둔다
      if ([[416, 288], [354, 262], [436, 260], [376, 312]].some(([fx, fy]) => Math.abs(x - fx) < 13 && Math.abs(y - fy) < 13)) continue;
      const k = ['flowerPink', 'flowerWhite', 'flowerLav'][((x + y) / 10) % 3 | 0];
      world.decor.push({ sprite: k, x: x + ((y / 10) % 2) * 4, y });
    }
  }
})();
