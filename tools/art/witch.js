// 주인공: 분홍 머리 꼬마 마녀 (24 x 36, 발끝 = y 34)
const { Px } = require('../pixel.js');

const W = 24, H = 36;

// 프레임별 움직임: b = 상체 바운스, s = 모자 끝 흔들림, h = 머리카락 끝 흔들림, leg = 다리 자세
const FRAMES = {
  idle0: { b: 0, s: 0, h: 0, leg: 'stand' },
  idle1: { b: 1, s: 0, h: 0, leg: 'stand' },
  stepA: { b: 1, s: 1, h: 1, leg: 'A' },
  pass:  { b: 0, s: 0, h: 0, leg: 'stand' },
  stepB: { b: 1, s: -1, h: -1, leg: 'B' },
};

function layerOf(fn) {
  const p = new Px(W, H);
  fn(p);
  return p;
}

// 별 (+ 모양, 가운데 흰 반짝임)
function star(p, cx, cy) {
  p.pts([[cx, cy - 1], [cx - 1, cy], [cx + 1, cy], [cx, cy + 1]], 'y');
  p.set(cx, cy, 'w');
}

// ---------- 모자 ----------
function hat(dir, b, s) {
  const p = new Px(W, H);
  const back = dir === 'side' ? -1 : 1;     // 옆모습은 모자 끝이 뒤로 꺾임
  const Y = (y) => y + b;
  p.poly([[6.5, Y(13)], [17.5, Y(13)], [14, Y(3.5)], [10.5, Y(3.5)]], 'v');
  // 접힌 끝
  const tip = back > 0
    ? [[11, 3], [12, 2], [13, 2], [14, 1], [15, 1], [16, 1], [17, 2], [17, 3]]
    : [[13, 3], [12, 2], [11, 2], [10, 1], [9, 1], [8, 1], [7, 2], [7, 3]];
  for (const [x, y] of tip) p.set(x + s, Y(y), 'v');
  p.set((back > 0 ? 17 : 7) + s, Y(3), 'V');
  p.set((back > 0 ? 15 : 9) + s, Y(1), 'L');
  // 왼쪽 하이라이트 / 오른쪽 그늘
  for (let y = 4; y <= 11; y++) {
    const row = [];
    for (let x = 0; x < W; x++) if (p.get(x, Y(y))) row.push(x);
    if (!row.length) continue;
    p.set(row[0] + 1, Y(y), 'L');
    p.set(row[row.length - 1], Y(y), 'V');
  }
  // 리본 띠
  for (let x = 0; x < W; x++) {
    if (p.get(x, Y(10))) p.set(x, Y(10), 'P');
    if (p.get(x, Y(11))) p.set(x, Y(11), 'q');
  }
  // 챙
  p.ellipse(12, Y(13.4), 10, 2.1, 'v');
  for (let x = 0; x < W; x++) if (p.get(x, Y(14))) p.set(x, Y(14), 'V');
  p.hline(5, 7, Y(12), 'L');
  // 리본 매듭 (정면/옆: 오른쪽, 뒷모습: 왼쪽)
  const bx = dir === 'up' ? 6 : 14;
  p.pts([[bx, Y(9)], [bx + 1, Y(9)], [bx + 3, Y(9)], [bx + 4, Y(9)]], 'P');
  p.pts([[bx, Y(10)], [bx + 1, Y(10)], [bx + 3, Y(10)], [bx + 4, Y(10)]], 'q');
  p.pts([[bx + 2, Y(10)]], 'Q');
  p.pts([[bx + 1, Y(11)], [bx + 3, Y(11)]], 'Q');
  if (dir === 'down') star(p, 12, Y(7));
  return p.outline();
}

// ---------- 다리 ----------
function legs(dir, pose) {
  return layerOf((p) => {
    let L;
    if (dir === 'side') {
      L = { stand: [[10, 0], [12, 0]], A: [[8, 0], [14, 0]], B: [[9, 0], [13, -1]] }[pose];
    } else {
      L = { stand: [[9, 0], [13, 0]], A: [[9, -1], [13, 0]], B: [[9, 0], [13, -1]] }[pose];
    }
    for (const [x, lift] of L) {
      const bottom = 34 + lift;
      p.rect(x, 31, 2, bottom - 32, 'w');        // 흰 스타킹
      p.rect(x, bottom - 1, 2, 2, 'Q');          // 분홍 구두
      p.set(x, bottom - 1, 'q');
    }
  }).outline();
}

