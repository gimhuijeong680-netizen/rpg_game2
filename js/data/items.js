PK.data = PK.data || {};

// 아이템 정의 — 새 마법 아이템은 여기에 한 줄 추가 (아이콘은 tools/art/world.js)
PK.data.items = {
  magicFlower: { name: '마법 꽃', icon: 'iconFlower', desc: '라벤더빛으로 은은하게 빛나는 꽃. 모모가 애타게 찾고 있다.' },
  star:        { name: '별 장식', icon: 'iconStar', desc: '반짝반짝 빛나는 별 모양 장식. 마녀 모자에 달면 귀여울 것 같다.' },
  potion:      { name: '핑크 포션', icon: 'iconPotion', desc: '모모가 만든 하트 포션. 마시면 마음이 몽글몽글해진다.' },
  cookie:      { name: '딸기 쿠키', icon: 'iconCookie', desc: '베리가 갓 구운 딸기잼 쿠키. 아직 따끈하다.' },
  moonFlower:  { name: '달빛 꽃', icon: 'iconMoonFlower', desc: '달빛을 머금은 하늘색 꽃. 모모의 특별한 포션 재료.' },
  sweetPotion: { name: '분홍색 달콤한 마법 포션', icon: 'iconSweetPotion', desc: '모모와 함께 가마솥에서 만든 특별한 포션. 딸기우유처럼 달콤한 향이 난다.' },
};

PK.data.INVENTORY_SLOTS = 8;
