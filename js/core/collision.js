PK.collision = {
  // 맞닿기만 한 경우는 겹침이 아님
  rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  },

  // X축, Y축을 따로 처리해 벽을 따라 미끄러지게 한다
  moveWithCollision(rect, dx, dy, solids, bounds) {
    const overlap = PK.collision.rectsOverlap;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    let x = clamp(rect.x + dx, bounds.x, bounds.x + bounds.w - rect.w);
    for (const s of solids) {
      if (!overlap({ x, y: rect.y, w: rect.w, h: rect.h }, s)) continue;
      if (dx > 0) x = s.x - rect.w;
      else if (dx < 0) x = s.x + s.w;
    }

    let y = clamp(rect.y + dy, bounds.y, bounds.y + bounds.h - rect.h);
    for (const s of solids) {
      if (!overlap({ x, y, w: rect.w, h: rect.h }, s)) continue;
      if (dy > 0) y = s.y - rect.h;
      else if (dy < 0) y = s.y + s.h;
    }

    return { x, y };
  },
};
