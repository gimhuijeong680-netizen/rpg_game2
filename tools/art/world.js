// 마을 / 실내 / 가구 / 아이템 / UI 스프라이트
// 모든 스프라이트는 캐릭터와 같은 1px = 1도트 밀도, 같은 외곽선 색(o)을 쓴다
const { Px } = require('../pixel.js');

const S = {};               // 이름 → Px
function def(name, w, h, fn, outline = true) {
  const p = new Px(w, h);
  fn(p);
  if (outline) p.outline();
  S[name] = p;
  return p;
}
function star5(p, cx, cy, c = 'y') {
  p.pts([[cx, cy - 1], [cx - 1, cy], [cx + 1, cy], [cx, cy + 1]], c);
  p.set(cx, cy, 'w');
}
function heart(p, x, y, c = 'r', hi = 'P') {
  // 5 x 4 하트 (x,y = 좌상단)
  p.pts([[x, y], [x + 1, y], [x + 3, y], [x + 4, y]], c);
  p.hline(x, x + 4, y + 1, c);
  p.hline(x + 1, x + 3, y + 2, c);
  p.set(x + 2, y + 3, c);
  if (hi) p.set(x, y, hi);
}
// 결정적인 의사 난수 (같은 결과 → 같은 그림)
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// ================= 바닥 타일 (외곽선 없음) =================
function grass(seed, flower) {
  return (p) => {
    p.rect(0, 0, 16, 16, 'M');
    const r = rng(seed);
    for (let i = 0; i < 3; i++) {
      const x = 1 + Math.floor(r() * 13), y = 2 + Math.floor(r() * 12);
      p.set(x, y, 'g').set(x + 2, y, 'g').set(x + 1, y + 1, 'g');   // 작은 v 풀
    }
    for (let i = 0; i < 3; i++) p.set(Math.floor(r() * 16), Math.floor(r() * 16), 'm');
    if (flower) {
      const x = 4 + Math.floor(r() * 7), y = 4 + Math.floor(r() * 7);
      p.pts([[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]], flower);
      p.set(x, y, 'y');
    }
  };
}
def('grass0', 16, 16, grass(3), false);
def('grass1', 16, 16, grass(11), false);
def('grass2', 16, 16, grass(29, 'w'), false);
def('grass3', 16, 16, grass(47, 'P'), false);

function path(seed) {
  return (p) => {
    p.rect(0, 0, 16, 16, 'c');
    // 둥근 돌 포장 (2줄 엇갈림)
    const rows = [[0, 0], [8, 4]];
    for (const [ry, off] of rows) {
      for (let sx = -off; sx < 16; sx += 8) {
        for (let x = sx; x < sx + 7; x++) p.set(x, ry + 7, 'C');
        p.vline(sx + 7, ry, ry + 7, 'C');
        p.set(sx + 1, ry + 1, 'w');
        p.set(sx + 2, ry + 1, 'w');
      }
    }
    const r = rng(seed);
    for (let i = 0; i < 2; i++) p.set(Math.floor(r() * 16), Math.floor(r() * 16), 'k');
  };
}
def('path0', 16, 16, path(5), false);
def('path1', 16, 16, path(17), false);

// 실내 바닥: 분홍 체크
def('floor', 16, 16, (p) => {
  p.rect(0, 0, 16, 16, 'p');
  p.rect(0, 0, 8, 8, 'P');
  p.rect(8, 8, 8, 8, 'P');
  p.hline(0, 7, 0, 'q'); p.hline(8, 15, 8, 'q');
  p.set(2, 2, 'p'); p.set(10, 10, 'p');
}, false);

// 실내 벽지: 깅엄 체크
def('wall', 16, 16, (p) => {
  p.rect(0, 0, 16, 16, 'w');
  p.rect(0, 0, 4, 16, 'p'); p.rect(8, 0, 4, 16, 'p');
  p.rect(0, 0, 16, 4, 'p'); p.rect(0, 8, 16, 4, 'p');
  for (const x of [0, 8]) for (const y of [0, 8]) p.rect(x, y, 4, 4, 'P');
}, false);

// 벽 아래 몰딩 (16 x 8)
def('wainscot', 16, 8, (p) => {
  p.rect(0, 0, 16, 8, 'P');
  p.hline(0, 15, 0, 'w');
  p.hline(0, 15, 1, 'p');
  p.hline(0, 15, 6, 'q');
  p.hline(0, 15, 7, 'Q');
  p.vline(7, 2, 5, 'q');
  p.vline(15, 2, 5, 'q');
}, false);

// 레이스 커튼 테두리 (16 x 8)
def('lace', 16, 8, (p) => {
  p.rect(0, 0, 16, 4, 'w');
  for (let x = 0; x < 16; x++) {
    const d = [5, 6, 6, 5, 4, 5, 6, 6][x % 8];
    p.vline(x, 4, d, 'w');
  }
  p.pts([[3, 2], [11, 2], [7, 4], [15, 4]], 'P');
  p.hline(0, 15, 0, 'p');
}, false);