// ---------- 원피스 ----------
function dress(dir, b, frame) {
  return layerOf((p) => {
    const t = 25 + b;
    p.poly([[8, t], [16, t], [18.5, 32], [5.5, 32]], 'L');
    p.shadeEdges('L', 'v', [[1, 0]]);
    // 프릴 밑단
    p.hline(6, 17, 31, 'w');
    for (let x = 6; x <= 17; x += 2) p.set(x, 32, 'w');
    p.pts([[8, 31], [12, 31], [16, 31]], 'p');
    // 칼라 + 가슴 리본
    p.hline(9, 14, t, 'w');
    if (dir === 'down') {
      p.pts([[10, t + 1], [13, t + 1]], 'w');
      p.pts([[11, t + 1], [12, t + 1]], 'Q');
      p.pts([[11, t + 2], [12, t + 2]], 'q');
      p.set(12, t + 4, 'y');   // 별 단추
    } else if (dir === 'side') {
      p.pts([[15, t + 1]], 'Q');
    } else {
      p.set(11, t + 3, 'V').set(12, t + 3, 'V');   // 뒷 리본 끈
    }
    // 퍼프 소매 + 손
    const swing = frame.leg === 'A' ? 1 : frame.leg === 'B' ? -1 : 0;
    if (dir === 'side') {
      p.ellipse(12, t + 2, 1.6, 1.6, 'w');
      p.set(12 + swing, t + 3, 'w');
      p.set(12 + swing, t + 4, 's');
    } else {
      p.ellipse(7.5, t + 1.5, 1.6, 1.6, 'w');
      p.ellipse(16.5, t + 1.5, 1.6, 1.6, 'w');
      p.set(6, t + 3, 's').set(17, t + 3, 's');
    }
  }).outline();
}

// ---------- 마법 지팡이 ----------
function wand(dir, b) {
  return layerOf((p) => {
    if (dir === 'down') {
      p.pts([[18, 28 + b], [19, 27 + b], [19, 26 + b], [20, 25 + b]], 'T');
      star(p, 20, 23 + b);
    } else if (dir === 'side') {
      p.pts([[13, 29 + b], [14, 28 + b], [15, 28 + b], [16, 27 + b]], 'T');
      star(p, 18, 27 + b);
    }
  }).outline();
}

// ---------- 머리 ----------
function backHair(dir, b, h) {
  return layerOf((p) => {
    const Y = (y) => y + b;
    if (dir === 'down') {
      p.ellipse(12, Y(19), 7.6, 7.2, 'P');
      p.rect(6, Y(22), 12, 4, 'P');                 // 목 뒤로 보이는 머리
    } else if (dir === 'up') {
      p.ellipse(12, Y(19), 7.6, 7.2, 'P');
      p.poly([[5.5, Y(20)], [18.5, Y(20)], [17.5, Y(29)], [14.5, Y(30)], [12, Y(29)], [9.5, Y(30)], [6.5, Y(29)]], 'P');
      p.set(7 + h, Y(30), 'P').set(16 + h, Y(30), 'P');
      // 머리결 (짧은 웨이브 결)
      p.pts([[9, Y(23)], [10, Y(24)], [9, Y(25)], [14, Y(22)], [15, Y(23)], [14, Y(24)], [12, Y(26)], [12, Y(27)]], 'q');
      p.paint(9, Y(14), 'p').paint(10, Y(13), 'p').paint(11, Y(13), 'p').paint(8, Y(15), 'p');
    } else {
      p.ellipse(11.4, Y(19), 7.4, 7.2, 'P');
      // 뒤로 흐르는 웨이브
      p.poly([[4.5, Y(19)], [9, Y(19)], [9, Y(27)], [7, Y(29)], [4.5, Y(28)]], 'P');
      p.set(4 + h, Y(29), 'P').set(5 + h, Y(29), 'q');
      p.vline(6, Y(22), Y(27), 'q');
    }
    p.shadeEdges('P', 'q', [[0, 1]]);
  }).outline();
}

function face(dir, b) {
  return layerOf((p) => {
    if (dir === 'down') p.ellipse(12, 20.4 + b, 6, 5.2, 's');
    else if (dir === 'side') p.ellipse(13.8, 20.4 + b, 5.2, 5.2, 's');
  }).outline();
}

