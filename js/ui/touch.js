// 모바일 터치 조작: D-pad = 방향키, E 버튼 = 상호작용
PK.ui = PK.ui || {};
PK.ui.setupTouch = function () {
  const press = (btn, name, on) => {
    btn.classList.toggle('on', on);
    PK.input.setVirtual(name, on);
  };
  for (const btn of document.querySelectorAll('.dpad button')) {
    const dir = btn.dataset.dir;
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      press(btn, dir, true);
    });
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      btn.addEventListener(ev, () => press(btn, dir, false));
    }
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  const act = document.getElementById('touchAct');
  act.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    act.classList.add('on');
    PK.input.tapVirtual('interact');
  });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) act.addEventListener(ev, () => act.classList.remove('on'));
  const pet = document.getElementById('touchPet');
  pet.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    pet.classList.add('on');
    PK.input.tapVirtual('pet');
  });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) pet.addEventListener(ev, () => pet.classList.remove('on'));
};