// ================= 자연 =================
def('tree', 32, 40, (p) => {
  p.rect(13, 26, 6, 11, 't');
  p.vline(18, 26, 36, 'T');
  p.pts([[12, 36], [19, 36], [11, 37], [20, 37]], 't');
  for (const [x, y, rx, ry] of [[16, 13, 11.5, 10], [8.5, 19, 7.5, 6.5], [23.5, 19, 7.5, 6.5], [16, 23, 10, 5.5]]) {
    p.ellipse(x, y, rx, ry, 'M');
  }
  // 아래쪽 그늘
  for (let y = 0; y < 40; y++) for (let x = 0; x < 32; x++) {
    if (p.get(x, y) === 'M' && !p.get(x, y + 2)) p.set(x, y, 'G');
    else if (p.get(x, y) === 'M' && y > 19) p.set(x, y, 'g');
  }
  p.ellipse(11, 9, 4, 2.5, 'm', true);
  p.ellipse(5.5, 17, 2, 1.5, 'm', true);
  p.pts([[22, 8], [23, 8], [24, 9]], 'm');
  // 분홍 꽃송이
  for (const [x, y] of [[20, 13], [9, 22], [24, 20], [14, 6], [5, 21]]) {
    p.pts([[x, y], [x + 1, y], [x, y + 1]], 'P');
    p.set(x + 1, y + 1, 'Q');
  }
});

def('treePink', 32, 40, (p) => {
  p.rect(13, 26, 6, 11, 't');
  p.vline(18, 26, 36, 'T');
  p.pts([[12, 36], [19, 36], [11, 37], [20, 37]], 't');
  for (const [x, y, rx, ry] of [[16, 13, 11.5, 10], [8.5, 19, 7.5, 6.5], [23.5, 19, 7.5, 6.5], [16, 23, 10, 5.5]]) {
    p.ellipse(x, y, rx, ry, 'P');
  }
  for (let y = 0; y < 40; y++) for (let x = 0; x < 32; x++) {
    if (p.get(x, y) === 'P' && !p.get(x, y + 2)) p.set(x, y, 'Q');
    else if (p.get(x, y) === 'P' && y > 19) p.set(x, y, 'q');
  }
  p.ellipse(11, 9, 4, 2.5, 'p', true);
  p.ellipse(5.5, 17, 2, 1.5, 'p', true);
  for (const [x, y] of [[20, 12], [9, 21], [24, 19], [15, 5]]) p.pts([[x, y], [x + 1, y + 1]], 'w');
});

def('bush', 20, 14, (p) => {
  p.ellipse(6, 8, 6, 5, 'M');
  p.ellipse(14, 8, 6, 5, 'M');
  p.ellipse(10, 6, 6, 5, 'M');
  for (let y = 0; y < 14; y++) for (let x = 0; x < 20; x++) if (p.get(x, y) && !p.get(x, y + 2)) p.set(x, y, 'g');
  p.pts([[7, 3], [8, 3], [6, 4]], 'm');
  p.pts([[5, 7], [13, 5], [15, 9]], 'P');
  p.pts([[5, 8], [13, 6], [15, 10]], 'q');
});

def('rock', 10, 7, (p) => {
  p.ellipse(5, 4, 4.5, 3, 'x');
  p.hline(2, 8, 5, 'X');
  p.pts([[3, 2], [4, 2]], 'w');
});

function flower(c, d) {
  return (p) => {
    p.vline(3, 4, 6, 'G');
    p.set(4, 5, 'g');
    p.pts([[3, 0], [2, 1], [4, 1], [3, 2], [2, 0], [4, 0]], c);
    p.pts([[1, 1], [5, 1], [2, 2], [4, 2]], c);
    p.set(3, 1, 'y');
    p.set(2, 2, d);
  };
}
def('flowerPink', 7, 7, flower('P', 'q'));
def('flowerWhite', 7, 7, flower('w', 'p'));
def('flowerLav', 7, 7, flower('L', 'v'));
def('tuft', 7, 5, (p) => {
  p.pts([[0, 2], [1, 3], [2, 4], [3, 1], [3, 2], [3, 3], [3, 4], [6, 2], [5, 3], [4, 4]], 'g');
  p.set(3, 0, 'G');
}, false);

// 마법 꽃 (퀘스트 아이템, 반짝임 2프레임)
function magicFlower(frame) {
  return (p) => {
    p.vline(7, 9, 15, 'G');
    p.pts([[5, 12], [4, 11], [6, 13], [9, 13], [10, 12], [8, 14]], 'g');
    p.ellipse(7.5, 6, 5.2, 4.6, 'L');
    for (const [x, y] of [[7, 1], [3, 4], [11, 4], [4, 8], [10, 8]]) p.ellipse(x + 0.5, y + 0.5, 1.6, 1.6, 'P');
    p.ellipse(7.5, 6, 2.4, 2.2, 'w');
    star5(p, 7, 6, 'y');
    p.set(5, 3, 'p'); p.set(9, 3, 'p');
  };
}
def('magicFlower0', 15, 16, magicFlower(0));
def('magicFlower1', 15, 16, magicFlower(1));

// 땅에 떨어진 별 장식
def('starItem', 11, 11, (p) => {
  p.poly([[5.5, 0], [7, 4], [11, 4.2], [8, 6.8], [9.2, 11], [5.5, 8.6], [1.8, 11], [3, 6.8], [0, 4.2], [4, 4]], 'y');
  p.pts([[5, 2], [5, 3], [4, 4]], 'w');
  p.pts([[7, 8], [8, 9], [6, 8]], 'Y');
});

