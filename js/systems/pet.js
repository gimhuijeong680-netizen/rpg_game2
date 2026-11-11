PK.systems = PK.systems || {};

// 동물 주민 쓰다듬기 (P 키 / 터치 ♥ 버튼)
// - E 대화와 분리된 별도 입력이라 서로 충돌하지 않는다
// - 반응 애니메이션(약 1.4초)이 끝나기 전에는 같은 주민을 다시 쓰다듬을 수 없다 → 겹침/깨짐 방지
PK.pet = {
  DURATION: 1.4,

  // 주민별 반응 대사 (첫 번째는 대표 반응, 이후 돌아가며)
  REACTIONS: {
    momo: ['꺄! 간지러워!', '헤헤, 귀는 살살 만져줘~', '기분 좋아서 귀가 쫑긋!'],
    berry: ['냐아~ 기분 좋아!', '골골골… 조금만 더~', '냐하! 꼬리가 멋대로 흔들려!'],
    flora: ['헤헤, 고마워!', '털이 더 폭신해진 것 같아~', '음매~ 행복해!'],
    lumi: ['흐음... 나쁘지 않네.', '…한 번만 더 해도 돼.', '딱히 좋은 건 아니거든!'],
    cherry: ['한 번 더! 한 번 더!', '꺄르르! 꼬리가 춤춰!', '도토리보다 좋아!'],
  },

  active(state, id) {
    const r = state.ui.pets[id];
    return !!r && r.t < PK.pet.DURATION;
  },

  // 성공하면 true. 반응 중이면 무시(false)
  start(state, id) {
    if (!PK.pet.REACTIONS[id] || PK.pet.active(state, id)) return false;
    const n = state.npcs[id];
    n.pets = (n.pets || 0) + 1;
    const lines = PK.pet.REACTIONS[id];
    state.ui.pets[id] = { t: 0, line: lines[(n.pets - 1) % lines.length], seq: n.pets };
    return true;
  },
};

// 반응 타이머: 끝나면 자연스럽게 사라짐
PK.systems.pet = function (state, input, dt) {
  const pets = state.ui.pets;
  for (const id of Object.keys(pets)) {
    pets[id].t += dt;
    if (pets[id].t >= PK.pet.DURATION) delete pets[id];
  }
};
