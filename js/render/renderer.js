// 렌더러는 state를 읽기만 한다 (절대 수정하지 않음)
PK.render = function (ctx, state, world) {
  const t = state.time;
  const cam = state.camera;
  const view = state.view;
  ctx.imageSmoothingEnabled = false;
  // 맵 바깥(작은 방이 화면보다 작을 때) 배경
  ctx.fillStyle = world.ground === 'room' ? PK.palette.outline : PK.palette.mint;
  ctx.fillRect(0, 0, view.w, view.h);

  ctx.save();
  ctx.translate(-cam.x, -cam.y);

  PK.drawWorld.ground(ctx, world, state.scene);

  for (const o of world.objects) {
    if (o.layer === 'wall' || o.layer === 'ground') PK.drawWorld.object(ctx, o, t, state);
  }

  const deco = state.ui.deco;
  const hidden = deco && deco.moving ? deco.moving.uid : null;
  const furniture = state.scene === 'house' ? state.house.furniture.filter((f) => f.uid !== hidden) : [];
  for (const f of furniture) if (PK.data.furniture[f.type].floor) PK.drawWorld.furniture(ctx, f);

  // 발 위치(Y) 기준 정렬 → 나무/집 뒤로 걸어가면 가려짐
  const drawables = [];
  for (const o of world.objects) {
    if (o.layer) continue;
    const name = Array.isArray(o.sprite) ? o.sprite[0] : o.sprite;
    const baseY = o.collider ? o.collider.y + o.collider.h : o.y + PK.sprites.size(name).h;
    drawables.push({ y: baseY, draw: () => PK.drawWorld.object(ctx, o, t, state) });
  }
  for (const f of furniture) {
    if (PK.data.furniture[f.type].floor) continue;
    const r = PK.game.footRect(f);
    drawables.push({ y: r.y + r.h, draw: () => PK.drawWorld.furniture(ctx, f) });
  }
  for (const it of world.pickups) {
    if (state.world.collected[it.id]) continue;
    const active = !it.requires || PK.requirements[it.requires](state);
    const name = Array.isArray(it.sprite) ? it.sprite[0] : it.sprite;
    drawables.push({ y: it.y + PK.sprites.size(name).h - 4, draw: () => PK.drawWorld.pickup(ctx, it, t, active) });
  }
  for (const n of world.npcs) {
    const pos = PK.game.npcPos(state, n);
    const walking = n.spots && state.npcs[n.id].moveT < 1;
    const pet = state.ui.pets[n.id] || null;
    drawables.push({ y: pos.y, draw: () => PK.drawCharacters.npc(ctx, { id: n.id, x: pos.x, y: pos.y, walking, pet }, t) });
  }
  const p = state.player;
  drawables.push({ y: p.y + p.h, draw: () => PK.drawCharacters.witch(ctx, p, t) });
  drawables.sort((a, b) => a.y - b.y);
  for (const d of drawables) d.draw();

  if (state.scene === 'shop') PK.drawShop.brewFx(ctx, state, world, t);
  PK.drawUI.npcBubbles(ctx, state, world, t);
  PK.drawUI.petFx(ctx, state, world);
  PK.drawUI.prompt(ctx, state, t);
  PK.drawUI.deco(ctx, state, t);

  if (state.debug) {
    ctx.fillStyle = PK.palette.debug;
    for (const s of PK.game.solids(state, world)) ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = 'rgba(120, 90, 255, 0.35)';
    for (const door of world.doors) ctx.fillRect(door.trigger.x, door.trigger.y, door.trigger.w, door.trigger.h);
  }

  ctx.restore();
  PK.drawUI.fade(ctx, state);
};
