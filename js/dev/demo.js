// 개발용: URL 해시로 특정 장면을 바로 띄운다 (스크린샷 확인용, 저장하지 않음)
//   index.html#demo=shop / brew / stir / magic / result / done / field ...
//   &probe 를 붙이면 레이아웃 측정값을 document.title 에 기록
PK.demo = {
  apply(state, hash) {
    const m = /demo=(\w+)/.exec(hash || '');
    if (!m) return;
    const p = state.player;
    const A = PK.actions;
    const ev = state.events.moonPotion;
    const inShop = (x = 150, y = 170, dir = 'up') => { state.scene = 'shop'; p.x = x; p.y = y; p.dir = dir; };
    const brewing = (step) => {
      inShop(154, 158, 'up');
      ev.status = 'BREWING'; ev.flowers = 3; ev.brewStep = step;
      state.npcs.momo.spot = 'cauldron';
      state.ui.brew = { anim: null, result: false };
    };
    const presets = {
      village() { p.x = 300; p.y = 200; },
      shopfront() { p.x = 420; p.y = 140; p.dir = 'up'; },
      shop() { inShop(150, 170); },
      momo() {
        inShop(140, 106, 'left');
        PK.dialogue.talkTo(state, 'momo');
        state.ui.dialog.shown = 999;
      },
      field() {
        A.startMoonEvent(state);
        state.ui.toasts = [];
        p.x = 380; p.y = 270; p.dir = 'right';
      },
      ready() {
        inShop(150, 168, 'up');
        ev.status = 'READY_TO_BREW'; ev.flowers = 3;
        A.addItem(state, 'moonFlower', 3);
        state.ui.toasts = [];
        state.npcs.momo.spot = 'cauldron';
      },
      brew() { brewing(0); A.addItem(state, 'moonFlower', 3); state.ui.toasts = []; },
      add() { brewing(1); state.ui.brew.anim = { kind: 'add', t: 0.55 }; },
      stir() { brewing(1); ev.stirs = 1; state.ui.brew.anim = { kind: 'stir', t: 0.2 }; },
      magic() { brewing(3); ev.stirs = 3; state.ui.brew.anim = { kind: 'magic', t: 0.9 }; },
      result() {
        brewing(3); ev.stirs = 3;
        state.ui.brew.anim = { kind: 'magic', t: 9 };
        PK.brew.complete(state);
        state.ui.toasts = [];
      },
      done() {
        inShop(40, 100, 'up');
        Object.assign(ev, { status: 'COMPLETED', flowers: 3, brewStep: 3, stirs: 3, potionGiven: true, questDone: true });
        A.addItem(state, 'sweetPotion', 1);
        state.ui.toasts = [];
      },
      inventory() {
        A.addItem(state, 'moonFlower', 2); A.addItem(state, 'star'); A.addItem(state, 'sweetPotion');
        state.ui.toasts = [];
        state.ui.inventoryOpen = true;
        state.ui.selectedItem = 'sweetPotion';
      },
      // 쓰다듬기: 마을 주민 4명이 동시에 반응하는 모습 (모모는 petshop)
      pets() {
        p.x = 196; p.y = 132; p.dir = 'up';
        state.ui.pets = {
          berry: { t: 0.3, line: '냐아~ 기분 좋아!', seq: 1 },
          cherry: { t: 0.5, line: '한 번 더! 한 번 더!', seq: 1 },
          lumi: { t: 0.35, line: '흐음... 나쁘지 않네.', seq: 1 },
          flora: { t: 0.4, line: '헤헤, 고마워!', seq: 1 },
        };
        PK.pet.DURATION = 999;   // 스크린샷용으로 반응을 붙잡아 둠
      },
      petnear() { p.x = 110; p.y = 146; p.dir = 'right'; },
      petshop() {
        inShop(140, 106, 'left');
        state.ui.pets = { momo: { t: 0.3, line: '꺄! 간지러워!', seq: 1 } };
        PK.pet.DURATION = 999;
      },
      house() { state.scene = 'house'; p.x = 154; p.y = 180; p.dir = 'down'; },
      deco() {
        state.scene = 'house'; p.x = 250; p.y = 200;
        state.house.furniture.push({ uid: 9, type: 'desk', x: 136, y: 64 }, { uid: 10, type: 'plant', x: 224, y: 80 });
        PK.deco.start(state);
        state.ui.deco.sel = 9;
      },
    };
    if (presets[m[1]]) presets[m[1]]();

    if (/probe/.test(hash)) {
      setTimeout(() => {
        const de = document.documentElement;
        const cv = document.getElementById('game').getBoundingClientRect();
        // 보이는 HUD 요소: 글씨 크기, 화면 밖 넘침, 서로 겹침
        const fs = (sel) => {
          const el = document.querySelector(sel);
          return el && el.offsetParent !== null ? parseFloat(getComputedStyle(el).fontSize) : null;
        };
        const boxes = [...document.querySelectorAll('.hud > *, .hud-tl > *, .hud-tr > *')]
          .filter((el) => el.offsetParent !== null && !el.matches('.hud-tl, .hud-tr, .pet-bubbles, .touch, .loading, .toasts'))
          .map((el) => ({ id: el.id || el.className.split(' ').pop(), r: el.getBoundingClientRect() }))
          .filter((b) => b.r.width && b.r.height);
        const off = boxes.filter((b) => b.r.left < -1 || b.r.top < -1 || b.r.right > innerWidth + 1 || b.r.bottom > innerHeight + 1).map((b) => b.id);
        const overlaps = [];
        for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i].r, b = boxes[j].r;
          if (a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1) overlaps.push(boxes[i].id + '×' + boxes[j].id);
        }
        // 글씨가 칸 밖으로 넘치는지
        const clipped = [...document.querySelectorAll('.pill, .slot, .dialog-text, .brew-hint, .deco-hint')]
          .filter((el) => el.offsetParent !== null && !el.matches('.bag-btn') && el.scrollWidth > el.clientWidth + 2).map((el) => el.id || el.className);
        document.title = 'PROBE ' + JSON.stringify({
          win: [innerWidth, innerHeight], scroll: [de.scrollWidth, de.scrollHeight],
          canvas: [Math.round(cv.width), Math.round(cv.height)], view: [state.view.w, state.view.h], scale: PK.viewScale,
          font: { title: fs('.hud-date b'), dialog: fs('.dialog-text'), qtitle: fs('.q-title'), qstep: fs('.q-step'),
            btn: fs('.brew-actions .pill') || fs('#bagBtn'), item: fs('.slot-name'), prompt: fs('.prompt'), menu: fs('.panel-head h2'), help: fs('.help li') },
          off, overlaps, clipped,
        });
      }, 400);
    }
  },
};
