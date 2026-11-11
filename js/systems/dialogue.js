PK.systems = PK.systems || {};

// 대화창: 글자가 한 글자씩 나타나고, E(또는 클릭)로 넘기거나 선택지를 고른다
PK.dialogue = {
  start(state, lines, npcId) {
    if (!lines || !lines.length) return;
    state.ui.dialog = { npc: npcId || null, lines, index: 0, shown: 0, choice: 0, ran: {} };
    PK.dialogue.enterLine(state);
  },

  // 대사 스크립트로 시작 (NPC)
  talkTo(state, npcId) {
    const lines = PK.data.dialogues[npcId](state);
    state.npcs[npcId].talks += 1;
    PK.dialogue.start(state, lines, npcId);
  },

  current(state) {
    const d = state.ui.dialog;
    return d ? d.lines[d.index] : null;
  },

  enterLine(state) {
    const d = state.ui.dialog;
    const line = d.lines[d.index];
    d.shown = 0;
    d.choice = 0;
    if (line.action && !d.ran[d.index]) {
      d.ran[d.index] = true;
      PK.actions[line.action](state);
    }
  },

  next(state) {
    const d = state.ui.dialog;
    d.index += 1;
    if (d.index >= d.lines.length) PK.dialogue.close(state);
    else PK.dialogue.enterLine(state);
  },

  choose(state, i) {
    const d = state.ui.dialog;
    const line = d.lines[d.index];
    const c = line.choices[i];
    if (!c) return;
    if (c.action) PK.actions[c.action](state);
    if (c.then && c.then.length) {
      d.lines = c.then;
      d.index = 0;
      d.ran = {};
      PK.dialogue.enterLine(state);
    } else {
      PK.dialogue.close(state);
    }
  },

  close(state) {
    state.ui.dialog = null;
    if (state.ui.banner) state.ui.banner.pending = false;
  },
};

PK.systems.dialogue = function (state, input, dt) {
  const d = state.ui.dialog;
  if (!d) return;
  const line = d.lines[d.index];
  const len = line.text.length;
  d.shown = Math.min(len, d.shown + dt * PK.config.TYPE_SPEED);
  const done = d.shown >= len;
  const jp = input.justPressed;

  // 마우스/터치 클릭
  for (const a of input.actions) {
    if (a.type === 'dialogNext') {
      if (!done) d.shown = len;
      else if (!line.choices) PK.dialogue.next(state);
    } else if (a.type === 'dialogChoose' && done && line.choices) {
      PK.dialogue.choose(state, a.index);
    }
  }
  if (state.ui.dialog !== d || d.lines[d.index] !== line) {
    PK.game.consume(input, 'interact', 'cancel', 'up', 'down');
    return;
  }

  if (done && line.choices) {
    const n = line.choices.length;
    if (jp.up) d.choice = (d.choice + n - 1) % n;
    if (jp.down) d.choice = (d.choice + 1) % n;
  }

  if (jp.interact) {
    if (!done) d.shown = len;
    else if (line.choices) PK.dialogue.choose(state, d.choice);
    else PK.dialogue.next(state);
  } else if (jp.cancel && !line.choices) {
    PK.dialogue.close(state);
  }
  PK.game.consume(input, 'interact', 'cancel', 'up', 'down', 'inventory', 'decorate');
};

// 퀘스트 완료 배너 닫기
PK.systems.banner = function (state, input) {
  const b = state.ui.banner;
  if (!b || b.pending) return;
  const clicked = input.actions.some((a) => a.type === 'bannerClose');
  if (clicked || input.justPressed.interact || input.justPressed.cancel) {
    state.ui.banner = null;
    PK.game.consume(input, 'interact', 'cancel');
  }
};
