// 게임 로직 자동 테스트 (브라우저 없이 실제 시스템 코드를 그대로 실행)
// 실행: node tests/run-tests.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
// index.html 의 로드 순서를 그대로 따르되, 화면/DOM 전용 파일은 제외
const files = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1])
  .filter((f) => !/js\/(render|ui|dev)\/|main\.js|assets\.js/.test(f));

const store = {};
const ctx = { console, Math, JSON, Object, Array, Set, Map, Promise, String, Number };
ctx.window = ctx;
ctx.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
vm.createContext(ctx);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
const PK = ctx.PK;

// ---------- 도우미 ----------
const DT = 1 / 60;
function input(hold = {}, tap = {}, actions = []) {
  const i = PK.input.empty();
  Object.assign(i, hold);
  Object.assign(i.justPressed, tap);
  i.actions = actions;
  return i;
}
function run(state, frames, hold = {}) { for (let k = 0; k < frames; k++) PK.game.step(state, input(hold), DT); }
function press(state, key, hold = {}) { PK.game.step(state, input(hold, { [key]: true }), DT); }
function act(state, action) { PK.game.step(state, input({}, {}, [action]), DT); }
function talkThrough(state, choiceIndex = 0, max = 40) {
  for (let k = 0; k < max && state.ui.dialog; k++) {
    const d = state.ui.dialog;
    const line = d.lines[d.index];
    if (d.shown < line.text.length) press(state, 'interact');
    else if (line.choices) act(state, { type: 'dialogChoose', index: choiceIndex });
    else press(state, 'interact');
    run(state, 1);
  }
}
function place(state, x, y) { const p = state.player; p.x = x; p.y = y; }
const overlap = (a, b) => PK.collision.rectsOverlap(a, b);
const count = (s, id) => PK.actions.count(s, id);
const MOMO_SPOT = { x: 140, y: 100 };          // 모모 책상 옆 (가게 안)
const CAULDRON_SPOT = { x: 154, y: 156 };      // 가마솥 바로 앞
function inShop(s, at = MOMO_SPOT) { s.scene = 'shop'; place(s, at.x, at.y); run(s, 1); }
function talkMomo(s, choice = 0) {
  inShop(s);
  if (!(s.ui.prompt && s.ui.prompt.kind === 'npc' && s.ui.prompt.id === 'momo')) throw new Error('모모 프롬프트 없음: ' + JSON.stringify(s.ui.prompt));
  press(s, 'interact');
  talkThrough(s, choice);
}
// 달빛 꽃 하나를 실제로 걸어가서 줍기
function pickMoon(s, id) {
  const f = PK.data.worlds.village.pickups.find((p) => p.id === id);
  s.scene = 'village';
  place(s, f.x + 1, f.y + 12);
  run(s, 1);
  if (!(s.ui.prompt && s.ui.prompt.kind === 'pickup' && s.ui.prompt.id === id)) throw new Error(id + ' 프롬프트 없음: ' + JSON.stringify(s.ui.prompt));
  press(s, 'interact');
  talkThrough(s);
}
function brewAll(s) {
  inShop(s, CAULDRON_SPOT);
  press(s, 'interact');
  for (let k = 0; k < 400 && s.ui.brew && !s.ui.brew.result; k++) { press(s, 'interact'); run(s, 5); }
}