def('pond', 96, 56, (p) => {
  p.ellipse(48, 28, 46, 25, 'A');
  p.ellipse(22, 33, 20, 18, 'A');
  p.ellipse(74, 24, 20, 18, 'A');
  // 물가 거품 테두리
  for (let y = 0; y < 56; y++) for (let x = 0; x < 96; x++) {
    if (p.get(x, y) !== 'A') continue;
    if (!p.get(x, y - 1) || !p.get(x - 1, y) || !p.get(x + 1, y)) p.set(x, y, 'm');
    else if (!p.get(x, y + 1)) p.set(x, y, 'a');
  }
  p.ellipse(50, 33, 34, 15, 'B', true);
  for (let y = 0; y < 56; y++) for (let x = 0; x < 96; x++) if (p.get(x, y) === 'B' && p.get(x, y - 1) === 'A') p.set(x, y, 'A');
  // 물결 하이라이트
  for (const [x, y, w] of [[24, 18, 6], [56, 14, 8], [66, 40, 5], [14, 34, 4], [38, 44, 6]]) p.hline(x, x + w, y, 'w');
  // 연잎 + 꽃
  for (const [cx, cy] of [[74, 28], [22, 40]]) {
    p.ellipse(cx, cy, 5.5, 3.6, 'G');
    p.set(cx + 2, cy - 2, 'A'); p.set(cx + 3, cy - 3, 'A'); p.set(cx + 1, cy - 1, 'A');
    p.hline(cx - 4, cx, cy, 'g');
  }
  p.pts([[73, 26], [74, 25], [75, 26], [74, 26]], 'P');
  p.set(74, 26, 'y');
});

def('fountain0', 48, 44, fountain(0));
def('fountain1', 48, 44, fountain(1));
function fountain(frame) {
  return (p) => {
    // 아래 수반
    p.ellipse(24, 32, 22, 9.5, 'x');
    p.rect(2, 32, 44, 6, 'x');
    p.ellipse(24, 38, 22, 5, 'x');
    for (let y = 33; y < 44; y++) for (let x = 0; x < 48; x++) if (p.get(x, y) === 'x') p.set(x, y, y > 39 ? 'X' : 'x');
    p.hline(3, 44, 36, 'P');
    p.hline(3, 44, 37, 'q');
    for (let x = 5; x < 44; x += 6) p.set(x, 36, 'w');
    p.ellipse(24, 31, 18.5, 6.5, 'A');
    p.ellipse(24, 32.5, 15, 4.5, 'B', true);
    p.hline(10, 14, 29, 'w'); p.hline(31, 35, 33, 'a');
    // 기둥과 위 그릇
    p.rect(21, 16, 6, 15, 'x');
    p.vline(26, 16, 30, 'X');
    heart(p, 22, 21, 'q', null);
    p.ellipse(24, 14, 9, 3.2, 'x');
    p.hline(16, 32, 15, 'X');
    p.ellipse(24, 13, 6.5, 1.8, 'A');
    // 물줄기
    p.vline(24, 4, 12, 'a');
    p.pts([[23, 4], [25, 4], [22, 5], [26, 5]], 'a');
    const drops = frame === 0
      ? [[14, 17], [13, 20], [13, 24], [34, 18], [35, 22], [35, 26], [24, 2]]
      : [[14, 19], [13, 22], [12, 26], [34, 16], [35, 20], [35, 24], [24, 3]];
    for (const [x, y] of drops) p.set(x, y, 'a');
    p.pts(frame === 0 ? [[15, 16], [33, 16]] : [[15, 17], [33, 17]], 'w');
  };
}

def('fenceH', 16, 16, (p) => {
  p.rect(0, 6, 16, 2, 'c'); p.hline(0, 15, 7, 'C');
  p.rect(0, 10, 16, 2, 'c'); p.hline(0, 15, 11, 'C');
  p.rect(6, 3, 4, 12, 'w');
  p.pts([[6, 3], [9, 3]], null);
  p.vline(9, 4, 14, 'C');
  p.set(7, 2, 'w'); p.set(8, 2, 'w');
});
def('fenceV', 16, 16, (p) => {
  p.rect(7, 0, 2, 16, 'c');
  p.vline(8, 0, 15, 'C');
  p.rect(6, 4, 4, 9, 'w');
  p.vline(9, 4, 12, 'C');
});

def('lamp', 12, 34, (p) => {
  p.rect(5, 10, 2, 22, 'V');
  p.vline(5, 10, 31, 'v');
  p.rect(3, 30, 6, 3, 'V');
  p.ellipse(6, 6, 4.5, 4.5, 'y');
  p.rect(2, 1, 8, 2, 'L');
  p.set(5, 0, 'L'); p.set(6, 0, 'L');
  p.pts([[4, 5], [4, 6]], 'w');
  p.hline(3, 8, 10, 'L');
});

def('sign', 18, 18, (p) => {
  p.rect(8, 8, 2, 9, 't');
  p.rect(1, 1, 16, 9, 'c');
  p.hline(1, 16, 9, 'C');
  heart(p, 7, 3, 'q', 'p');
});

def('mailbox', 12, 20, (p) => {
  p.rect(5, 9, 2, 10, 't');
  p.rect(1, 2, 10, 8, 'q');
  p.ellipse(6, 2.5, 5, 2, 'q');
  p.hline(1, 10, 9, 'Q');
  p.rect(3, 4, 6, 2, 'w');
  p.set(10, 1, 'y'); p.set(10, 2, 'y');
});

