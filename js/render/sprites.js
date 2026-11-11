// 스프라이트 시트에서 잘라 그리기 (항상 정수 좌표 → 픽셀이 흐려지지 않음)
PK.sprites = {
  size(name) {
    const r = PK.atlas.sprites[name];
    return { w: r[2], h: r[3] };
  },

  // 애니메이션이면 배열 중 시간에 맞는 프레임 이름
  pick(sprite, t, fps = 3) {
    return Array.isArray(sprite) ? sprite[Math.floor(t * fps) % sprite.length] : sprite;
  },

  draw(ctx, name, x, y, flip = false) {
    const r = PK.atlas.sprites[name];
    if (!r) return;
    const img = PK.assets.images.world;
    x = Math.round(x); y = Math.round(y);
    if (flip) {
      ctx.save();
      ctx.translate(x + r[2], y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, r[0], r[1], r[2], r[3], 0, 0, r[2], r[3]);
      ctx.restore();
    } else {
      ctx.drawImage(img, r[0], r[1], r[2], r[3], x, y, r[2], r[3]);
    }
  },

  // 캐릭터 시트 한 칸
  frame(ctx, key, row, col, x, y) {
    const c = PK.atlas.characters[key];
    ctx.drawImage(PK.assets.images[c.sheet], col * c.w, row * c.h, c.w, c.h, Math.round(x), Math.round(y), c.w, c.h);
  },

  // DOM UI 용: 스프라이트를 정수배로 확대한 캔버스
  canvas(name, scale = 2, char) {
    const cv = document.createElement('canvas');
    const ctx = cv.getContext('2d');
    if (char) {
      const c = PK.atlas.characters[char.key];
      cv.width = (char.w || c.w) * scale;
      cv.height = (char.h || c.h) * scale;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(PK.assets.images[c.sheet], char.col * c.w + (char.x || 0), char.row * c.h + (char.y || 0),
        char.w || c.w, char.h || c.h, 0, 0, cv.width, cv.height);
    } else {
      const r = PK.atlas.sprites[name];
      cv.width = r[2] * scale;
      cv.height = r[3] * scale;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(PK.assets.images.world, r[0], r[1], r[2], r[3], 0, 0, cv.width, cv.height);
    }
    cv.className = 'px';
    return cv;
  },
};
