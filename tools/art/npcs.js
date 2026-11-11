// NPC 동물 주민 — 24 x 36, 발끝 = y 34
//   모모(흰 토끼, 포션 가게) / 베리(크림 고양이, 빵집) / 플로라(양) / 루미(박쥐) / 체리(다람쥐)
// 프레임: idle0 · idle1(숨쉬기) · blink · pet0 · pet1(쓰다듬기 반응 2프레임)
const { Px } = require('../pixel.js');

const W = 24, H = 36;
const FRAMES = {
  idle0: { b: 0, ear: 0, blink: false, pet: -1 },
  idle1: { b: 1, ear: 1, blink: false, pet: -1 },
  blink: { b: 0, ear: 0, blink: true, pet: -1 },
  pet0:  { b: 0, ear: 0, blink: false, pet: 0 },
  pet1:  { b: 1, ear: 1, blink: false, pet: 1 },
};
const FRAME_ORDER = ['idle0', 'idle1', 'blink', 'pet0', 'pet1'];
const NPC_ORDER = ['momo', 'berry', 'flora', 'lumi', 'cherry'];

function L(fn) { const p = new Px(W, H); fn(p); return p.outline(); }

function cuteEyes(p, y, blink, xs = [8, 14]) {
  for (const x of xs) {
    if (blink) {
      p.pts([[x, y + 1], [x + 1, y + 1]], 'e');
    } else {
      p.rect(x, y - 1, 2, 3, 'e');
      p.set(x, y, 'w');                       // 반짝
    }
  }
}
// 기분 좋아서 감은 눈 (^ ^)
function happyEyes(p, y, xs = [8, 14]) {
  for (const x of xs) p.pts([[x - 1, y + 1], [x, y], [x + 1, y], [x + 2, y + 1]], 'e');
}
// 가늘게 뜬 눈 (- -)
function squintEyes(p, y, xs = [8, 14]) {
  for (const x of xs) { p.pts([[x - 1, y], [x, y + 1], [x + 1, y + 1], [x + 2, y]], 'e'); }
}
function bigBlush(p, y) {
  p.pts([[4, y], [5, y], [6, y], [5, y - 1], [17, y], [18, y], [19, y], [18, y - 1]], 'b');
}

// ---------------- 모모 (흰 토끼) ----------------
// 쓰다듬기: 귀가 쫑긋 서고 눈을 감으며 좋아함
function momo(fr) {
  const { b, ear, blink, pet } = FRAMES[fr];
  const petting = pet >= 0;
  const out = new Px(W, H);

  out.layer(L((p) => {
    p.ellipse(8.5, 33.5, 2.6, 1.6, 'w');
    p.ellipse(15.5, 33.5, 2.6, 1.6, 'w');
    p.set(8, 34, 'p').set(15, 34, 'p');
  }), 0, 0, null);

  // 귀 (평소엔 오른쪽 귀 끝이 접힘 / 쓰다듬으면 두 귀 모두 쫑긋)
  out.layer(L((p) => {
    if (petting) {
      const up = pet === 1 ? 1 : 0;
      p.ellipse(8.2 - up, 8 - up, 2.4, 7, 'w');
      p.ellipse(15.8 + up, 8 - up, 2.4, 7, 'w');
      p.vline(8 - up, 3 - up, 12, 'P'); p.vline(9 - up, 4 - up, 12, 'p');
      p.vline(15 + up, 4 - up, 12, 'p'); p.vline(16 + up, 3 - up, 12, 'P');
    } else {
      p.ellipse(8.6, 9 + b, 2.4, 6.6, 'w');
      p.ellipse(15.4, 10 + b, 2.4, 5.6, 'w');
      p.pts([[16, 4 + b + ear], [17, 4 + b + ear], [18, 5 + b + ear], [18, 6 + b + ear]], 'w');
      p.vline(8, 5 + b, 12 + b, 'P'); p.vline(9, 6 + b, 12 + b, 'p');
      p.vline(15, 7 + b, 13 + b, 'P'); p.vline(16, 8 + b, 13 + b, 'p');
    }
  }));

  out.layer(L((p) => {
    p.ellipse(12, 28.6, 7.4, 5.4, 'w');
    p.shadeEdges('w', 'p', [[0, 1]]);
    // 쓰다듬으면 두 팔을 번쩍
    const ay = petting ? 25 : 27 + b;
    p.ellipse(4.8, ay, 1.6, 1.8, 'w');
    p.ellipse(19.2, ay, 1.6, 1.8, 'w');
  }));

  out.layer(L((p) => {
    p.poly([[8.5, 25 + b], [15.5, 25 + b], [17, 32.5], [7, 32.5]], 'P');
    p.shadeEdges('P', 'q', [[1, 0]]);
    for (let x = 7; x <= 16; x += 2) p.set(x, 32, 'w');
    p.pts([[10, 28], [11, 28], [12, 28], [13, 28]], 'r');
    p.set(12, 28, 'Q');
    p.pts([[11, 29], [12, 29]], 'r');
  }));

  out.layer(L((p) => {
    p.ellipse(12, 19 + b, 8.2, 6.8, 'w');
    p.shadeEdges('w', 'p', [[0, 1]]);
    p.pts([[7, 14 + b], [8, 14 + b], [6, 15 + b]], 'w');
  }));

  if (petting) happyEyes(out, 19 + b);
  else cuteEyes(out, 19 + b, blink);
  out.set(11, 21 + b, 'Q').set(12, 21 + b, 'Q');
  if (petting) out.pts([[10, 22 + b], [11, 23 + b], [12, 23 + b], [13, 22 + b]], 'Q');   // 활짝 웃는 입
  else out.set(11, 22 + b, 'O').set(12, 22 + b, 'O');
  if (petting) bigBlush(out, 22 + b);
  else { out.pts([[5, 22 + b], [6, 22 + b], [17, 22 + b], [18, 22 + b]], 'b'); out.pts([[6, 21 + b], [17, 21 + b]], 'b'); }

  out.layer(L((p) => {
    p.pts([[16, 25 + b], [17, 26 + b], [18, 27 + b]], 'V');
    p.rect(17, 28, 4, 4, 'L');
    p.hline(17, 20, 28, 'v');
    p.set(19, 30, 'Q');
    p.set(18, 26, 'a').set(18, 27, 'q');
    p.set(18, 25, 't');
  }));
  return out;
}