// ================= 건물 =================
function shingles(p, y0, y1, onColor, mark) {
  for (let y = y0; y <= y1; y++) {
    if ((y - y0) % 4 !== 0) continue;
    const k = (y - y0) / 4;
    for (let x = 0; x < p.w; x++) {
      if ((x + k * 2) % 4 !== 0) continue;
      if (p.get(x, y) === onColor) p.set(x, y, mark);
      if (p.get(x - 1, y - 1) === onColor) p.set(x - 1, y - 1, mark);
      if (p.get(x + 1, y - 1) === onColor) p.set(x + 1, y - 1, mark);
    }
  }
}
function archWindow(p, x, y, w, h) {
  p.rect(x, y + 2, w, h - 2, 'w');
  p.ellipse(x + w / 2, y + 3, w / 2, 3, 'w');
  p.rect(x + 1, y + 3, w - 2, h - 4, 'l');
  p.ellipse(x + w / 2, y + 3.5, w / 2 - 1, 2.5, 'l');
  p.vline(x + Math.floor(w / 2), y + 1, y + h - 1, 'w');
  p.hline(x, x + w - 1, y + Math.floor(h / 2) + 1, 'w');
  p.set(x + 1, y + 3, 'w'); p.set(x + 2, y + 3, 'a');
  p.set(x + w - 2, y + h - 2, 'L');
}
function flowerBox(p, x, y, w) {
  p.rect(x, y, w, 3, 'q');
  p.hline(x, x + w - 1, y + 2, 'Q');
  for (let i = x; i < x + w; i += 2) p.set(i, y - 1, i % 4 === 0 ? 'r' : 'w');
  for (let i = x + 1; i < x + w; i += 2) p.set(i, y - 1, 'G');
}

// 마녀의 집 (플레이어 집) 72 x 76
def('houseWitch', 72, 76, (p) => {
  // 벽
  p.rect(10, 42, 52, 30, 'c');
  p.vline(61, 42, 71, 'C'); p.vline(60, 44, 71, 'C');
  p.hline(10, 61, 71, 'P'); p.hline(10, 61, 70, 'p');
  // 지붕 (마녀 모자처럼 꺾인 끝)
  p.poly([[2, 46], [70, 46], [44, 12], [40, 4], [34, 8], [28, 14]], 'P');
  p.pts([[40, 3], [41, 2], [42, 2], [43, 2], [44, 3], [45, 4]], 'P');
  shingles(p, 14, 44, 'P', 'q');
  p.hline(2, 69, 45, 'Q'); p.hline(3, 68, 44, 'q');
  for (let x = 4; x < 68; x += 4) p.set(x, 46, 'Q');
  // 지붕 하이라이트
  for (let y = 12; y < 44; y += 1) {
    for (let x = 0; x < 72; x++) if (p.get(x, y) === 'P' || p.get(x, y) === 'q') { p.set(x + 1, y, 'p'); break; }
  }
  // 굴뚝
  p.rect(50, 18, 7, 12, 'x');
  p.vline(56, 18, 29, 'X');
  p.rect(49, 16, 9, 3, 'X');
  p.hline(49, 57, 16, 'x');
  heart(p, 51, 22, 'q', null);
  // 지붕 동그란 창
  p.ellipse(36, 30, 5, 5, 'w');
  p.ellipse(36, 30, 3.6, 3.6, 'l');
  star5(p, 36, 30);
  // 지붕 꼭대기 별
  star5(p, 46, 2);
  // 창문
  archWindow(p, 15, 48, 9, 12);
  archWindow(p, 48, 48, 9, 12);
  flowerBox(p, 14, 61, 11);
  flowerBox(p, 47, 61, 11);
  // 아치 문
  p.rect(30, 54, 12, 18, 'V');
  p.ellipse(36, 55, 6, 4, 'V');
  p.rect(31, 55, 10, 16, 'v');
  p.ellipse(36, 55.5, 5, 3, 'v');
  p.vline(36, 53, 71, 'V');
  p.pts([[34, 63], [38, 63]], 'y');
  star5(p, 36, 57);
  // 현관 계단
  p.rect(28, 72, 16, 3, 'x');
  p.hline(28, 43, 74, 'X');
});