function bangs(dir, b) {
  return layerOf((p) => {
    if (dir === 'up') return;
    const side = dir === 'side';
    p.ellipse(side ? 12.4 : 12, 16.6 + b, side ? 7.2 : 7.6, 4.6, 'P');
    // 앞머리 끝 (열마다 아래 경계, 들쭉날쭉 웨이브)
    const fringe = side
      ? { 6: 21, 7: 22, 8: 23, 9: 22, 10: 20, 11: 18, 12: 17, 13: 17, 14: 16, 15: 17, 16: 16, 17: 17, 18: 16, 19: 17 }
      : { 5: 22, 6: 21, 7: 18, 8: 17, 9: 17, 10: 16, 11: 17, 12: 16, 13: 17, 14: 16, 15: 17, 16: 18, 17: 21, 18: 22 };
    for (let x = 0; x < W; x++) {
      const end = fringe[x];
      for (let y = 0; y < H; y++) {
        if (p.get(x, y) && (end === undefined || y > end + b)) p.set(x, y, null);
      }
      if (end !== undefined) for (let y = 15 + b; y <= end + b; y++) p.set(x, y, 'P');
    }
    // 윤기 하이라이트
    p.paint(9, 13 + b, 'p').paint(10, 13 + b, 'p').paint(11, 12 + b, 'p').paint(8, 14 + b, 'p');
    p.shadeEdges('P', 'q', [[0, 1]]);
  }).outline();
}

// 얼굴을 감싸는 옆머리 (정면) — 끝이 살랑 흔들림
function locks(b, h) {
  return layerOf((p) => {
    p.rect(4, 19 + b, 2, 7, 'P');
    p.rect(18, 19 + b, 2, 7, 'P');
    p.pts([[4 + h, 26 + b], [5 + h, 26 + b], [18 + h, 26 + b], [19 + h, 26 + b]], 'P');
    p.pts([[5 + h, 27 + b], [18 + h, 27 + b]], 'q');
    p.set(4, 20 + b, 'p').set(19, 20 + b, 'p');
    p.set(5, 25 + b, 'q').set(18, 25 + b, 'q');
  }).outline();
}

function faceDetails(p, dir, b) {
  const eye = (x, y) => {
    p.set(x, y, 'e').set(x + 1, y, 'e');
    p.set(x, y + 1, 'w').set(x + 1, y + 1, 'E');
    p.set(x, y + 2, 'E').set(x + 1, y + 2, 'E');
  };
  if (dir === 'down') {
    eye(8, 19 + b);
    eye(14, 19 + b);
    p.set(6, 22 + b, 'b').set(7, 22 + b, 'b');
    p.set(16, 22 + b, 'b').set(17, 22 + b, 'b');
    p.set(11, 23 + b, 'Q').set(12, 23 + b, 'Q');
  } else if (dir === 'side') {
    eye(15, 19 + b);
    p.set(17, 22 + b, 'b').set(18, 22 + b, 'b');
    p.set(18, 23 + b, 'Q');
  }
}

// ---------- 합성 ----------
function witch(dir, frameName) {
  const f = FRAMES[frameName];
  const out = new Px(W, H);
  out.layer(legs(dir, f.leg), 0, 0, null);
  if (dir !== 'up') out.layer(backHair(dir, f.b, f.h));
  out.layer(dress(dir, f.b, f));
  if (dir === 'up') {
    out.layer(backHair(dir, f.b, f.h));
    // 목덜미 리본
    out.pts([[10, 24 + f.b], [13, 24 + f.b]], 'q');
    out.pts([[11, 24 + f.b], [12, 24 + f.b]], 'Q');
  } else {
    out.layer(face(dir, f.b));
    out.layer(bangs(dir, f.b));
    faceDetails(out, dir, f.b);
    if (dir === 'down') out.layer(locks(f.b, f.h));
  }
  out.layer(wand(dir, f.b));
  out.layer(hat(dir, f.b, f.s));
  return out;
}

const DIRS = ['down', 'up', 'left', 'right'];
const FRAME_ORDER = ['idle0', 'idle1', 'stepA', 'pass', 'stepB'];

// 시트: 행 = 방향, 열 = 프레임
function sheet() {
  const p = new Px(W * FRAME_ORDER.length, H * DIRS.length);
  DIRS.forEach((d, row) => {
    FRAME_ORDER.forEach((fr, col) => {
      const base = d === 'left' || d === 'right' ? witch('side', fr) : witch(d, fr);
      p.blit(d === 'left' ? base.flipped() : base, col * W, row * H);
    });
  });
  return p;
}

module.exports = { sheet, W, H, DIRS, FRAME_ORDER };
