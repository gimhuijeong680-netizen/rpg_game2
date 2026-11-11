PK.data = PK.data || {};

// 가구 카탈로그
// w,h = 스프라이트 크기 / foot = 바닥을 차지하는 영역(스프라이트 기준) — 겹침·벽·충돌 판정에 사용
// floor: true 인 가구(러그)는 바닥에 깔리므로 다른 러그와만 겹침 검사, 캐릭터가 위로 지나갈 수 있음
PK.data.furniture = {
  bed:       { name: '핑크 침대', sprite: 'bed', w: 32, h: 44, foot: { x: 1, y: 18, w: 30, h: 25 } },
  desk:      { name: '마법 책상', sprite: 'desk', w: 32, h: 32, foot: { x: 1, y: 14, w: 30, h: 17 } },
  plant:     { name: '화분', sprite: 'plant', w: 16, h: 26, foot: { x: 3, y: 17, w: 10, h: 8 } },
  rug:       { name: '하트 러그', sprite: 'rug', w: 48, h: 32, foot: { x: 1, y: 1, w: 46, h: 30 }, floor: true },
  bookshelf: { name: '책장', sprite: 'bookshelf', w: 32, h: 42, foot: { x: 1, y: 28, w: 30, h: 13 } },
};

PK.data.furnitureOrder = ['bed', 'desk', 'plant', 'rug', 'bookshelf'];