// 모모의 포션 가게 72 x 72
// 파스텔 핑크 지붕 · 크림 벽 · 포션 모양 간판 · 작은 굴뚝 · 분홍 창문 · 꽃과 별 장식
def('shopPotion', 72, 72, (p) => {
  // 크림색 벽
  p.rect(8, 38, 56, 30, 'c');
  p.vline(63, 38, 67, 'C'); p.vline(62, 40, 67, 'C');
  p.hline(8, 63, 66, 'P'); p.hline(8, 63, 67, 'q');
  // 굴뚝 (지붕 뒤)
  p.rect(50, 12, 6, 14, 'x');
  p.vline(55, 12, 25, 'X');
  p.rect(49, 10, 8, 3, 'X'); p.hline(49, 56, 10, 'x');
  p.pts([[52, 7], [53, 6], [54, 7], [53, 8]], 'p');          // 하트 연기
  p.pts([[55, 3], [56, 2], [57, 3]], 'p');
  // 파스텔 핑크 박공 지붕
  p.poly([[1, 42], [71, 42], [40, 9], [36, 6], [32, 9]], 'P');
  shingles(p, 14, 40, 'P', 'q');
  for (let y = 9; y < 41; y++) {
    for (let x = 0; x < 72; x++) if (p.get(x, y) === 'P' || p.get(x, y) === 'q') { p.set(x + 1, y, 'p'); break; }
  }
  p.hline(1, 70, 41, 'Q'); p.hline(2, 69, 40, 'q');
  for (let x = 3; x < 70; x += 4) p.set(x, 42, 'Q');
  // 지붕 별 장식
  star5(p, 36, 4);
  star5(p, 22, 28); star5(p, 50, 33);
  // 포션병 모양 간판 (지붕 처마에 매달림)
  p.rect(35, 34, 2, 2, 't');
  p.rect(34, 36, 4, 3, 'a');
  p.ellipse(36, 44, 6.5, 5.5, 'q');
  p.hline(31, 41, 41, 'P');
  heart(p, 34, 43, 'w', null);
  p.pts([[32, 42], [32, 43]], 'p');
  // 분홍 아치 창문 + 꽃 상자
  p.rect(13, 47, 13, 13, 'P');
  p.ellipse(19.5, 48, 6.5, 3.5, 'P');
  p.rect(14, 48, 11, 11, 'p');
  p.ellipse(19.5, 48.5, 5.5, 2.5, 'p');
  p.vline(19, 46, 58, 'P'); p.hline(14, 24, 53, 'P');
  p.pts([[15, 48], [16, 48], [15, 49]], 'w');
  p.pts([[21, 55], [22, 56]], 'w');
  flowerBox(p, 12, 61, 15);
  // 작은 동그란 분홍 창
  p.ellipse(58.5, 51.5, 3.6, 3.6, 'P');
  p.ellipse(58.5, 51.5, 2.4, 2.4, 'p');
  p.set(57, 50, 'w');
  // 민트 문 (하트 창)
  p.rect(40, 50, 14, 18, 'G');
  p.ellipse(47, 51, 7, 4, 'G');
  p.rect(41, 51, 12, 16, 'g');
  p.ellipse(47, 51.5, 6, 3, 'g');
  p.rect(44, 53, 6, 5, 'm');
  heart(p, 45, 54, 'q', null);
  p.set(51, 60, 'y');
  // 문 옆 꽃 화분
  for (const x of [36, 56]) {
    p.rect(x, 64, 3, 3, 'k');
    p.pts([[x, 62], [x + 2, 62], [x + 1, 61]], x === 36 ? 'r' : 'L');
    p.set(x + 1, 63, 'G');
  }
  // 벽 별 장식
  p.pts([[29, 56], [28, 57], [30, 57], [29, 58]], 'y');
  // 계단
  p.rect(38, 68, 18, 3, 'x');
  p.hline(38, 55, 70, 'X');
});

// 베리의 작은 빵집 72 x 72
def('shopBakery', 72, 72, (p) => {
  p.rect(8, 36, 56, 32, 'c');
  p.vline(63, 36, 67, 'C'); p.vline(62, 38, 67, 'C');
  p.hline(8, 63, 67, 'k');
  // 박공 지붕 + 생크림 장식
  p.poly([[1, 38], [71, 38], [36, 6]], 'q');
  shingles(p, 14, 36, 'q', 'Q');
  for (let x = 2; x < 70; x++) {
    p.set(x, 36, 'w'); p.set(x, 37, 'w');
    if (x % 6 < 3) p.set(x, 38, 'w');
    if (x % 6 === 1) p.set(x, 39, 'w');
  }
  // 지붕 위 딸기
  p.ellipse(36, 8, 4, 4, 'r');
  p.pts([[35, 7], [37, 9], [35, 10]], 'y');
  p.pts([[34, 4], [35, 3], [36, 4], [37, 3], [38, 4]], 'G');
  // 굴뚝
  p.rect(14, 18, 6, 12, 'x');
  p.vline(19, 18, 29, 'X');
  p.rect(13, 16, 8, 3, 'X');
  // 동그란 창
  p.ellipse(36, 26, 4.5, 4.5, 'w');
  p.ellipse(36, 26, 3, 3, 'a');
  p.set(35, 25, 'w');
  // 줄무늬 차양
  for (let x = 10; x < 34; x++) {
    const c = Math.floor((x - 10) / 3) % 2 ? 'w' : 'q';
    p.vline(x, 42, 46, c);
    if ((x - 10) % 3 === 1) p.set(x, 47, c);
  }
  // 빵 진열창
  p.rect(12, 48, 20, 13, 'w');
  p.rect(13, 49, 18, 11, 'p');
  p.hline(13, 30, 55, 'w');
  for (const x of [14, 20, 26]) {
    p.ellipse(x + 2, 53.5, 2.6, 1.6, 'n');
    p.set(x + 1, 53, 'y');
  }
  p.ellipse(16, 58.5, 2.6, 1.4, 'N'); p.ellipse(23, 58.5, 2.6, 1.4, 'n'); p.ellipse(28, 58.5, 2.2, 1.4, 'r');
  flowerBox(p, 11, 63, 22);
  // 빵 간판
  p.rect(39, 39, 18, 7, 'w');
  p.ellipse(48, 42.5, 4, 2, 'n');
  p.pts([[46, 42], [48, 42], [50, 42]], 'N');
  // 나무 문
  p.rect(40, 49, 14, 19, 'T');
  p.ellipse(47, 50, 7, 4, 'T');
  p.rect(41, 50, 12, 17, 't');
  p.ellipse(47, 50.5, 6, 3, 't');
  p.vline(47, 48, 67, 'T');
  p.pts([[45, 58], [49, 58]], 'y');
  heart(p, 45, 52, 'r', null);
  p.rect(38, 68, 18, 3, 'x');
  p.hline(38, 55, 70, 'X');
});

