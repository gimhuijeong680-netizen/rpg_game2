PK.data = PK.data || {};

// 퀘스트 정의. stage 순서대로 진행된다
PK.data.quests = {
  lostFlower: {
    title: '모모의 잃어버린 마법 꽃',
    icon: 'iconFlower',
    stages: ['none', 'asked', 'found', 'done'],
    steps: [
      { text: '포션 가게의 모모와 이야기하기', doneAt: 'asked' },
      { text: '꽃밭에서 마법 꽃 찾기', doneAt: 'found' },
      { text: '모모에게 마법 꽃 전달하기', doneAt: 'done' },
    ],
    hint: {
      none: '포션 가게 안의 모모에게 말을 걸어보자.',
      asked: '꽃밭은 마을 오른쪽 아래, 하얀 울타리 안이야.',
      found: '포션 가게의 모모에게 꽃을 전해주자.',
      done: '퀘스트 완료! 모모가 무척 기뻐했다.',
    },
    reward: [{ id: 'potion', count: 1 }],
  },

  // 이벤트: 모모와 달콤한 마법 포션 (상태는 state.events.moonPotion)
  moonPotion: {
    title: '모모와 달콤한 마법 포션',
    icon: 'iconMoonFlower',
    need: 3,
    stages: ['NOT_STARTED', 'COLLECTING', 'READY_TO_BREW', 'BREWING', 'COMPLETED'],
    reward: [{ id: 'sweetPotion', count: 1 }],
  },
};

// HUD 가 보여줄 퀘스트 목록 (진행 중인 것 먼저). 상태를 읽기만 한다
PK.questView = function (state) {
  const out = [];
  const ev = state.events.moonPotion;
  const mp = PK.data.quests.moonPotion;
  const n = Math.min(ev.flowers, mp.need);
  const order = mp.stages.indexOf(ev.status);
  const moonSteps = [
    { text: '포션 가게에서 모모와 이야기하기', done: order >= 1 },
    { text: `달빛 꽃 수집하기 (${n}/${mp.need})`, done: n >= mp.need },
    { text: '모모에게 달빛 꽃 가져가기', done: order >= 2 },
    { text: '가마솥에서 포션 만들기', done: order >= 4 },
  ];
  const moonNow = moonSteps.find((s) => !s.done);
  out.push({
    id: 'moonPotion', title: mp.title, icon: mp.icon, steps: moonSteps,
    current: moonNow ? moonNow.text : '완료!',
    active: order >= 1 && order < 4, done: order >= 4, started: order >= 1,
  });

  const lf = PK.data.quests.lostFlower;
  const st = state.quest.lostFlower.stage;
  const idx = lf.stages.indexOf(st);
  const lfSteps = lf.steps.map((s) => ({ text: s.text, done: lf.stages.indexOf(s.doneAt) <= idx }));
  const lfNow = lfSteps.find((s) => !s.done);
  out.push({
    id: 'lostFlower', title: lf.title, icon: lf.icon, steps: lfSteps,
    current: lfNow ? lfNow.text : '완료!',
    active: idx >= 1 && idx < 3, done: idx >= 3, started: idx >= 1,
  });

  out.sort((a, b) => (b.active - a.active) || (a.done - b.done));
  return out;
};
