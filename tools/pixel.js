// 아주 작은 픽셀 아트 도구 (의존성 없음)
// 모든 도형은 픽셀 중심 기준으로 판정 → 안티앨리어싱 없이 또렷한 도트
const zlib = require('zlib');
const palette = require('../js/core/palette.js');

const HEX = {};
for (const [ch, name] of Object.entries(palette.chars)) HEX[ch] = palette[name];

class Px {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = new Array(w * h).fill(null);   // 각 칸 = 팔레트 문자 또는 null
  }

  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  get(x, y) { return this.in(x, y) ? this.d[y * this.w + x] : null; }
  set(x, y, c) {
    x = Math.round(x); y = Math.round(y);
    if (!this.in(x, y)) return this;
    if (c && !HEX[c]) throw new Error('팔레트에 없는 색: ' + c);
    this.d[y * this.w + x] = c;
    return this;
  }
  // 이미 칠해진 칸에만 칠한다 (음영/하이라이트용)
  paint(x, y, c) { if (this.get(x, y)) this.set(x, y, c); return this; }

  pts(list, c) { for (const [x, y] of list) this.set(x, y, c); return this; }
  rect(x, y, w, h, c) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
    return this;
  }
  hline(x0, x1, y, c) { for (let x = x0; x <= x1; x++) this.set(x, y, c); return this; }
  vline(x, y0, y1, c) { for (let y = y0; y <= y1; y++) this.set(x, y, c); return this; }

  // 픽셀 중심이 타원 안에 있으면 채움. (cx, cy)는 픽셀 경계 좌표
  ellipse(cx, cy, rx, ry, c, onlyPainted) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) onlyPainted ? this.paint(x, y, c) : this.set(x, y, c);
      }
    }
    return this;
  }

  // 다각형 (픽셀 중심 판정, even-odd)
  poly(points, c, onlyPainted) {
    const ys = points.map((p) => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const py = y + 0.5;
      const xs = [];
      for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i], [x2, y2] = points[(i + 1) % points.length];
        if ((y1 <= py && y2 > py) || (y2 <= py && y1 > py)) {
          xs.push(x1 + ((py - y1) / (y2 - y1)) * (x2 - x1));
        }
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.ceil(xs[k] - 0.5); x + 0.5 < xs[k + 1]; x++) {
          onlyPainted ? this.paint(x, y, c) : this.set(x, y, c);
        }
      }
    }
    return this;
  }

  // 문자 픽셀맵 붙여넣기 ('.' 또는 ' ' = 투명)
  map(rows, ox = 0, oy = 0) {
    rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        if (ch !== '.' && ch !== ' ') this.set(ox + i, oy + j, ch);
      });
    });
    return this;
  }

  blit(src, ox = 0, oy = 0, flipX = false) {
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
      const c = src.get(flipX ? src.w - 1 - x : x, y);
      if (c) this.set(ox + x, oy + y, c);
    }
    return this;
  }

  // 실루엣 바깥쪽에 1px 외곽선 (4방향)
  outline(c = 'o') {
    const add = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y)) continue;
      if (this.get(x - 1, y) || this.get(x + 1, y) || this.get(x, y - 1) || this.get(x, y + 1)) add.push([x, y]);
    }
    for (const [x, y] of add) this.set(x, y, c);
    return this;
  }

  // 레이어 합성: 위 레이어의 외곽선이 아래 레이어 내부에 떨어지면
  // 진한 외곽선 대신 부드러운 내부선으로 바꾼다 (셀아웃 효과)
  layer(src, ox = 0, oy = 0, soft = 'O') {
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
      const c = src.get(x, y);
      if (!c) continue;
      const tx = ox + x, ty = oy + y;
      const under = this.get(tx, ty);
      this.set(tx, ty, c === 'o' && soft && under && under !== 'o' ? soft : c);
    }
    return this;
  }

  replace(from, to) {
    for (let i = 0; i < this.d.length; i++) if (this.d[i] === from) this.d[i] = to;
    return this;
  }

  // 자동 음영: 지정 색 중 아래/오른쪽이 외곽선에 닿은 칸을 어둡게
  shadeEdges(base, dark, dirs = [[0, 1]]) {
    const hits = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y) !== base) continue;
      for (const [dx, dy] of dirs) {
        const n = this.get(x + dx, y + dy);
        if (n === 'o' || n === 'O' || n === null) { hits.push([x, y]); break; }
      }
    }
    for (const [x, y] of hits) this.set(x, y, dark);
    return this;
  }

  clone() { const p = new Px(this.w, this.h); p.d = this.d.slice(); return p; }
  flipped() { const p = new Px(this.w, this.h); p.blit(this, 0, 0, true); return p; }
  shifted(dx, dy) { const p = new Px(this.w, this.h); p.blit(this, dx, dy); return p; }

  // 채워진 영역의 경계 상자
  bbox() {
    let x0 = this.w, y0 = this.h, x1 = -1, y1 = -1;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    }
    return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }

  toRGBA(scale = 1) {
    const W = this.w * scale, H = this.h * scale;
    const buf = Buffer.alloc(W * H * 4);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const c = this.d[Math.floor(y / scale) * this.w + Math.floor(x / scale)];
      if (!c) continue;
      const hex = HEX[c];
      const i = (y * W + x) * 4;
      buf[i] = parseInt(hex.slice(1, 3), 16);
      buf[i + 1] = parseInt(hex.slice(3, 5), 16);
      buf[i + 2] = parseInt(hex.slice(5, 7), 16);
      buf[i + 3] = 255;
    }
    return { W, H, buf };
  }

  toPNG(scale = 1, bg = null) {
    const { W, H, buf } = this.toRGBA(scale);
    if (bg) {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(bg.slice(i, i + 2), 16));
      for (let i = 0; i < buf.length; i += 4) if (buf[i + 3] === 0) { buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255; }
    }
    return encodePNG(W, H, buf);
  }
}

// ---- PNG 인코더 (RGBA 8bit) ----
const CRC = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(W, H, rgba) {
  const raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 4 + 1)] = 0;
    rgba.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

module.exports = { Px, HEX, encodePNG };
