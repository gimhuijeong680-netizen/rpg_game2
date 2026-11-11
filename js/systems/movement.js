PK.systems = PK.systems || {};

PK.systems.movement = function (state, input, dt, world) {
  const p = state.player;
  if (PK.game.busy(state)) {
    p.moving = false;
    return;
  }

  let dx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let dy = (input.down ? 1 : 0) - (input.up ? 1 : 0);

  p.moving = dx !== 0 || dy !== 0;
  if (!p.moving) return;

  // 좌우 우선 (대각선 이동 중엔 옆모습)
  if (dx !== 0) p.dir = dx > 0 ? 'right' : 'left';
  else p.dir = dy > 0 ? 'down' : 'up';

  // 대각선 속도 = 직선 속도
  if (dx !== 0 && dy !== 0) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }

  const speed = PK.config.PLAYER_SPEED * dt;
  const solids = PK.game.solids(state, world);
  const next = PK.collision.moveWithCollision(p, dx * speed, dy * speed, solids, world.bounds);
  p.x = next.x;
  p.y = next.y;
  p.walkTime += dt;
};
