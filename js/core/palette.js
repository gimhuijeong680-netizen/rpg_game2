// 게임 전체 색상 토큰 (단일 출처)
// - 브라우저: PK.palette 로 노출 (런타임 픽셀 드로잉용)
// - Node: tools/build-assets.js 가 require 해서 PNG 에셋을 굽는다
// 픽셀 아트는 이 팔레트 안의 색만 사용한다 → 캐릭터/배경 그림체 통일
(function (root) {
  const colors = {
    outline:    '#7a4a6e', // o  진한 자주 외곽선
    lineSoft:   '#c9849f', // O  내부 경계선
    white:      '#fffbf8', // w
    cream:      '#fff3e2', // c
    creamShade: '#f3dcc4', // C
    beige:      '#e8cdb0', // k
    beigeDeep:  '#c9a184', // K
    pinkPale:   '#ffe3ee', // p
    pink:       '#ffc2d8', // P
    pinkMid:    '#fb9fc1', // q
    pinkDeep:   '#e77aa6', // Q
    rose:       '#f0607f', // r
    roseDeep:   '#c64468', // R
    lavPale:    '#f1e8ff', // l
    lav:        '#d6c3f7', // L
    violet:     '#ae90e6', // v
    violetDeep: '#8669c6', // V
    violetDark: '#634b9e', // u
    mintPale:   '#e9faf1', // m
    mint:       '#c6eed9', // M
    mintMid:    '#a3dfc2', // g
    mintDeep:   '#77c2a3', // G
    mintDark:   '#559e86', // h
    skin:       '#ffece2', // s
    skinShade:  '#f8cfc2', // S
    blush:      '#ff9fbd', // b
    eye:        '#4e3157', // e
    iris:       '#9b6fd8', // E
    yellow:     '#ffe696', // y
    gold:       '#f4bb5a', // Y
    skyPale:    '#e6f3ff', // a
    water:      '#b7dcf7', // A
    waterDeep:  '#8dc0ea', // B
    trunk:      '#e0b498', // t
    trunkDeep:  '#b8876f', // T
    bread:      '#f2bd7f', // n
    breadDeep:  '#cf8a55', // N
    stone:      '#e6dfe9', // x
    stoneDeep:  '#c2b6cc', // X
  };

  // 픽셀맵 문자 → 색상 토큰
  const chars = {
    o: 'outline', O: 'lineSoft', w: 'white', c: 'cream', C: 'creamShade',
    k: 'beige', K: 'beigeDeep', p: 'pinkPale', P: 'pink', q: 'pinkMid',
    Q: 'pinkDeep', r: 'rose', R: 'roseDeep', l: 'lavPale', L: 'lav',
    v: 'violet', V: 'violetDeep', u: 'violetDark', m: 'mintPale', M: 'mint',
    g: 'mintMid', G: 'mintDeep', h: 'mintDark', s: 'skin', S: 'skinShade',
    b: 'blush', e: 'eye', E: 'iris', y: 'yellow', Y: 'gold', a: 'skyPale',
    A: 'water', B: 'waterDeep', t: 'trunk', T: 'trunkDeep', n: 'bread',
    N: 'breadDeep', x: 'stone', X: 'stoneDeep',
  };

  const palette = Object.assign({}, colors, {
    chars,
    shadow: 'rgba(122, 74, 110, 0.18)',
    debug: 'rgba(255, 90, 140, 0.35)',
  });

  if (typeof module === 'object' && module.exports) module.exports = palette;
  else { root.PK = root.PK || {}; root.PK.palette = palette; }
})(this);