// ---------------- 베리 (크림 고양이) ----------------
// 쓰다듬기: 눈을 가늘게 뜨고 꼬리를 살랑살랑
function berry(fr) {
  const { b, ear, blink, pet } = FRAMES[fr];
  const petting = pet >= 0;
  const out = new Px(W, H);

  // 꼬리 (pet1 은 반대쪽으로 흔들림)
  out.layer(L((p) => {
    if (petting && pet === 1) {
      p.pts([[18, 31], [19, 30], [20, 29], [21, 28], [22, 27], [22, 26], [22, 25], [21, 24], [20, 24]], 'c');
      p.pts([[19, 31], [20, 30], [21, 29]], 'c');
      p.set(21, 24, 'C'); p.set(20, 24, 'C');
    } else {
      const e = petting ? -1 : ear;
      p.pts([[18, 31], [19, 31], [20, 30], [20, 29], [21, 28], [21, 27], [20, 26 + e], [19, 26 + e]], 'c');
      p.pts([[19, 30], [20, 28]], 'c');
      p.set(20, 26 + e, 'C'); p.set(19, 26 + e, 'C');
    }
  }), 0, 0, null);

  out.layer(L((p) => {
    p.ellipse(8.5, 33.5, 2.6, 1.6, 'c');
    p.ellipse(15.5, 33.5, 2.6, 1.6, 'c');
    p.set(8, 34, 'P').set(15, 34, 'P');
  }));

  out.layer(L((p) => {
    p.poly([[4.5, 17 + b], [6, 9.5 + b + ear], [11, 13.5 + b]], 'c');
    p.poly([[19.5, 17 + b], [18, 9.5 + b], [13, 13.5 + b]], 'c');
    p.pts([[6, 12 + b + ear], [6, 13 + b], [7, 13 + b], [7, 14 + b]], 'P');
    p.pts([[18, 12 + b], [18, 13 + b], [17, 13 + b], [17, 14 + b]], 'P');
  }));

  out.layer(L((p) => {
    p.ellipse(12, 28.8, 6.8, 5.2, 'c');
    p.shadeEdges('c', 'C', [[0, 1]]);
    p.ellipse(5.4, 27 + b, 1.6, 1.8, 'c');
    p.ellipse(18.6, 27 + b, 1.6, 1.8, 'c');
  }));

  out.layer(L((p) => {
    p.poly([[9, 26 + b], [15, 26 + b], [16, 32.5], [8, 32.5]], 'w');
    p.hline(8, 15, 32, 'q');
    for (let x = 8; x <= 15; x += 2) p.set(x, 32, 'P');
    p.pts([[11, 28], [12, 28], [11, 29], [12, 29], [11, 30]], 'r');
    p.set(12, 30, 'R');
    p.set(11, 29, 'y');
    p.pts([[11, 27], [12, 27]], 'G');
  }));

  out.layer(L((p) => {
    p.ellipse(12, 19.4 + b, 8, 6.4, 'c');
    p.shadeEdges('c', 'C', [[0, 1]]);
    p.pts([[11, 14 + b], [12, 14 + b], [12, 15 + b], [11, 15 + b]], 'k');
    p.pts([[9, 14 + b], [14, 14 + b]], 'k');
  }));

  out.layer(L((p) => {
    p.ellipse(12.5, 12.4 + b, 4.2, 2.8, 'r');
    p.hline(9, 15, 14 + b, 'R');
    p.pts([[10, 12 + b], [13, 11 + b], [15, 13 + b], [12, 13 + b]], 'y');
    p.pts([[10, 11 + b], [11, 10 + b]], 'P');
    p.pts([[11, 9 + b], [12, 8 + b], [13, 9 + b], [14, 8 + b], [15, 9 + b], [12, 9 + b], [14, 9 + b], [13, 8 + b]], 'G');
    p.set(13, 7 + b, 'h');
    p.pts([[12, 8 + b], [14, 8 + b]], 'g');
  }));

  if (petting) {
    squintEyes(out, 19 + b);
    bigBlush(out, 22 + b);
  } else if (blink) {
    cuteEyes(out, 19 + b, false, [8]);
    out.pts([[14, 20 + b], [15, 19 + b], [16, 20 + b]], 'e');
  } else {
    cuteEyes(out, 19 + b, false);
  }
  out.set(11, 21 + b, 'Q').set(12, 21 + b, 'Q');
  out.pts([[10, 22 + b], [11, 23 + b], [12, 23 + b], [13, 22 + b]], 'O');
  if (!petting) out.pts([[5, 22 + b], [6, 22 + b], [17, 22 + b], [18, 22 + b]], 'b');
  out.pts([[2, 20 + b], [3, 21 + b], [21, 20 + b], [20, 21 + b]], 'O');
  return out;
}