let pass = 0, fail = 0;
const results = [];
function section(t) { results.push('\n  ── ' + t); }
function check(id, title, fn) {
  try {
    const notes = fn() || '';
    pass++; results.push(`  ✅ ${id} ${title}${notes ? '  — ' + notes : ''}`);
  } catch (e) {
    fail++; results.push(`  ❌ ${id} ${title}\n      ${e.message}`);
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

// =====================================================================
section('포션 가게 이벤트: 모모와 달콤한 마법 포션');

check('CHECK 01', '포션 가게에 입장 (걸어서 / E키) 및 퇴장', () => {
  const W = PK.data.worlds.village;
  const shop = W.objects.find((o) => o.id === 'potionShop');
  const s = PK.createInitialState();
  // 건물은 통과 불가
  place(s, 400, 128); run(s, 120, { up: true });
  assert(!overlap(s.player, shop.collider), '가게 벽을 통과함');
  // 문으로 걸어 들어가기
  place(s, 426, 124); run(s, 40, { up: true }); run(s, 40);
  assert(s.scene === 'shop', '걸어서 입장 안 됨: ' + s.scene);
  // 나가기
  run(s, 160, { down: true }); run(s, 40);
  assert(s.scene === 'village', '퇴장 안 됨');
  // E 키로 입장
  place(s, 426, 117); run(s, 1);
  assert(s.ui.prompt && s.ui.prompt.kind === 'door' && s.ui.prompt.id === 'shopDoor', '가게 문 프롬프트 없음');
  press(s, 'interact'); run(s, 40);
  assert(s.scene === 'shop', 'E로 입장 안 됨');
  return '문 앞 E / 걸어서 입장, 매트로 퇴장';
});

check('CHECK 02', '모모와 대화하면 퀘스트 시작 (COLLECTING, 0/3)', () => {
  const s = PK.createInitialState();
  inShop(s);
  press(s, 'interact');
  const first = s.ui.dialog.lines[0].text;
  assert(first.startsWith('앗! 마침 잘 왔어!'), '첫 대사: ' + first);
  talkThrough(s);
  const ev = s.events.moonPotion;
  assert(ev.status === 'COLLECTING' && ev.flowers === 0, JSON.stringify(ev));
  const q = PK.questView(s).find((x) => x.id === 'moonPotion');
  assert(q.active && q.current === '달빛 꽃 수집하기 (0/3)', '퀘스트 표시: ' + q.current);
  return `status=${ev.status}, HUD "${q.current}"`;
});

check('CHECK 03/04', '달빛 꽃 3개 각각 획득 + 수량 실시간 변경', () => {
  const s = PK.createInitialState();
  // 시작 전에는 주울 수 없음
  pickMoon(s, 'moon1');
  assert(count(s, 'moonFlower') === 0 && !s.world.collected.moon1, '시작 전에 주워짐');
  talkMomo(s);
  const seen = [];
  for (const id of ['moon1', 'moon2', 'moon3']) {
    pickMoon(s, id);
    assert(s.world.collected[id], id + ' 이(가) 맵에서 사라지지 않음');
    const q = PK.questView(s).find((x) => x.id === 'moonPotion');
    seen.push(q.steps[1].text.match(/\d\/3/)[0]);
  }
  assert(seen.join() === '1/3,2/3,3/3', '진행 표시: ' + seen);
  assert(count(s, 'moonFlower') === 3 && s.events.moonPotion.flowers === 3, '인벤토리 ' + count(s, 'moonFlower'));
  // 이미 주운 꽃 자리에서는 다시 주울 수 없음
  s.scene = 'village';
  const f = PK.data.worlds.village.pickups.find((p) => p.id === 'moon1');
  place(s, f.x + 1, f.y + 12); run(s, 1);
  assert(!(s.ui.prompt && s.ui.prompt.id === 'moon1'), '주운 꽃을 또 주울 수 있음');
  return '표시 ' + seen.join(' → ');
});

check('CHECK 05', '꽃이 부족하면 제작 불가', () => {
  const s = PK.createInitialState();
  talkMomo(s);
  pickMoon(s, 'moon1'); pickMoon(s, 'moon2');
  // 모모: 부족한 개수 안내, 상태 유지
  inShop(s); press(s, 'interact');
  const t = s.ui.dialog.lines[0].text;
  assert(/1개 부족/.test(t), '부족 안내 대사: ' + t);
  talkThrough(s);
  assert(s.events.moonPotion.status === 'COLLECTING', '2개인데 진행됨');
  // 가마솥: 제작 창이 열리지 않음
  inShop(s, CAULDRON_SPOT);
  assert(s.ui.prompt && s.ui.prompt.kind === 'station', '가마솥 프롬프트 없음');
  press(s, 'interact');
  assert(!s.ui.brew, '꽃 2개로 제작 창이 열림');
  assert(/부족/.test(s.ui.dialog.lines[0].text), '가마솥 안내: ' + s.ui.dialog.lines[0].text);
  talkThrough(s);
  // 제작 함수를 억지로 불러도 꽃 없이 진행 불가
  s.events.moonPotion.status = 'BREWING'; s.ui.brew = { anim: null, result: false };
  const okAct = PK.brew.act(s);
  assert(!okAct && s.events.moonPotion.brewStep === 0 && count(s, 'moonFlower') === 2, '부족한데 재료 넣기 성공');
  return `모모 "${t}"`;
});

check('CHECK 06', '꽃 3개 → 모모 확인 → 가마솥에서 제작 시작', () => {
  const s = PK.createInitialState();
  talkMomo(s);
  for (const id of ['moon1', 'moon2', 'moon3']) pickMoon(s, id);
  inShop(s); press(s, 'interact');
  assert(s.ui.dialog.lines[0].text === '우와! 달빛 꽃을 전부 모아왔구나!', s.ui.dialog.lines[0].text);
  talkThrough(s);
  assert(s.events.moonPotion.status === 'READY_TO_BREW', s.events.moonPotion.status);
  assert(s.npcs.momo.spot === 'cauldron', '모모가 가마솥으로 이동하지 않음');
  const before = PK.game.npcPos(s, PK.data.worlds.shop.npcs[0]);
  run(s, 90);
  const after = PK.game.npcPos(s, PK.data.worlds.shop.npcs[0]);
  assert(before.x !== after.x && after.x === 198, `이동 연출 ${JSON.stringify(before)} → ${JSON.stringify(after)}`);
  inShop(s, CAULDRON_SPOT);
  assert(s.ui.prompt.label === '포션 만들기', '가마솥 문구: ' + s.ui.prompt.label);
  press(s, 'interact');
  assert(s.ui.brew && s.events.moonPotion.status === 'BREWING', '제작 시작 안 됨');
  return `모모 이동 (${before.x},${before.y}) → (${after.x},${after.y})`;
});

function readyState() {
  const s = PK.createInitialState();
  talkMomo(s);
  for (const id of ['moon1', 'moon2', 'moon3']) pickMoon(s, id);
  talkMomo(s);
  run(s, 90);
  return s;
}

check('CHECK 07/08', '제작 참여 (재료 넣기 → 저어주기 ×3 → 마법 넣기) + 단계마다 상태·화면 변화', () => {
  const s = readyState();
  inShop(s, CAULDRON_SPOT);
  press(s, 'interact');
  const ev = s.events.moonPotion;
  const trail = [];
  const snap = (label) => trail.push(`${label}:${PK.brew.liquid(s)}`);
  snap('시작');
  // 아무것도 안 누르면 진행되지 않음 (자동 진행 아님)
  run(s, 200);
  assert(ev.brewStep === 0 && !s.ui.brew.result, '입력 없이 진행됨');
  // 1. 재료 넣기 (버튼 클릭)
  act(s, { type: 'brewAct' });
  assert(ev.brewStep === 1 && count(s, 'moonFlower') === 0, '재료 넣기 실패');
  assert(s.ui.brew.anim.kind === 'add', '재료 연출 없음');
  run(s, 100); snap('재료');
  // 연출 중 연타는 무시
  act(s, { type: 'brewAct' }); act(s, { type: 'brewAct' });
  assert(ev.stirs <= 1, '연출 중 연타가 처리됨');
  // 2. 저어주기 3번 (E 키)
  let guard = 0;
  while (ev.brewStep === 1 && guard++ < 50) { press(s, 'interact'); run(s, 40); if (ev.stirs === 1 && !trail.some((x) => x.startsWith('저음1'))) snap('저음1'); }
  assert(ev.stirs === 3 && ev.brewStep === 2, `저어주기 stirs=${ev.stirs} step=${ev.brewStep}`);
  snap('저음3');
  // 3. 마법 넣기
  press(s, 'interact');
  assert(ev.brewStep === 3 && s.ui.brew.anim.kind === 'magic', '마법 넣기 실패');
  snap('마법');
  run(s, 30);
  assert(!s.ui.brew.result, '연출이 끝나기 전에 완성됨');
  run(s, 150);
  assert(s.ui.brew.result && ev.status === 'COMPLETED', '완성 화면 없음');
  snap('완성');
  const colors = trail.map((x) => x.split(':')[1]);
  assert(new Set(colors).size >= 4, '물약 색 변화 부족: ' + trail);
  return trail.join(' → ');
});

check('CHECK 09', '달빛 꽃 3개 차감 + 분홍색 달콤한 마법 포션 1개 지급', () => {
  const s = readyState();
  assert(count(s, 'moonFlower') === 3 && count(s, 'sweetPotion') === 0, '시작 조건');
  brewAll(s);
  assert(count(s, 'moonFlower') === 0, '꽃이 남음: ' + count(s, 'moonFlower'));
  assert(count(s, 'sweetPotion') === 1, '포션 수: ' + count(s, 'sweetPotion'));
  assert(PK.data.items.sweetPotion.name === '분홍색 달콤한 마법 포션', '이름');
  const ev = s.events.moonPotion;
  assert(ev.potionGiven && ev.questDone && ev.status === 'COMPLETED', JSON.stringify(ev));
  // 완성 화면 → 모모 대사
  press(s, 'interact');
  assert(!s.ui.brew && s.ui.dialog, '완성 후 대사 없음');
  const texts = s.ui.dialog.lines.map((l) => l.text);
  assert(texts[0] === '우와아! 정말 예쁜 포션이 완성됐어!' && texts[1] === '네가 도와준 덕분이야. 이 포션은 네가 가져!', texts.join(' / '));
  talkThrough(s);
  return '꽃 3 → 0, 포션 0 → 1';
});

check('CHECK 10', '완료 후 모모 대사 · 진열대 · 가마솥 상태 변경', () => {
  const s = readyState();
  brewAll(s); press(s, 'interact'); talkThrough(s); run(s, 90);
  assert(s.npcs.momo.spot === 'desk', '모모가 작업 공간으로 돌아가지 않음');
  talkMomo(s);
  inShop(s); press(s, 'interact');
  assert(s.ui.dialog.lines[0].text === '안녕! 지난번에 만든 포션 정말 잘 만들어졌어! 고마워!', s.ui.dialog.lines[0].text);
  talkThrough(s);
  assert(PK.brew.liquid(s) === 'Done', '가마솥 상태: ' + PK.brew.liquid(s));
  // 진열대는 COMPLETED 상태일 때 완성 포션을 그린다 (drawShop.potionShelf 조건)
  const src = fs.readFileSync(path.join(ROOT, 'js/render/drawShop.js'), 'utf8');
  assert(/status === 'COMPLETED'[\s\S]*sweetPotionSmall/.test(src), '진열 조건 없음');
  inShop(s, CAULDRON_SPOT); press(s, 'interact');
  assert(!s.ui.brew && /깨끗/.test(s.ui.dialog.lines[0].text), '완료 후 가마솥 문구');
  talkThrough(s);
  return '대사 변경, 진열대 포션, 가마솥 Done';
});

check('CHECK 11', '이벤트 중복 실행 / 보상 중복 지급 없음', () => {
  const s = readyState();
  brewAll(s); press(s, 'interact'); talkThrough(s); run(s, 90);
  for (let k = 0; k < 3; k++) { talkMomo(s); inShop(s, CAULDRON_SPOT); press(s, 'interact'); talkThrough(s); }
  // 시스템 함수를 직접 다시 호출해도 변화 없음
  PK.actions.startMoonEvent(s); PK.actions.readyToBrew(s);
  s.ui.brew = { anim: null, result: false }; PK.brew.complete(s); PK.brew.act(s); s.ui.brew = null;
  const ev = s.events.moonPotion;
  assert(ev.status === 'COMPLETED', '상태가 되돌아감: ' + ev.status);
  assert(count(s, 'sweetPotion') === 1, '포션 중복 지급: ' + count(s, 'sweetPotion'));
  // 꽃밭의 달빛 꽃은 다시 나타나지 않음
  for (const id of ['moon1', 'moon2', 'moon3']) assert(s.world.collected[id], id + ' 재등장');
  return '대화 3회 + 함수 재호출 후에도 포션 1개';
});

check('CHECK 12', '기존 이동 / 충돌 / 인벤토리 (아래 기존 기능 테스트 참고)', () => 'L01~L08 결과로 확인');

check('SAVE', '새로고침 후에도 진행 상태 유지 (저장 → 불러오기)', () => {
  const s = PK.createInitialState();
  talkMomo(s); pickMoon(s, 'moon1'); pickMoon(s, 'moon2');
  PK.save.write(s);
  const s2 = PK.createInitialState();
  assert(PK.save.apply(s2, PK.save.read()), '불러오기 실패');
  assert(s2.events.moonPotion.status === 'COLLECTING' && s2.events.moonPotion.flowers === 2, JSON.stringify(s2.events.moonPotion));
  assert(count(s2, 'moonFlower') === 2 && s2.world.collected.moon2 && !s2.world.collected.moon3, '인벤토리/맵 상태');
  // 제작 도중(마법 단계) 저장 → 불러와서 이어서 완성, 포션 1개
  const b = readyState();
  inShop(b, CAULDRON_SPOT); press(b, 'interact');
  act(b, { type: 'brewAct' }); run(b, 100);
  for (let k = 0; k < 3; k++) { press(b, 'interact'); run(b, 40); }
  press(b, 'interact');                       // 마법 넣기 (연출 도중)
  PK.save.write(b);
  const b2 = PK.createInitialState();
  PK.save.apply(b2, PK.save.read());
  assert(b2.events.moonPotion.status === 'BREWING' && b2.events.moonPotion.brewStep === 3, '제작 단계 저장');
  brewAll(b2);
  assert(b2.events.moonPotion.status === 'COMPLETED' && count(b2, 'sweetPotion') === 1, '이어서 완성 실패');
  PK.save.clear();
  return 'COLLECTING 2/3 복원, 제작 중단 후 이어서 완성';
});

// =====================================================================
section('동물 주민 쓰다듬기');

// 주민 옆에 서서 프롬프트 확인
function nearNpc(s, id) {
  const shop = id === 'momo';
  const world = PK.data.worlds[shop ? 'shop' : 'village'];
  const n = world.npcs.find((x) => x.id === id);
  const pos = PK.game.npcPos(s, n);
  s.scene = shop ? 'shop' : 'village';
  place(s, pos.x + 8, pos.y - 3);
  run(s, 1);
  if (!(s.ui.prompt && s.ui.prompt.kind === 'npc' && s.ui.prompt.id === id)) throw new Error(id + ' 프롬프트 없음 ' + JSON.stringify(s.ui.prompt));
}
const ALL = ['momo', 'berry', 'flora', 'lumi', 'cherry'];

check('PET 01', '5명의 동물 주민 모두 쓰다듬기 가능 (P키)', () => {
  const s = PK.createInitialState();
  for (const id of ALL) {
    nearNpc(s, id);
    assert(s.ui.prompt.pet === true, id + ' 쓰다듬기 안내 없음');
    press(s, 'pet');
    assert(s.ui.pets[id] && s.npcs[id].pets === 1, id + ' 쓰다듬기 실패');
    assert(!s.ui.dialog, id + ' 쓰다듬었는데 대화창이 열림');
  }
  // 터치 ♥ 버튼(액션)도 동작
  run(s, 120);
  nearNpc(s, 'cherry');
  act(s, { type: 'pet' });
  assert(s.npcs.cherry.pets === 2, '터치 쓰다듬기 실패');
  return ALL.map((id) => `${PK.data.speakers[id].name} ✓`).join(' ');
});

check('PET 02', '주민마다 반응이 다름 (대사 · 반응 프레임 · 모션)', () => {
  const s = PK.createInitialState();
  const lines = {};
  for (const id of ALL) { nearNpc(s, id); press(s, 'pet'); lines[id] = s.ui.pets[id].line; }
  const want = { momo: '꺄! 간지러워!', berry: '냐아~ 기분 좋아!', flora: '헤헤, 고마워!', lumi: '흐음... 나쁘지 않네.', cherry: '한 번 더! 한 번 더!' };
  for (const id of ALL) assert(lines[id] === want[id], `${id}: ${lines[id]}`);
  assert(new Set(Object.values(lines)).size === 5, '대사 중복');
  // 반응 프레임(pet0/pet1)이 시트에 있고, 주민별로 그림이 다름 (PNG 픽셀 비교)
  const ch = PK.atlas.characters.npcs;
  assert(ch.frames.includes('pet0') && ch.frames.includes('pet1'), '반응 프레임 없음');
  const npcs = require('../tools/art/npcs.js');
  for (const id of ALL) {
    const idle = npcs[id]('idle0').d.join(), p0 = npcs[id]('pet0').d.join(), p1 = npcs[id]('pet1').d.join();
    assert(idle !== p0 && p0 !== p1, id + ' 반응 프레임이 평소와 같음');
  }
  return Object.entries(lines).map(([k, v]) => `${k} "${v}"`).join(', ');
});

check('PET 03', '하트·별 효과가 잠깐 나타났다 사라짐', () => {
  const s = PK.createInitialState();
  nearNpc(s, 'flora'); press(s, 'pet');
  assert(s.ui.pets.flora, '효과 시작 안 됨');
  run(s, 30);
  assert(s.ui.pets.flora && s.ui.pets.flora.t > 0.4, '진행 중');
  run(s, 90);
  assert(!s.ui.pets.flora, PK.pet.DURATION + '초 뒤에도 남아 있음');
  const src = fs.readFileSync(path.join(ROOT, 'js/render/drawUI.js'), 'utf8');
  assert(/function petFx[\s\S]*heartFx[\s\S]*globalAlpha[\s\S]*sparkle/.test(src), '하트/페이드/별 그리기 없음');
  return `지속 ${PK.pet.DURATION}초, 하트 5개 + 별 2개, 끝에서 서서히 사라짐`;
});

check('PET 04', 'E 대화와 충돌 없음', () => {
  const s = PK.createInitialState();
  nearNpc(s, 'berry');
  press(s, 'interact');
  assert(s.ui.dialog && !s.ui.pets.berry, 'E 가 쓰다듬기를 실행함');
  // 대화 중 P 는 무시
  press(s, 'pet');
  assert(!s.ui.pets.berry, '대화 중 쓰다듬어짐');
  talkThrough(s);
  // 쓰다듬는 중에 E 로 대화 가능
  press(s, 'pet');
  assert(s.ui.pets.berry, '쓰다듬기 실패');
  press(s, 'interact');
  assert(s.ui.dialog, '쓰다듬기 중 대화 불가');
  talkThrough(s);
  // 퀘스트 진행 대화(모모)도 그대로
  const m = PK.createInitialState();
  nearNpc(m, 'momo'); press(m, 'pet'); run(m, 100);
  assert(m.events.moonPotion.status === 'NOT_STARTED', '쓰다듬기로 퀘스트가 시작됨');
  nearNpc(m, 'momo'); press(m, 'interact'); talkThrough(m);
  assert(m.events.moonPotion.status === 'COLLECTING', '대화로 퀘스트 시작 안 됨');
  return 'E=대화, P=쓰다듬기 독립';
});

check('PET 05', '연속 입력해도 반응이 겹치지 않음 / 끝나면 다시 가능', () => {
  const s = PK.createInitialState();
  nearNpc(s, 'cherry');
  press(s, 'pet');
  const first = s.ui.pets.cherry;
  for (let k = 0; k < 20; k++) { press(s, 'pet'); run(s, 1); }
  assert(s.npcs.cherry.pets === 1 && s.ui.pets.cherry === first, '연타가 중복 처리됨: ' + s.npcs.cherry.pets);
  assert(first.t > 0.3, '연타로 애니메이션이 처음부터 다시 시작됨');
  run(s, 90);
  assert(!s.ui.pets.cherry, '반응이 끝나지 않음');
  press(s, 'pet');
  assert(s.npcs.cherry.pets === 2 && s.ui.pets.cherry.line === '꺄르르! 꼬리가 춤춰!', '다시 쓰다듬기 실패');
  return '연타 20회 → 1회 처리, 종료 후 두 번째 반응 대사';
});

check('PET 06', '쓰다듬은 횟수 저장', () => {
  const s = PK.createInitialState();
  nearNpc(s, 'lumi'); press(s, 'pet');
  PK.save.write(s);
  const s2 = PK.createInitialState(); PK.save.apply(s2, PK.save.read());
  assert(s2.npcs.lumi.pets === 1 && Object.keys(s2.ui.pets).length === 0, '저장/복원');
  PK.save.clear();
  return '횟수만 저장, 반응 애니메이션은 저장 안 함';
});

// =====================================================================
section('기존 기능');

check('L01', 'WASD와 방향키 이동', () => {
  const s = PK.createInitialState();
  place(s, 240, 210);
  const keys = PK.config.KEYS;
  for (const [d, k, a] of [['up', 'KeyW', 'ArrowUp'], ['down', 'KeyS', 'ArrowDown'], ['left', 'KeyA', 'ArrowLeft'], ['right', 'KeyD', 'ArrowRight']]) {
    assert(keys[d].includes(k) && keys[d].includes(a), d + ' 매핑');
  }
  const moves = {};
  for (const dir of ['right', 'left', 'down', 'up']) {
    const before = { x: s.player.x, y: s.player.y };
    run(s, 20, { [dir]: true });
    moves[dir] = { dx: Math.round(s.player.x - before.x), dy: Math.round(s.player.y - before.y) };
  }
  assert(moves.right.dx > 0 && moves.left.dx < 0 && moves.down.dy > 0 && moves.up.dy < 0, JSON.stringify(moves));
  const s3 = PK.createInitialState(); place(s3, 30, 190);
  run(s3, 120, { left: true });
  assert(s3.player.x >= PK.data.worlds.village.bounds.x, '맵 밖으로 나감');
  return JSON.stringify(moves);
});

check('L02', '집, 가게, 나무, 연못, 분수, 울타리, NPC 충돌', () => {
  const W = PK.data.worlds.village;
  const tests = [
    ['마녀의 집', W.objects.find((o) => o.id === 'witchHouse').collider, 'up', 74, 122],
    ['포션 가게', W.objects.find((o) => o.id === 'potionShop').collider, 'up', 400, 128],
    ['나무', W.objects.find((o) => o.sprite === 'tree' && o.x === 446).collider, 'up', 458, 176],
    ['연못', W.objects.find((o) => o.id === 'pond').colliders[0], 'down', 76, 236],
    ['분수', W.objects.find((o) => o.id === 'fountain').collider, 'down', 234, 150],
    ['울타리', W.objects.find((o) => o.sprite === 'fenceV' && o.x === 328 && o.y === 294).collider, 'right', 300, 298],
  ];
  for (const [name, solid, dir, x, y] of tests) {
    const s = PK.createInitialState();
    place(s, x, y);
    run(s, 180, { [dir]: true });
    assert(!overlap(s.player, solid), name + ' 통과');
  }
  // 가게 안: 가마솥 / 선반 / 모모
  const S = PK.data.worlds.shop;
  const s = PK.createInitialState();
  inShop(s, { x: 154, y: 180 }); run(s, 180, { up: true });
  assert(!overlap(s.player, S.objects.find((o) => o.id === 'cauldron').collider), '가마솥 통과');
  inShop(s, { x: 26, y: 120 }); run(s, 180, { up: true });
  assert(!overlap(s.player, S.objects.find((o) => o.id === 'potionShelf').collider), '진열 선반 통과');
  inShop(s, { x: 160, y: 98 }); run(s, 120, { left: true });
  assert(!overlap(s.player, PK.game.npcCollider(PK.game.npcPos(s, S.npcs[0]))), '모모 통과');
  return `마을 ${tests.length}개 + 가게 3개`;
});

check('L03', '방향별 스프라이트 / 걷기 애니메이션', () => {
  const ch = PK.atlas.characters.witch;
  const s = PK.createInitialState(); place(s, 240, 210);
  for (const dir of ['up', 'down', 'left', 'right']) {
    run(s, 6, { [dir]: true });
    assert(s.player.dir === dir && s.player.moving && ch.rows[dir] !== undefined, dir);
  }
  run(s, 1);
  assert(!s.player.moving, '대기');
  return '4방향 × 5프레임';
});

check('L04', '베리 대화 + 쿠키 1회 지급', () => {
  const b = PK.createInitialState();
  place(b, 194, 126); run(b, 1);
  assert(b.ui.prompt && b.ui.prompt.id === 'berry', '베리 프롬프트');
  press(b, 'interact'); talkThrough(b);
  press(b, 'interact'); talkThrough(b);
  assert(count(b, 'cookie') === 1, '쿠키 ' + count(b, 'cookie'));
  return '쿠키 1개';
});

check('L05', '기존 퀘스트: 모모의 잃어버린 마법 꽃 (가게 안에서 전달)', () => {
  const s = PK.createInitialState();
  Object.assign(s.events.moonPotion, { status: 'COMPLETED', potionGiven: true, questDone: true });
  talkMomo(s, 0);
  assert(s.quest.lostFlower.stage === 'asked', 'stage=' + s.quest.lostFlower.stage);
  const field = PK.data.worlds.village.pickups.find((p) => p.item === 'magicFlower');
  s.scene = 'village'; place(s, field.x + 1, field.y + 12); run(s, 1);
  press(s, 'interact');
  assert(s.quest.lostFlower.stage === 'found', 'found');
  talkMomo(s, 0);
  assert(s.quest.lostFlower.stage === 'done' && count(s, 'potion') === 1, '전달');
  assert(s.ui.banner && !s.ui.banner.pending, '완료 배너');
  press(s, 'interact');
  return 'none → asked → found → done';
});

check('L06', '인벤토리 (가방 클릭 / I / Esc)', () => {
  const s = PK.createInitialState();
  const star = PK.data.worlds.village.pickups.find((p) => p.item === 'star');
  place(s, star.x - 2, star.y + 6); run(s, 1);
  press(s, 'interact');
  act(s, { type: 'toggleInventory' });
  assert(s.ui.inventoryOpen && s.inventory.items[0].id === 'star', '가방');
  const x0 = s.player.x; run(s, 5, { right: true });
  assert(s.player.x === x0, '가방 열린 채 이동');
  press(s, 'inventory');
  assert(!s.ui.inventoryOpen, 'I 닫기');
  press(s, 'inventory'); press(s, 'cancel');
  assert(!s.ui.inventoryOpen, 'Esc 닫기');
  for (const id of Object.keys(PK.data.items)) assert(PK.atlas.sprites[PK.data.items[id].icon], id + ' 아이콘');
  return '아이템 ' + Object.keys(PK.data.items).length + '종 아이콘';
});

check('L07', '마녀의 집 출입', () => {
  const s = PK.createInitialState();
  place(s, 58, 124); run(s, 40, { up: true }); run(s, 40);
  assert(s.scene === 'house', '입장');
  run(s, 120, { down: true }); run(s, 40);
  assert(s.scene === 'village', '퇴장');
  return '입장/퇴장';
});

check('L08', '가구 선택 · 배치 · 이동 · 삭제', () => {
  const s = PK.createInitialState();
  s.scene = 'house'; place(s, 280, 200);
  press(s, 'decorate');
  const n0 = s.house.furniture.length;
  act(s, { type: 'decoPick', furniture: 'desk' });
  act(s, { type: 'decoPointer', x: 60, y: 90, click: true });
  act(s, { type: 'decoPick', furniture: 'plant' });
  act(s, { type: 'decoPointer', x: 120, y: 100, click: true });
  assert(s.house.furniture.length === n0 + 2, '배치');
  const bed = s.house.furniture.find((f) => f.type === 'bed');
  act(s, { type: 'decoPick', furniture: 'bookshelf' });
  act(s, { type: 'decoPointer', x: bed.x + 16, y: bed.y + 30, click: true });
  assert(s.house.furniture.length === n0 + 2, '겹침 배치됨');
  act(s, { type: 'decoCancel' });
  const desk = s.house.furniture.find((f) => f.type === 'desk');
  act(s, { type: 'decoPointer', x: desk.x + 10, y: desk.y + 20, click: true });
  act(s, { type: 'decoMove' });
  const from = desk.x + ',' + desk.y;
  act(s, { type: 'decoPointer', x: 90, y: 180, click: true });
  assert(desk.x + ',' + desk.y !== from, '이동');
  act(s, { type: 'decoPointer', x: desk.x + 10, y: desk.y + 20, click: true });
  act(s, { type: 'decoDelete' });
  assert(!s.house.furniture.includes(desk), '삭제');
  return '배치/겹침 차단/이동/삭제';
});

check('ASSETS', '스프라이트 시트 PNG(RGBA) + 참조 스프라이트 존재', () => {
  for (const rel of Object.values(PK.atlas.sheets)) {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    assert(buf.readUInt32BE(0) === 0x89504e47 && buf[25] === 6, rel);
  }
  const names = new Set();
  for (const w of Object.values(PK.data.worlds)) {
    for (const o of [...w.objects, ...w.decor, ...w.pickups]) [].concat(o.sprite).forEach((n) => names.add(n));
  }
  for (const f of Object.values(PK.data.furniture)) names.add(f.sprite);
  for (const k of ['Lav', 'Moon', 'Pink', 'Glow', 'Done']) { names.add(`liquid${k}0`); names.add(`liquid${k}1`); }
  ['ladle', 'heartFx', 'sweetPotionSmall', 'iconSweetPotion', 'iconMoonFlower'].forEach((n) => names.add(n));
  for (const n of names) assert(PK.atlas.sprites[n], '아틀라스에 없음: ' + n);
  return names.size + '개 스프라이트';
});

console.log('\nPINKLE 자동 테스트');
console.log(results.join('\n'));
console.log(`\n통과 ${pass} / 실패 ${fail}\n`);
process.exit(fail ? 1 : 0);