// ================= 실내 장식 =================
def('window', 44, 52, (p) => {
  p.rect(0, 10, 44, 42, 'w');
  p.ellipse(22, 11, 22, 11, 'w');
  for (let y = 0; y < 52; y++) for (let x = 0; x < 44; x++) if (y > 11 && y < 49 && x > 2 && x < 41 && p.get(x, y)) p.set(x, y, 'l');
  p.ellipse(22, 11.5, 19, 9, 'l');
  // 별이 빛나는 밤하늘 그라데이션 (도트 밴드)
  for (let y = 3; y < 49; y++) for (let x = 3; x < 41; x++) {
    if (p.get(x, y) !== 'l') continue;
    p.set(x, y, y < 18 ? 'L' : y < 34 ? 'l' : 'a');
  }
  p.rect(21, 2, 2, 48, 'P');
  p.rect(2, 28, 40, 2, 'P');
  for (const [x, y] of [[8, 12], [32, 9], [14, 22], [30, 20], [8, 38], [34, 40], [15, 44], [27, 35]]) {
    p.set(x, y, 'w');
    if ((x + y) % 3 === 0) p.pts([[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]], 'w');
  }
  // 초승달
  p.pts([[30, 14], [29, 15], [29, 16], [30, 17], [31, 17]], 'y');
  p.hline(0, 43, 50, 'P'); p.hline(0, 43, 51, 'Q');
});

def('curtain', 14, 56, (p) => {
  p.rect(0, 0, 10, 40, 'w');
  for (let y = 0; y < 40; y++) if (y % 6 === 2) p.vline(3, y, y + 2, 'p');
  p.poly([[0, 40], [10, 40], [12, 55], [2, 55]], 'w');
  p.rect(0, 30, 11, 3, 'q');
  p.set(11, 31, 'Q');
  for (let y = 0; y < 56; y++) if (p.get(9, y) === 'w') p.set(9, y, 'p');
});

def('hangStar', 7, 22, (p) => {
  for (let y = 0; y < 14; y += 2) p.set(3, y, 'L');
  p.poly([[3.5, 12], [4.5, 15], [7, 15], [5, 17], [6, 21], [3.5, 19], [1, 21], [2, 17], [0, 15], [2.5, 15]], 'y');
  p.set(3, 15, 'w');
}, true);

def('doorMat', 32, 12, (p) => {
  p.ellipse(16, 6, 15, 5, 'q');
  p.ellipse(16, 6, 12, 3.5, 'P');
  heart(p, 14, 4, 'Q', null);
});

// ================= 가구 (꾸미기) =================
def('bed', 32, 44, (p) => {
  // 헤드보드
  p.rect(2, 4, 28, 14, 'w');
  p.ellipse(16, 5, 14, 5, 'w');
  p.vline(2, 2, 40, 'P'); p.vline(29, 2, 40, 'P');
  p.rect(1, 1, 3, 3, 'P'); p.rect(28, 1, 3, 3, 'P');
  heart(p, 14, 5, 'q', 'P');
  // 매트 + 베개
  p.rect(3, 14, 26, 26, 'w');
  p.ellipse(16, 16, 9, 3.4, 'w');
  p.hline(9, 23, 18, 'p');
  // 이불
  p.rect(3, 21, 26, 18, 'P');
  p.hline(3, 28, 21, 'w');
  p.hline(3, 28, 22, 'p');
  for (let x = 4; x < 28; x += 3) p.set(x, 38, 'q');
  p.hline(3, 28, 39, 'q');
  for (const [x, y] of [[7, 26], [19, 29], [11, 33]]) heart(p, x, y, 'q', null);
  p.vline(28, 23, 38, 'q');
  // 다리
  p.rect(2, 40, 2, 3, 'P'); p.rect(28, 40, 2, 3, 'P');
});

def('desk', 32, 32, (p) => {
  p.rect(1, 12, 30, 4, 'w');
  p.hline(1, 30, 15, 'p');
  p.rect(2, 16, 28, 8, 'w');
  p.rect(18, 17, 11, 6, 'p');
  heart(p, 21, 18, 'q', null);
  p.rect(2, 24, 2, 7, 'w'); p.rect(28, 24, 2, 7, 'w');
  p.vline(3, 24, 30, 'p'); p.vline(29, 24, 30, 'p');
  // 펼친 마법책
  p.rect(4, 8, 12, 4, 'L');
  p.rect(5, 7, 5, 4, 'w'); p.rect(11, 7, 4, 4, 'w');
  p.vline(10, 7, 11, 'v');
  p.pts([[6, 8], [7, 8], [12, 8], [13, 8], [6, 9], [12, 9]], 'L');
  // 수정구
  p.rect(19, 9, 6, 3, 'V');
  p.ellipse(22, 6, 4, 4, 'L');
  p.pts([[20, 4], [21, 4], [20, 5]], 'w');
  p.set(23, 7, 'l');
  // 양초
  p.rect(26, 7, 2, 5, 'w');
  p.set(26, 5, 'y'); p.set(26, 6, 'Y');
});