// ---------------- 플로라 (양) ----------------
// 쓰다듬기: 늘어진 귀가 위로 팔랑, 머리의 꽃 장식이 살랑
function flora(fr) {
  const { b, blink, pet } = FRAMES[fr];
  const petting = pet >= 0;
  const out = new Px(W, H);

  // 짧은 다리
  out.layer(L((p) => {
    for (const x of [8, 14]) { p.rect(x, 31, 2, 3, 'k'); p.rect(x, 33, 2, 1, 'T'); }
  }), 0, 0, null);

  // 몽실몽실 양털 몸
  out.layer(L((p) => {
    for (const [x, y, r] of [[12, 28, 6.4], [6.5, 27, 3.2], [17.5, 27, 3.2], [8, 30.5, 3], [16, 30.5, 3], [12, 24, 4]]) p.ellipse(x, y, r, r * 0.9, 'w');
    p.shadeEdges('w', 'p', [[0, 1]]);
    p.pts([[9, 25], [14, 26], [11, 29]], 'p');
  }));

  // 늘어진 귀 (쓰다듬으면 위로)
  out.layer(L((p) => {
    const lift = petting ? (pet === 1 ? 3 : 2) : 0;
    p.ellipse(4.5, 18 + b - lift, 3.2, 1.7, 'k');
    p.ellipse(19.5, 18 + b - lift, 3.2, 1.7, 'k');
    p.hline(3, 5, 18 + b - lift, 'P');
    p.hline(19, 21, 18 + b - lift, 'P');
  }));

  // 얼굴
  out.layer(L((p) => {
    p.ellipse(12, 19.5 + b, 5.8, 5.4, 's');
    p.shadeEdges('s', 'S', [[0, 1]]);
  }));

  // 머리 양털 + 꽃 장식
  out.layer(L((p) => {
    for (const [x, y, r] of [[8, 14, 3.2], [12, 12.6, 3.8], [16, 14, 3.2]]) p.ellipse(x, y + b, r, r * 0.9, 'w');
    p.shadeEdges('w', 'p', [[0, 1]]);
    const s = petting ? (pet === 1 ? 1 : -1) : 0;
    const fl = (cx, cy, c) => {
      p.pts([[cx, cy - 1], [cx - 1, cy], [cx + 1, cy], [cx, cy + 1]], c);
      p.set(cx, cy, 'y');
    };
    fl(9 + s, 11 + b, 'P');
    fl(13 + s, 10 + b - (petting ? 1 : 0), 'L');
    fl(16 + s, 12 + b, 'q');
    p.pts([[11 + s, 11 + b], [15 + s, 11 + b]], 'G');
  }));

  if (petting) happyEyes(out, 19 + b, [9, 14]);
  else cuteEyes(out, 19 + b, blink, [9, 14]);
  out.set(11, 22 + b, 'S').set(12, 22 + b, 'S');
  out.pts([[11, 23 + b], [12, 23 + b]], petting ? 'Q' : 'O');
  if (petting) bigBlush(out, 22 + b);
  else out.pts([[7, 22 + b], [8, 22 + b], [15, 22 + b], [16, 22 + b]], 'b');
  return out;
}

