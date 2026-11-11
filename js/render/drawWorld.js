(function () {
  const P = PK.palette;
  const T = 16;
  const cache = {};   // 장면별로 바닥을 한 번만 그려둔다

  const hash = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

  function isPath(world, tx, ty) {
    const x = tx * T + 1, y = ty * T + 1;
    return world.paths.some((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
  }

  function bakeVillage(world) {
    const cv = document.createElement('canvas');
    cv.width = world.width; cv.height = world.height;
    const ctx = cv.getContext('2d');
    const cols = world.width / T, rows = world.height / T;
    for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
      const h = hash(tx, ty) % 20;
      if (isPath(world, tx, ty)) {
        PK.sprites.draw(ctx, h < 10 ? 'path0' : 'path1', tx * T, ty * T);
      } else {
        PK.sprites.draw(ctx, h < 9 ? 'grass0' : h < 16 ? 'grass1' : h < 18 ? 'grass2' : 'grass3', tx * T, ty * T);
      }
    }
    // 길 가장자리: 베이지 테두리 + 둥근 모서리
    for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
      if (!isPath(world, tx, ty)) continue;
      const x = tx * T, y = ty * T;
      const up = isPath(world, tx, ty - 1), dn = isPath(world, tx, ty + 1);
      const lf = isPath(world, tx - 1, ty), rt = isPath(world, tx + 1, ty);
      ctx.fillStyle = P.beige;
      if (!up) ctx.fillRect(x, y, T, 1);
      if (!dn) ctx.fillRect(x, y + T - 2, T, 2);
      if (!lf) ctx.fillRect(x, y, 1, T);
      if (!rt) ctx.fillRect(x + T - 1, y, 1, T);
      ctx.fillStyle = P.mint;
      if (!up && !lf) { ctx.fillRect(x, y, 2, 1); ctx.fillRect(x, y, 1, 2); }
      if (!up && !rt) { ctx.fillRect(x + T - 2, y, 2, 1); ctx.fillRect(x + T - 1, y, 1, 2); }
      if (!dn && !lf) { ctx.fillRect(x, y + T - 1, 2, 1); ctx.fillRect(x, y + T - 2, 1, 2); }
      if (!dn && !rt) { ctx.fillRect(x + T - 2, y + T - 1, 2, 1); ctx.fillRect(x + T - 1, y + T - 2, 1, 2); }
    }
    return cv;
  }

  function bakeRoom(world) {
    const cv = document.createElement('canvas');
    cv.width = world.width; cv.height = world.height;
    const ctx = cv.getContext('2d');
    const wallH = world.wallHeight;
    const tiles = world.tiles;
    for (let y = 0; y < wallH - 8; y += T) for (let x = 0; x < world.width; x += T) PK.sprites.draw(ctx, tiles.wall, x, y);
    for (let x = 0; x < world.width; x += T) {
      PK.sprites.draw(ctx, tiles.wainscot, x, wallH - 8);
      if (tiles.lace) PK.sprites.draw(ctx, tiles.lace, x, 0);
    }
    for (let y = wallH; y < world.height; y += T) for (let x = 0; x < world.width; x += T) PK.sprites.draw(ctx, tiles.floor, x, y);
    // 벽 아래 그림자 한 줄 + 양옆 벽 테두리
    ctx.fillStyle = P.pinkMid;
    ctx.fillRect(0, wallH, world.width, 1);
    ctx.fillStyle = P.pinkDeep;
    ctx.fillRect(0, 0, 3, world.height);
    ctx.fillRect(world.width - 3, 0, 3, world.height);
    ctx.fillStyle = P.outline;
    ctx.fillRect(0, 0, 1, world.height);
    ctx.fillRect(world.width - 1, 0, 1, world.height);
    return cv;
  }

  function ground(ctx, world, sceneName) {
    if (!cache[sceneName]) cache[sceneName] = world.ground === 'room' ? bakeRoom(world) : bakeVillage(world);    ctx.drawImage(cache[sceneName], 0, 0);
    for (const d of world.decor) PK.sprites.draw(ctx, d.sprite, d.x, d.y);
  }

  function object(ctx, o, t, state) {
    // 상태에 따라 모습이 바뀌는 오브젝트 (가마솥, 포션 진열대)
    if (o.special && state) { PK.drawShop[o.special](ctx, o, state, t); return; }
    let y = o.y;
    if (o.swing) y += Math.round(Math.sin(t * 2 + o.swing) * 1);
    PK.sprites.draw(ctx, PK.sprites.pick(o.sprite, t, o.fps), o.x, y, o.flip);
  }

  function furniture(ctx, f) {
    PK.sprites.draw(ctx, PK.data.furniture[f.type].sprite, f.x, f.y);
  }

  function pickup(ctx, it, t, active) {
    const bob = Math.round(Math.sin(t * 3) * 1);
    PK.sprites.draw(ctx, PK.sprites.pick(it.sprite, t, 2), it.x, it.y + (active ? bob : 0));
    if (active) {
      // 반짝이 (주변을 돌며 깜빡임)
      const { w } = PK.sprites.size(Array.isArray(it.sprite) ? it.sprite[0] : it.sprite);
      const k = Math.floor(t * 4);
      const spots = [[-6, -2], [w - 1, 2], [2, -8], [w - 4, -7]];
      const [sx, sy] = spots[k % spots.length];
      PK.sprites.draw(ctx, k % 2 ? 'sparkle0' : 'sparkle1', it.x + sx, it.y + sy);
    }
  }

  PK.drawWorld = { ground, object, furniture, pickup };
})();
