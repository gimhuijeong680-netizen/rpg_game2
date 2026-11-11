PK.systems = PK.systems || {};

// 가방 열기/닫기 (I 키 또는 우측 상단 가방 아이콘 클릭)
PK.systems.inventory = function (state, input) {
  const ui = state.ui;
  let toggle = input.justPressed.inventory;
  for (const a of input.actions) {
    if (a.type === 'toggleInventory') toggle = true;
    if (a.type === 'selectItem') ui.selectedItem = a.id;
  }

  if (ui.inventoryOpen) {
    if (toggle || input.justPressed.cancel) {
      ui.inventoryOpen = false;
      PK.game.consume(input, 'cancel', 'interact');
    }
    PK.game.consume(input, 'interact', 'decorate');
    return;
  }

  if (toggle && !ui.dialog && !ui.fade && !ui.deco &&!(ui.banner && !ui.banner.pending)) {
    ui.inventoryOpen = true;
    if (!ui.selectedItem && state.inventory.items.length) ui.selectedItem = state.inventory.items[0].id;
    PK.game.consume(input, 'interact');
  }
};