// ---------------- 루미 (박쥐) ----------------
// 쓰다듬기: 날개를 파닥파닥, 시크하지만 볼이 빨개짐
function lumi(fr) {
  const { b, blink, pet } = FRAMES[fr];
  const petting = pet >= 0;
  const out = new Px(W, H);

  // 날개 (평소: 접힘 / pet0: 위로 / pet1: 아래로)
  out.layer(L((p) => {
    let wing;
    if (!petting) wing = [[8, 24], [3, 21], [2, 25], [0, 28], [3, 28], [5, 30], [8, 29]];
    else if (pet === 0) wing = [[8, 24], [3, 15], [2, 19], [0, 21], [3, 22], [4, 25], [8, 27]];
    else wing = [[8, 25], [2, 27], [3, 30], [1, 33], [5, 31], [8, 29]];
    p.poly(wing.map(([x, y]) => [x, y + b]), 'V');
    p.poly(wing.map(([x, y]) => [24 - x, y + b]), 'V');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (p.get(x, y) === 'V' && (x === 4 || x === 19)) p.set(x, y, 'v');
  }), 0, 0, null);

  // 작은 발
  out.layer(L((p) => { p.rect(9, 32, 2, 2, 'V'); p.rect(13, 32, 2, 2, 'V'); }));

  // 동글동글 몸
  out.layer(L((p) => {
    p.ellipse(12, 27.5 + b, 5.8, 5, 'L');
    p.ellipse(12, 28.5 + b, 3.4, 3.2, 'l');
    p.shadeEdges('L', 'v', [[0, 1]]);
  }));

  // 큰 귀
  out.layer(L((p) => {
    p.poly([[5, 17 + b], [4, 6.5 + b], [11, 13 + b]], 'L');
    p.poly([[19, 17 + b], [20, 6.5 + b], [13, 13 + b]], 'L');
    p.pts([[5, 10 + b], [5, 11 + b], [6, 12 + b], [6, 13 + b]], 'P');
    p.pts([[18, 10 + b], [18, 11 + b], [17, 12 + b], [17, 13 + b]], 'P');
  }));

  // 머리
  out.layer(L((p) => {
    p.ellipse(12, 18.5 + b, 7.4, 6, 'L');
    p.shadeEdges('L', 'v', [[0, 1]]);
    p.pts([[9, 13 + b], [10, 13 + b], [8, 14 + b]], 'l');
    // 별 머리핀
    p.pts([[16, 12 + b], [15, 13 + b], [17, 13 + b], [16, 14 + b]], 'y');
    p.set(16, 13 + b, 'w');
  }));

  if (petting) {
    happyEyes(out, 18 + b);
    bigBlush(out, 21 + b);
  } else if (blink) {
    cuteEyes(out, 18 + b, true);
  } else {
    // 반쯤 감은 시크한 눈
    for (const x of [8, 14]) {
      out.pts([[x, 17 + b], [x + 1, 17 + b]], 'e');
      out.pts([[x, 18 + b], [x + 1, 18 + b]], 'E');
      out.set(x, 18 + b, 'w');
    }
    out.pts([[6, 21 + b], [17, 21 + b]], 'b');
  }
  out.pts([[11, 21 + b], [12, 21 + b], [13, 21 + b]], 'O');
  out.set(12, 22 + b, 'w');                // 작은 송곳니
  return out;
}