def('plant', 16, 26, (p) => {
  p.poly([[3, 16], [13, 16], [12, 25], [4, 25]], 'c');
  p.hline(2, 13, 16, 'w'); p.hline(2, 13, 17, 'w');
  p.hline(4, 12, 21, 'q');
  p.vline(12, 18, 24, 'C');
  for (const [x, y, rx, ry] of [[8, 9, 5, 5], [4, 11, 3, 3], [12, 11, 3, 3], [8, 4, 3, 3]]) p.ellipse(x, y, rx, ry, 'g');
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (p.get(x, y) === 'g' && !p.get(x, y + 1)) p.set(x, y, 'G');
  p.pts([[6, 4], [5, 7], [10, 8]], 'm');
  p.pts([[9, 2], [10, 2], [9, 3]], 'P');
  p.set(10, 3, 'Q');
  p.pts([[3, 10], [4, 10]], 'w');
});

def('rug', 48, 32, (p) => {
  p.ellipse(24, 16, 23, 15, 'w');
  p.ellipse(24, 16, 21, 13, 'P');
  p.ellipse(24, 16, 16, 9, 'p');
  for (let a = 0; a < 40; a++) {
    const t = (a / 40) * Math.PI * 2;
    p.set(Math.round(24 + Math.cos(t) * 22.4 - 0.5), Math.round(16 + Math.sin(t) * 14.4 - 0.5), a % 2 ? 'w' : 'p');
  }
  p.pts([[21, 13], [22, 13], [26, 13], [27, 13]], 'q');
  p.hline(20, 28, 14, 'q'); p.hline(21, 27, 15, 'q'); p.hline(22, 26, 16, 'q');
  p.hline(23, 25, 17, 'q'); p.set(24, 18, 'q');
  p.set(21, 13, 'p');
});

def('bookshelf', 32, 42, (p) => {
  p.rect(1, 2, 30, 39, 'w');
  p.rect(0, 0, 32, 3, 'P');
  p.hline(0, 31, 0, 'p');
  p.rect(3, 4, 26, 34, 'p');
  for (const y of [14, 25, 37]) p.rect(3, y, 26, 2, 'w');
  const colors = ['q', 'v', 'G', 'Y', 'L', 'A', 'Q', 'r'];
  const r = rng(7);
  for (const top of [4, 15, 27]) {
    let x = 4;
    while (x < 27) {
      const h = 7 + Math.floor(r() * 3), w = 2 + (r() < 0.3 ? 1 : 0);
      const c = colors[Math.floor(r() * colors.length)];
      if (r() < 0.15 && x < 24) {
        // 작은 포션병
        p.rect(x, top + 10 - 4, 3, 4, 'q'); p.set(x + 1, top + 10 - 5, 'w'); x += 4; continue;
      }
      p.rect(x, top + 10 - h, w, h, c);
      p.set(x, top + 10 - h + 1, 'w');
      x += w + (r() < 0.2 ? 1 : 0);
    }
  }
  p.rect(1, 39, 30, 2, 'P');
  p.vline(30, 3, 38, 'p');
});

// ================= 아이콘 (16 x 16) =================
def('iconBag', 16, 16, (p) => {
  p.rect(3, 6, 10, 9, 'P');
  p.ellipse(8, 6.5, 5, 2.5, 'P');
  p.rect(4, 3, 8, 2, 'q');
  p.rect(6, 3, 4, 1, null);
  p.pts([[5, 2], [6, 2], [9, 2], [10, 2], [4, 3], [11, 3]], 'q');
  p.rect(3, 8, 10, 2, 'q');
  heart(p, 6, 9, 'r', 'P');
  p.vline(12, 7, 14, 'q');
  p.hline(3, 12, 14, 'q');
  p.set(4, 7, 'p');
});
def('iconFlower', 16, 16, (p) => {
  p.vline(8, 10, 15, 'G');
  p.pts([[6, 13], [5, 12], [10, 13], [11, 12]], 'g');
  p.ellipse(8, 6.5, 5, 4.6, 'L');
  for (const [x, y] of [[8, 1], [4, 4], [12, 4], [5, 9], [11, 9]]) p.ellipse(x, y + 0.5, 1.6, 1.6, 'P');
  p.ellipse(8, 6.5, 2.4, 2.2, 'w');
  star5(p, 7, 6);
});
def('iconStar', 16, 16, (p) => {
  p.poly([[8, 1], [10, 6], [15, 6.2], [11, 9.5], [12.5, 15], [8, 12], [3.5, 15], [5, 9.5], [1, 6.2], [6, 6]], 'y');
  p.pts([[7, 4], [7, 5], [6, 6]], 'w');
  p.pts([[10, 11], [11, 12], [9, 11]], 'Y');
  p.set(13, 1, 'w'); p.set(2, 12, 'w');
});
def('iconPotion', 16, 16, (p) => {
  p.rect(6, 1, 4, 3, 't');
  p.rect(6, 4, 4, 2, 'a');
  p.ellipse(8, 10.5, 5.5, 5, 'a');
  p.ellipse(8, 11.5, 4.6, 3.6, 'q');
  p.hline(4, 12, 9, 'P');
  heart(p, 6, 10, 'Q', null);
  p.pts([[5, 7], [5, 8]], 'w');
  p.set(7, 1, 'T');
});
def('iconCookie', 16, 16, (p) => {
  p.ellipse(8, 8.5, 6.5, 6, 'n');
  p.ellipse(8, 8, 5, 4.6, 'w');
  p.ellipse(8, 8.5, 3, 2.8, 'r');
  p.pts([[7, 7], [9, 9]], 'y');
  p.set(7, 7, 'P');
  p.pts([[3, 12], [12, 4]], 'N');
});
def('iconHeart', 9, 8, (p) => {
  p.pts([[1, 1], [2, 1], [5, 1], [6, 1]], 'r');
  p.hline(0, 7, 2, 'r'); p.hline(0, 7, 3, 'r');
  p.hline(1, 6, 4, 'r'); p.hline(2, 5, 5, 'r'); p.hline(3, 4, 6, 'r');
  p.set(3, 1, null); p.set(4, 1, null);
  p.pts([[1, 2], [2, 1]], 'P');
});
def('iconQuest', 16, 16, (p) => {
  p.rect(3, 3, 10, 11, 'c');
  p.rect(2, 2, 12, 2, 'k'); p.rect(2, 13, 12, 2, 'k');
  for (const y of [6, 8, 10]) p.hline(5, 10, y, 'O');
  heart(p, 9, 9, 'q', null);
});
def('iconHouse', 16, 16, (p) => {
  p.poly([[1, 8], [15, 8], [8, 1]], 'P');
  p.rect(3, 8, 10, 7, 'c');
  p.rect(7, 10, 3, 5, 'V');
  p.pts([[4, 10], [5, 10]], 'l');
});
// 작은 장식용 (UI 테두리)
def('miniStar', 7, 7, (p) => {
  p.pts([[3, 0], [3, 1], [0, 3], [1, 3], [2, 3], [4, 3], [5, 3], [6, 3], [3, 5], [3, 6], [2, 2], [4, 2], [2, 4], [4, 4], [3, 2], [3, 4]], 'y');
  p.set(3, 3, 'w');
}, false);
def('miniFlower', 7, 7, flower('P', 'q'));

