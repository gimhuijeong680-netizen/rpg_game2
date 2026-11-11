PK.systems = PK.systems || {};

// 상태를 바꾸는 공용 동작 (인벤토리 / 퀘스트 / 알림)
// 대사 스크립트의 action 이름도 여기서 찾는다
PK.actions = {
  hasItem(state, id) {
    return state.inventory.items.some((it) => it.id === id && it.count > 0);
  },

  addItem(state, id, count = 1) {
    const inv = state.inventory.items;
    const found = inv.find((it) => it.id === id);
    if (found) found.count += count;
    else if (inv.length < PK.data.INVENTORY_SLOTS) inv.push({ id, count });
    else { PK.actions.toast(state, '가방이 가득 찼어요!', 'iconBag'); return false; }
    const def = PK.data.items[id];
    PK.actions.toast(state, `${def.name} 획득!`, def.icon);
    return true;
  },

  removeItem(state, id, count = 1) {
    const inv = state.inventory.items;
    const i = inv.findIndex((it) => it.id === id);
    if (i < 0) return false;
    inv[i].count -= count;
    if (inv[i].count <= 0) {
      inv.splice(i, 1);
      if (state.ui.selectedItem === id) state.ui.selectedItem = null;
    }
    return true;
  },

  toast(state, text, icon) {
    state.ui.toasts.push({ text, icon: icon || null, t: 2.6 });
    if (state.ui.toasts.length > 3) state.ui.toasts.shift();
  },

  // ---- 대사에서 호출 ----
  acceptQuest(state) {
    const q = state.quest.lostFlower;
    if (q.stage !== 'none') return;
    q.stage = 'asked';
    PK.actions.toast(state, '새 퀘스트: 모모의 잃어버린 마법 꽃', 'iconQuest');
  },

  deliverFlower(state) {
    const q = state.quest.lostFlower;
    if (q.stage !== 'found' || !PK.actions.removeItem(state, 'magicFlower')) return;
    q.stage = 'done';
    const def = PK.data.quests.lostFlower;
    for (const r of def.reward) PK.actions.addItem(state, r.id, r.count);
    state.ui.banner = {
      title: '퀘스트 완료!',
      quest: def.title,
      rewards: def.reward.map((r) => ({ id: r.id, count: r.count })),
      pending: true,          // 대화가 끝난 뒤에 띄운다
    };
  },

  giveCookie(state) {
    const b = state.npcs.berry;
    if (b.gaveCookie) return;
    b.gaveCookie = true;
    PK.actions.addItem(state, 'cookie', 1);
  },

  // 아이템을 주웠을 때 퀘스트 진행
  onPickup(state, itemId) {
    const q = state.quest.lostFlower;
    if (itemId === 'magicFlower' && q.stage === 'asked') {
      q.stage = 'found';
      PK.actions.toast(state, '퀘스트 진행: 모모에게 돌아가자!', 'iconQuest');
    }
    const ev = state.events.moonPotion;
    if (itemId === 'moonFlower' && ev.status === 'COLLECTING') {
      const need = PK.data.quests.moonPotion.need;
      ev.flowers = Math.min(need, ev.flowers + 1);
      PK.actions.toast(state, `달빛 꽃 ${ev.flowers}/${need}`, 'iconMoonFlower');
      if (ev.flowers >= need) PK.actions.toast(state, '달빛 꽃을 모두 모았다! 모모에게 돌아가자', 'iconQuest');
    }
  },

  // ---- 이벤트: 모모와 달콤한 마법 포션 ----
  startMoonEvent(state) {
    const ev = state.events.moonPotion;
    if (ev.status !== 'NOT_STARTED') return;
    ev.status = 'COLLECTING';
    PK.actions.toast(state, '새 퀘스트: 달빛 꽃 수집하기 (0/3)', 'iconQuest');
  },

  // 꽃 3개 확인 → 모모가 가마솥 앞으로 이동
  readyToBrew(state) {
    const ev = state.events.moonPotion;
    if (ev.status !== 'COLLECTING' || PK.actions.count(state, 'moonFlower') < PK.data.quests.moonPotion.need) return;
    ev.status = 'READY_TO_BREW';
    PK.actions.moveMomo(state, 'cauldron');
  },

  momoBackToDesk(state) {
    PK.actions.moveMomo(state, 'desk');
  },

  moveMomo(state, spot) {
    const m = state.npcs.momo;
    if (m.spot === spot) return;
    m.from = m.spot;
    m.spot = spot;
    m.moveT = 0;
  },

  count(state, id) {
    const it = state.inventory.items.find((x) => x.id === id);
    return it ? it.count : 0;
  },
};

// 픽업 조건
PK.requirements = {
  questAsked: (state) => state.quest.lostFlower.stage === 'asked',
  moonCollecting: (state) => state.events.moonPotion.status === 'COLLECTING',
};