// ---------------- 체리 (다람쥐) ----------------
// 쓰다듬기: 큰 꼬리를 흔들며 통통 (점프는 렌더링에서 위아래로)
function cherry(fr) {
  const { b, blink, pet } = FRAMES[fr];
  const petting = pet >= 0;
  const out = new Px(W, H);

  // 큰 꼬리 (뒤쪽)
  out.layer(L((p) => {
    const s = petting ? (pet === 0 ? 1 : -1) : 0;
    p.ellipse(18 + s, 23, 5, 8, 'n');
    p.ellipse(17 + s * 2, 14.5, 4.5, 3.6, 'n');
    p.ellipse(18.5 + s, 23.5, 2.4, 5.5, 'k');
    p.pts([[16 + s * 2, 13], [17 + s * 2, 13], [18 + s * 2, 14]], 'k');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (p.get(x, y) === 'n' && !p.get(x + 1, y)) p.set(x, y, 'N');
  }), 0, 0, null);

  out.layer(L((p) => {
    p.ellipse(8.5, 33.5, 2.4, 1.5, 'N');
    p.ellipse(13.5, 33.5, 2.4, 1.5, 'N');
  }));

  // 몸 + 크림색 배
  out.layer(L((p) => {
    p.ellipse(11, 28.5, 5.6, 5, 'n');
    p.ellipse(11, 29.5, 3.2, 3.4, 'c');
    // 도토리를 꼭 쥔 손 (쓰다듬으면 만세)
    if (petting) { p.ellipse(4.5, 24.5, 1.5, 1.6, 'n'); p.ellipse(17.5, 24.5, 1.5, 1.6, 'n'); }
    else { p.rect(9, 26 + b, 4, 3, 'N'); p.hline(9, 12, 26 + b, 'T'); p.set(10, 27 + b, 'n'); }
  }));

  // 뾰족 귀
  out.layer(L((p) => {
    p.poly([[5, 15 + b], [6, 9 + b], [9.5, 13 + b]], 'n');
    p.poly([[17, 15 + b], [16, 9 + b], [12.5, 13 + b]], 'n');
    p.set(6, 9 + b, 'N'); p.set(16, 9 + b, 'N');
    p.pts([[6, 12 + b], [16, 12 + b]], 'P');
  }));

  // 머리 + 볼
  out.layer(L((p) => {
    p.ellipse(11, 19 + b, 7, 5.8, 'n');
    p.ellipse(11, 21 + b, 4.2, 2.6, 'c');
    p.shadeEdges('n', 'N', [[0, 1]]);
    // 체리 머리핀
    p.pts([[13, 13 + b], [14, 12 + b], [15, 12 + b]], 'G');
    p.rect(12, 14 + b, 2, 2, 'r'); p.rect(15, 13 + b, 2, 2, 'r');
    p.set(12, 14 + b, 'P'); p.set(15, 13 + b, 'P');
  }));

  if (petting) happyEyes(out, 18 + b, [7, 13]);
  else cuteEyes(out, 18 + b, blink, [7, 13]);
  out.set(10, 20 + b, 'e'); out.set(11, 20 + b, 'e');
  out.pts([[9, 22 + b], [10, 22 + b], [11, 22 + b], [12, 22 + b]], petting ? 'Q' : 'O');
  if (petting) { out.pts([[4, 21 + b], [5, 21 + b], [16, 21 + b], [17, 21 + b], [4, 20 + b], [17, 20 + b]], 'b'); }
  else out.pts([[5, 21 + b], [16, 21 + b]], 'b');
  return out;
}

const DRAW = { momo, berry, flora, lumi, cherry };

function sheet() {
  const p = new Px(W * FRAME_ORDER.length, H * NPC_ORDER.length);
  NPC_ORDER.forEach((id, row) => {
    FRAME_ORDER.forEach((fr, col) => p.blit(DRAW[id](fr), col * W, row * H));
  });
  return p;
}

module.exports = { sheet, W, H, FRAME_ORDER, NPC_ORDER, ...DRAW };
