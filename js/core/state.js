// 변하는 값만 상태에 둔다. 맵/아이템/대사 등 고정 데이터는 js/data/
// 상태는 영역별로 분리: player / npcs / quest / inventory / house / ui
PK.createInitialState = function () {
  return {
    scene: 'village',
    time: 0,                     // 누적 초 (애니메이션용)

    player: {
      x: 54, y: 128,             // 발 충돌 박스 좌상단
      w: 12, h: 6,
      dir: 'down',
      moving: false,
      walkTime: 0,
    },

    npcs: {
      // spot: 포션 가게 안 위치(desk | cauldron), from/moveT: 이동 연출 (0 → 1)
      // pets: 쓰다듬은 횟수
      momo: { talks: 0, pets: 0, facing: 'down', spot: 'desk', from: 'desk', moveT: 1 },
      berry: { talks: 0, pets: 0, facing: 'down', gaveCookie: false },
      flora: { talks: 0, pets: 0 },
      lumi: { talks: 0, pets: 0 },
      cherry: { talks: 0, pets: 0 },
    },

    quest: {
      lostFlower: { stage: 'none' },   // none → asked → found → done
    },

    // 이벤트: 모모와 달콤한 마법 포션
    events: {
      moonPotion: {
        status: 'NOT_STARTED',   // NOT_STARTED → COLLECTING → READY_TO_BREW → BREWING → COMPLETED
        flowers: 0,              // 맵에서 모은 달빛 꽃 수 (0~3)
        brewStep: 0,             // 0 시작 전 · 1 재료 넣음 · 2 저음 · 3 마법 넣음
        stirs: 0,                // 저어준 횟수 (3번이면 다음 단계)
        potionGiven: false,      // 포션 지급 여부 (중복 지급 방지)
        questDone: false,        // 퀘스트 완료 여부
      },
    },

    inventory: {
      items: [],                 // [{ id, count }]
    },

    world: {
      collected: {},             // 맵에서 주운 아이템 id → true
    },

    house: {
      nextUid: 3,
      furniture: [
        { uid: 1, type: 'rug', x: 136, y: 136 },
        { uid: 2, type: 'bed', x: 256, y: 56 },
      ],
    },

    clock: { day: 1, minutes: 9 * 60 },

    camera: { x: 0, y: 0 },
    view: { w: 320, h: 240 },    // 화면에 보이는 도트 수 (창 크기에 맞춰 main.js 가 갱신)

    ui: {
      prompt: null,              // { kind, id, label, x, y }
      dialog: null,              // 대화창 상태
      inventoryOpen: false,
      selectedItem: null,
      deco: null,                // 꾸미기 모드 상태
      fade: null,                // 장면 전환
      toasts: [],                // { text, icon, t }
      banner: null,              // 퀘스트 완료 배너
      brew: null,                // 포션 제작 창 { anim, result }
      pets: {},                  // 쓰다듬기 반응 중인 NPC: id → { t, line, seq }
    },

    debug: false,
  };
};
