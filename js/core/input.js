// 키보드 + 터치 가상 버튼 + UI 클릭 액션을 한 곳에서 모은다
// 시스템에는 snapshot() 으로 만든 순수 객체만 넘긴다 (테스트에서 직접 만들 수 있도록)
(function () {
  const held = new Set();
  const pressed = new Set();      // 이번 프레임에 새로 눌린 키
  const virtualHeld = new Set();  // 터치 D-pad
  const virtualPressed = new Set();
  let actions = [];               // DOM 에서 들어온 { type, ... }

  const K = PK.config.KEYS;
  const gameCodes = new Set(Object.values(K).flat());

  function typing(e) {
    const t = e.target;
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA');
  }

  if (typeof window.addEventListener === 'function') {
    window.addEventListener('keydown', (e) => {
      if (typing(e)) return;
      if (!held.has(e.code)) pressed.add(e.code);
      held.add(e.code);
      if (gameCodes.has(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => held.delete(e.code));
    window.addEventListener('blur', () => { held.clear(); virtualHeld.clear(); });
  }

  const any = (codes, set) => codes.some((c) => set.has(c));

  PK.input = {
    snapshot() {
      const hold = (name) => any(K[name], held) || virtualHeld.has(name);
      const tap = (name) => any(K[name], pressed) || virtualPressed.has(name);
      return {
        up: hold('up'),
        down: hold('down'),
        left: hold('left'),
        right: hold('right'),
        justPressed: {
          up: tap('up'), down: tap('down'), left: tap('left'), right: tap('right'),
          interact: tap('interact'),
          pet: tap('pet'),
          inventory: tap('inventory'),
          decorate: tap('decorate'),
          move: tap('move'),
          remove: tap('remove'),
          cancel: tap('cancel'),
          debug: tap('debug'),
        },
        actions: actions.slice(),
      };
    },
    endFrame() {
      pressed.clear();
      virtualPressed.clear();
      actions = [];
    },
    // 터치 버튼용
    setVirtual(name, on) {
      if (on) {
        if (!virtualHeld.has(name)) virtualPressed.add(name);
        virtualHeld.add(name);
      } else {
        virtualHeld.delete(name);
      }
    },
    tapVirtual(name) { virtualPressed.add(name); },
    // DOM UI 클릭 → 다음 프레임에 시스템이 처리
    push(action) { actions.push(action); },
  };

  // 테스트/스크립트에서 쓰는 빈 입력
  PK.input.empty = function () {
    return {
      up: false, down: false, left: false, right: false,
      justPressed: { up: false, down: false, left: false, right: false, interact: false, pet: false, inventory: false, decorate: false, move: false, remove: false, cancel: false, debug: false },
      actions: [],
    };
  };
})();