// ================= 월드 UI =================
function bubble(fn) {
  return (p) => {
    p.rect(1, 0, 11, 9, 'w');
    p.rect(0, 1, 13, 7, 'w');
    p.pts([[5, 9], [6, 9], [7, 9], [6, 10]], 'w');
    fn(p);
  };
}
def('bubbleHeart', 13, 11, bubble((p) => heart(p, 4, 3, 'r', 'P')));
def('bubbleExcl', 13, 11, bubble((p) => { p.vline(6, 2, 5, 'Q'); p.set(6, 7, 'Q'); }));
def('bubbleDots', 13, 11, bubble((p) => p.pts([[3, 4], [6, 4], [9, 4]], 'O')));
def('bubbleFlower', 13, 11, bubble((p) => {
  p.pts([[6, 2], [5, 3], [7, 3], [6, 4], [4, 2], [8, 2], [4, 4], [8, 4]], 'L');
  p.set(6, 3, 'y');
  p.vline(6, 5, 7, 'G');
}));
def('keyE', 11, 11, (p) => {
  p.rect(0, 0, 11, 10, 'w');
  p.hline(0, 10, 9, 'P');
  p.vline(3, 2, 6, 'Q'); p.hline(3, 7, 2, 'Q'); p.hline(3, 6, 4, 'Q'); p.hline(3, 7, 6, 'Q');
  p.set(0, 0, null); p.set(10, 0, null);
});
def('sparkle0', 7, 7, (p) => { p.pts([[3, 1], [3, 5], [1, 3], [5, 3]], 'y'); p.set(3, 3, 'w'); p.pts([[3, 2], [3, 4], [2, 3], [4, 3]], 'w'); }, false);
def('sparkle1', 7, 7, (p) => { p.pts([[3, 0], [3, 6], [0, 3], [6, 3]], 'w'); p.pts([[3, 1], [3, 2], [3, 4], [3, 5], [1, 3], [2, 3], [4, 3], [5, 3]], 'y'); p.set(3, 3, 'w'); }, false);
def('shadowS', 16, 5, (p) => p.ellipse(8, 2.5, 7.5, 2.4, 'O'), false);

// UI 9-slice 프레임 (CSS border-image 용, 7px 모서리)
function frame(fill, edge, inner, hi) {
  return (p) => {
    p.rect(2, 0, 17, 21, edge);
    p.rect(0, 2, 21, 17, edge);
    p.pts([[1, 1], [19, 1], [1, 19], [19, 19]], edge);
    p.rect(2, 2, 17, 17, inner);
    p.rect(3, 3, 15, 15, fill);
    p.pts([[2, 2], [18, 2], [2, 18], [18, 18]], edge);
    if (hi) { p.hline(4, 16, 3, hi); p.vline(3, 4, 16, hi); }
  };
}
def('uiFrame', 21, 21, frame('c', 'Q', 'P', 'w'), false);
def('uiFramePink', 21, 21, frame('p', 'Q', 'q', 'w'), false);
def('uiFrameSlot', 21, 21, frame('w', 'P', 'p', null), false);
def('uiFrameLav', 21, 21, frame('l', 'V', 'L', 'w'), false);

// 포션 가게 내부 / 포션 제작 이벤트 스프라이트
require('./shop.js')({ def, star5, heart, rng, flower, S });

module.exports = { S };

// 미리보기: 모든 스프라이트를 한 장에
module.exports.preview = function () {
  const names = Object.keys(S);
  const pad = 4, maxW = 400;
  let x = pad, y = pad, rowH = 0;
  const pos = [];
  for (const n of names) {
    const s = S[n];
    if (x + s.w + pad > maxW) { x = pad; y += rowH + pad; rowH = 0; }
    pos.push([n, x, y]);
    x += s.w + pad; rowH = Math.max(rowH, s.h);
  }
  const out = new Px(maxW, y + rowH + pad);
  for (const [n, px, py] of pos) out.blit(S[n], px, py);
  return out;
};
