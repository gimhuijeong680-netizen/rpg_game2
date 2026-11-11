// 픽셀 아트 소스(tools/art) → PNG 스프라이트 시트(assets/) + 좌표표(js/data/atlas.js)
// 실행: node tools/build-assets.js
const fs = require('fs');
const path = require('path');
const { Px } = require('./pixel.js');
const witch = require('./art/witch.js');
const npcs = require('./art/npcs.js');
const { S } = require('./art/world.js');

const ROOT = path.join(__dirname, '..');
const out = (rel, buf) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
  console.log('  ' + rel);
};

console.log('PINKLE 에셋 빌드');

// 1) 캐릭터 시트
out('assets/sprites/witch.png', witch.sheet().toPNG());
out('assets/sprites/npcs.png', npcs.sheet().toPNG());

// 2) 월드 스프라이트 아틀라스 (높이순 선반 배치)
const SHEET_W = 512, PAD = 1;
const names = Object.keys(S).sort((a, b) => S[b].h - S[a].h || a.localeCompare(b));
const rects = {};
let x = PAD, y = PAD, rowH = 0;
for (const n of names) {
  const s = S[n];
  if (x + s.w + PAD > SHEET_W) { x = PAD; y += rowH + PAD; rowH = 0; }
  rects[n] = [x, y, s.w, s.h];
  x += s.w + PAD;
  rowH = Math.max(rowH, s.h);
}
const sheet = new Px(SHEET_W, y + rowH + PAD);
for (const n of names) sheet.blit(S[n], rects[n][0], rects[n][1]);
out('assets/sprites/world.png', sheet.toPNG());

// 3) CSS 용 UI 프레임 (9-slice) 과 장식
for (const [n, file] of [['uiFrame', 'frame-cream'], ['uiFramePink', 'frame-pink'], ['uiFrameSlot', 'frame-slot'], ['uiFrameLav', 'frame-lav']]) {
  out(`assets/ui/${file}.png`, S[n].toPNG());
}
out('assets/ui/mini-star.png', S.miniStar.toPNG());
out('assets/ui/mini-heart.png', S.iconHeart.toPNG());
out('assets/ui/mini-flower.png', S.miniFlower.toPNG());

// 4) 좌표표
const atlas = {
  sheets: {
    witch: 'assets/sprites/witch.png',
    npcs: 'assets/sprites/npcs.png',
    world: 'assets/sprites/world.png',
  },
  characters: {
    witch: { sheet: 'witch', w: witch.W, h: witch.H, rows: Object.fromEntries(witch.DIRS.map((d, i) => [d, i])), frames: witch.FRAME_ORDER },
    npcs: { sheet: 'npcs', w: npcs.W, h: npcs.H, rows: Object.fromEntries(npcs.NPC_ORDER.map((d, i) => [d, i])), frames: npcs.FRAME_ORDER },
  },
  sprites: rects,
};
out('js/data/atlas.js',
  '// 자동 생성 파일 — 직접 수정하지 말고 node tools/build-assets.js 를 실행하세요\n' +
  'PK.atlas = ' + JSON.stringify(atlas, null, 0).replace(/\],"/g, '],\n  "') + ';\n');

console.log('완료');
