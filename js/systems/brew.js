PK.systems = PK.systems || {};

// 포션 제작 (가마솥): 재료 넣기 → 저어주기(3번) → 마법 넣기 → 완성
// 게임 상태(state.events.moonPotion)를 실제로 바꾸고, 연출 타이머는 state.ui.brew.anim 에 둔다
PK.brew = {
  STEPS: [
    { key: 'add', label: '재료 넣기', dur: 1.5 },
    { key: 'stir', label: '저어주기', dur: 0.55, times: 3 },
    { key: 'magic', label: '마법 넣기', dur: 2.2 },
  ],

  // 가마솥 상호작용 문구
  label(state) {
    const s = state.events.moonPotion.status;
    return s === 'READY_TO_BREW' || s === 'BREWING' ? '포션 만들기' : '가마솥 살펴보기';
  },

  // 가마솥 앞에서 E
  interact(state) {
    const ev = state.events.moonPotion;
    const need = PK.data.quests.moonPotion.need;
    if (ev.status === 'READY_TO_BREW' || ev.status === 'BREWING') {
      if (ev.status === 'READY_TO_BREW') {
        ev.status = 'BREWING';
        ev.brewStep = 0;
        ev.stirs = 0;
      }
      state.ui.brew = { anim: null, result: false };
      // 새로고침으로 마법 연출 도중에 끊겼다면 이어서 완성
      if (ev.brewStep === 3) state.ui.brew.anim = { kind: 'magic', t: 0 };
      state.player.dir = 'up';
      return;
    }
    let text;
    if (ev.status === 'COMPLETED') text = '포션을 만들고 난 가마솥이 반짝반짝 깨끗하다. 은은한 딸기 향이 남아 있다.';
    else if (ev.status === 'COLLECTING') {
      const have = PK.actions.count(state, 'moonFlower');
      text = have < need
        ? `달빛 꽃이 ${need - have}개 부족해서 아직 포션을 만들 수 없다. (${have}/${need})`
        : '재료가 모두 모였다! 먼저 모모에게 말을 걸어보자.';
    } else text = '모모의 커다란 가마솥이다. 라벤더빛 물약이 보글보글 끓고 있다.';
    PK.dialogue.start(state, [{ who: null, text }]);
  },

  busyAnim(state) {
    const b = state.ui.brew;
    if (!b || !b.anim) return false;
    const step = PK.brew.STEPS.find((s) => s.key === b.anim.kind);
    return b.anim.t < step.dur * (b.anim.kind === 'stir' ? 1 : 0.85);
  },

  // 지금 단계의 행동 실행 (버튼 또는 E)
  act(state) {
    const ev = state.events.moonPotion;
    const b = state.ui.brew;
    if (!b || b.result || ev.status !== 'BREWING' || PK.brew.busyAnim(state)) return false;
    const need = PK.data.quests.moonPotion.need;

    if (ev.brewStep === 0) {
      if (PK.actions.count(state, 'moonFlower') < need) {
        PK.actions.toast(state, '달빛 꽃이 부족해요!', 'iconMoonFlower');
        return false;
      }
      PK.actions.removeItem(state, 'moonFlower', need);      // 꽃 3개 차감 (가마솥에 들어감)
      ev.brewStep = 1;
      b.anim = { kind: 'add', t: 0 };
    } else if (ev.brewStep === 1) {
      ev.stirs += 1;
      b.anim = { kind: 'stir', t: 0 };
      if (ev.stirs >= PK.brew.STEPS[1].times) ev.brewStep = 2;
    } else if (ev.brewStep === 2) {
      ev.brewStep = 3;
      b.anim = { kind: 'magic', t: 0 };
    }
    return true;
  },

  // 마법 연출이 끝나면 완성
  complete(state) {
    const ev = state.events.moonPotion;
    if (ev.status !== 'BREWING') return;
    if (!ev.potionGiven) {
      ev.potionGiven = true;
      PK.actions.addItem(state, 'sweetPotion', 1);
    }
    ev.status = 'COMPLETED';
    ev.questDone = true;
    state.ui.brew.result = true;
  },

  // 완성 화면 닫기 → 모모의 대사
  closeResult(state) {
    state.ui.brew = null;
    PK.dialogue.start(state, [
      { who: 'momo', text: '우와아! 정말 예쁜 포션이 완성됐어!' },
      { who: 'momo', text: '네가 도와준 덕분이야. 이 포션은 네가 가져!', action: 'momoBackToDesk' },
    ], 'momo');
  },

  // 재료를 넣기 전에는 자리를 떠날 수 있다
  leave(state) {
    const ev = state.events.moonPotion;
    if (ev.brewStep !== 0) return false;
    ev.status = 'READY_TO_BREW';
    state.ui.brew = null;
    return true;
  },

  // 화면 표시용: 가마솥 물약 색
  liquid(state) {
    const ev = state.events.moonPotion;
    if (ev.status === 'COMPLETED') return 'Done';
    if (ev.status !== 'BREWING') return 'Lav';
    const b = state.ui.brew;
    if (ev.brewStep === 3) return 'Glow';
    if (ev.brewStep === 2) return 'Pink';
    if (ev.brewStep === 1) {
      // 꽃이 다 들어간 뒤 하늘색으로 → 저을수록 분홍빛이 섞임
      if (b && b.anim && b.anim.kind === 'add' && b.anim.t < 1.1) return 'Lav';
      return ev.stirs >= 2 ? 'Pink' : 'Moon';
    }
    return 'Lav';
  },
};

PK.systems.brew = function (state, input, dt) {
  const b = state.ui.brew;
  if (!b) return;
  if (b.anim) {
    b.anim.t += dt;
    if (b.anim.kind === 'magic' && b.anim.t >= PK.brew.STEPS[2].dur && !b.result) PK.brew.complete(state);
    if (b.anim.kind !== 'magic' && b.anim.t > 3) b.anim = null;
  }

  let go = input.justPressed.interact;
  let close = false;
  for (const a of input.actions) {
    if (a.type === 'brewAct') go = true;
    if (a.type === 'brewClose') close = true;
  }
  if (b.result) {
    if (go || close || input.justPressed.cancel) PK.brew.closeResult(state);
  } else if (go) {
    PK.brew.act(state);
  } else if (close || input.justPressed.cancel) {
    PK.brew.leave(state);
  }
  PK.game.consume(input, 'interact', 'cancel', 'inventory', 'decorate');
};

// 모모가 걸어서 이동하는 연출 (약 1.2초)
PK.systems.npcMotion = function (state, input, dt) {
  const m = state.npcs.momo;
  if (m.moveT < 1) m.moveT = Math.min(1, m.moveT + dt / 1.2);
};
