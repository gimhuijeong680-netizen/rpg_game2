PK.data = PK.data || {};

// 화자 정보 (초상화 = NPC 시트의 행)
PK.data.speakers = {
  momo: { name: '모모', portrait: 'momo' },
  berry: { name: '베리', portrait: 'berry' },
  flora: { name: '플로라', portrait: 'flora' },
  lumi: { name: '루미', portrait: 'lumi' },
  cherry: { name: '체리', portrait: 'cherry' },
  witch: { name: '나', portrait: 'witch' },
};

// 대사 목록을 차례로 돌려가며 말하는 주민
function cycle(id, lines) {
  return (state) => [{ who: id, text: lines[(state.npcs[id].talks - 1 + lines.length) % lines.length] }];
}

// 대사 스크립트: state 를 보고 줄 목록을 돌려준다
// 줄 = { who, text, action?, choices?: [{ label, action?, then?: [줄...] }] }
// action 이름은 js/systems/actions.js 의 PK.actions 에 있다
PK.data.dialogues = {
  // 모모: 포션 가게 안. 이벤트(달콤한 마법 포션) 상태 → 마법 꽃 퀘스트 순서로 대사가 바뀐다
  momo(state) {
    const stage = state.quest.lostFlower.stage;
    const ev = state.events.moonPotion;
    const need = PK.data.quests.moonPotion.need;

    // 마법 꽃을 가져왔다면 언제든 먼저 전달할 수 있다
    if (stage === 'found' && PK.actions.hasItem(state, 'magicFlower')) return PK.data.dialogues.momoLostFlower(state);

    if (ev.status === 'NOT_STARTED') {
      return [
        { who: 'momo', text: '앗! 마침 잘 왔어! 특별한 분홍색 포션을 만들고 싶은데 중요한 재료가 부족해!' },
        { who: 'momo', text: '혹시 마을 꽃밭에서 달빛 꽃 3개를 구해다 줄 수 있을까?', action: 'startMoonEvent' },
        { who: 'momo', text: '하늘색으로 반짝이는 꽃이야. 꽃밭은 마을 오른쪽 아래, 하얀 울타리 안에 있어!' },
      ];
    }
    if (ev.status === 'COLLECTING') {
      const have = PK.actions.count(state, 'moonFlower');
      if (have < need) {
        return [
          { who: 'momo', text: `달빛 꽃이 아직 ${need - have}개 부족해! (${have}/${need})` },
          { who: 'momo', text: '꽃밭에서 하늘색으로 반짝이는 꽃을 찾아줘. 꼭 3개가 있어야 해!' },
        ];
      }
      return [
        { who: 'momo', text: '우와! 달빛 꽃을 전부 모아왔구나!' },
        { who: 'momo', text: '이제 같이 포션을 만들어보자!', action: 'readyToBrew' },
        { who: 'momo', text: '가마솥 앞으로 와서 E키를 눌러줘! 내가 옆에서 도와줄게.' },
      ];
    }
    if (ev.status === 'READY_TO_BREW') {
      return [{ who: 'momo', text: '가마솥 앞으로 와서 E키를 눌러줘! 같이 만들자!' }];
    }
    if (ev.status === 'BREWING') {
      return [{ who: 'momo', text: '재료 넣기 → 저어주기 → 마법 넣기! 가마솥 앞에서 계속해 보자!' }];
    }

    // COMPLETED
    const lines = [{ who: 'momo', text: '안녕! 지난번에 만든 포션 정말 잘 만들어졌어! 고마워!' }];
    if (stage === 'none' || stage === 'asked') return lines.concat(PK.data.dialogues.momoLostFlower(state).slice(stage === 'none' ? 1 : 0));
    return lines;
  },

  // 기존 퀘스트: 모모의 잃어버린 마법 꽃
  momoLostFlower(state) {
    const stage = state.quest.lostFlower.stage;
    const hasFlower = PK.actions.hasItem(state, 'magicFlower');

    if (stage === 'none') {
      return [
        { who: 'momo', text: '안녕, 꼬마 마녀님! 나는 포션 가게 주인 모모야.' },
        { who: 'momo', text: '흑흑… 포션에 넣을 마법 꽃을 잃어버렸어. 오늘 손님이 잔뜩 오는데…' },
        {
          who: 'momo', text: '꽃밭 어딘가에서 반짝이고 있을 거야. 혹시 찾아줄 수 있어?',
          choices: [
            {
              label: '좋아, 내가 찾아볼게!', action: 'acceptQuest',
              then: [{ who: 'momo', text: '정말? 고마워! 꽃밭은 마을 오른쪽 아래, 하얀 울타리 안이야.' }],
            },
            {
              label: '지금은 조금 바빠…',
              then: [{ who: 'momo', text: '그렇구나… 마음이 바뀌면 다시 말 걸어줘!' }],
            },
          ],
        },
      ];
    }
    if (stage === 'asked') {
      return [{ who: 'momo', text: '마법 꽃은 라벤더빛으로 반짝반짝 빛나! 꽃밭을 잘 살펴봐.' }];
    }
    if (stage === 'found' && hasFlower) {
      return [
        { who: 'momo', text: '앗, 이 은은한 향기는…! 혹시 마법 꽃을 찾았어?' },
        {
          who: 'momo', text: '(가방 속 마법 꽃이 반짝이고 있다.)',
          choices: [
            {
              label: '꽃 전달하기', action: 'deliverFlower',
              then: [
                { who: 'momo', text: '와아아! 내 마법 꽃이야! 정말 정말 고마워!' },
                { who: 'momo', text: '답례로 내가 만든 핑크 포션을 줄게. 마음이 몽글몽글해질 거야!' },
              ],
            },
            {
              label: '조금만 더 갖고 있을래',
              then: [{ who: 'momo', text: '헤헤, 천천히 줘도 괜찮아. 꽃이 시들지 않게만 해줘!' }],
            },
          ],
        },
      ];
    }
    const thanks = [
      '덕분에 오늘 포션이 반짝반짝해! 고마워, 꼬마 마녀님.',
      '핑크 포션은 마음에 들었어? 다음엔 별빛 포션을 만들어볼래!',
      '집 꾸미기는 잘 돼가? 화분 하나 두면 방이 환해질 거야.',
    ];
    return [{ who: 'momo', text: thanks[state.npcs.momo.talks % thanks.length] }];
  },

  flora: cycle('flora', [
    '안녕~ 나는 플로라야. 연못가에서 꽃 화관 만드는 걸 좋아해.',
    '오늘은 바람이 몽실몽실해서 털이 더 폭신해진 것 같아!',
    '꽃밭의 하늘색 꽃은 달빛을 먹고 자란대. 신기하지?',
  ]),
  lumi: cycle('lumi', [
    '…뭐야, 낮에 말을 걸다니. 나는 루미. 밤이 더 좋아.',
    '흐음… 이 마을 가로등 불빛은 꽤 마음에 들어.',
    '별 머리핀? …딱히 자랑하려고 단 건 아니거든.',
  ]),
  cherry: cycle('cherry', [
    '안녕안녕! 나는 체리! 도토리 모으기 대장이야!',
    '마녀의 집 앞 나무에 도토리를 숨겨뒀어. 비밀이야!',
    '체리 머리핀 예쁘지? 베리가 골라줬어!',
  ]),

  berry(state) {
    const b = state.npcs.berry;
    const stage = state.quest.lostFlower.stage;
    if (!b.gaveCookie) {
      return [
        { who: 'berry', text: '어서 와~! 나는 빵집 주인 베리야. 냐하!' },
        { who: 'berry', text: '처음 왔으니까 갓 구운 딸기 쿠키 하나 줄게. 냠냠 먹어!', action: 'giveCookie' },
      ];
    }
    if (stage === 'asked') {
      return [{ who: 'berry', text: '모모의 꽃? 꽃밭은 오른쪽 아래야! 울타리 틈으로 들어가면 돼~' }];
    }
    if (stage === 'done') {
      return [{ who: 'berry', text: '모모가 엄청 신나서 춤추더라! 너 진짜 멋진 마녀구나?' }];
    }
    const lines = [
      '오늘의 추천은 딸기 크림빵이야~ 쉿, 사실 내가 다 먹었어!',
      '모모랑 나는 소꿉친구야. 모모는 겁이 많지만 착해!',
      '분수 앞에서 소원을 빌면 빵이 더 폭신해진대. 진짜야!',
    ];
    return [{ who: 'berry', text: lines[b.talks % lines.length] }];
  },
};
