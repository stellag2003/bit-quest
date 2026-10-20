import { drawSprite } from './draw.js';
import { TREE } from './sprites.js';

/** Each fase has its own walls (trees, bricks, blocks) on the same square floor. 16px tiles. */
const T = 16;

function px(ctx, color, x, y, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/** Every scenery shares the same floor: plain squares with a thin edge, easy to count. */
function squareFloor(ctx, x, y, c) {
  px(ctx, c[3], x * T, y * T, T, T);
  px(ctx, c[2], x * T, y * T + T - 1, T, 1);
  px(ctx, c[2], x * T + T - 1, y * T, 1, T);
}

const meadow = {
  obstacle: 'tree',
  floor: squareFloor,
  wall(ctx, x, y, c) {
    drawSprite(ctx, TREE, x * T, y * T, c);
  },
};

const canyon = {
  obstacle: 'wall',
  floor: squareFloor,
  wall(ctx, x, y, c) {
    const ox = x * T;
    const oy = y * T;
    px(ctx, c[1], ox, oy, T, T);
    for (let row = 0; row < 4; row += 1) {
      const by = oy + row * 4;
      px(ctx, c[0], ox, by + 3, T, 1);
      px(ctx, c[2], ox, by, T, 1);
      const offset = row % 2 ? 4 : 0;
      for (let bx = offset; bx < T; bx += 8) px(ctx, c[0], ox + bx, by, 1, 3);
    }
  },
};

const lab = {
  obstacle: 'wall',
  floor: squareFloor,
  wall(ctx, x, y, c) {
    const ox = x * T + 1;
    const oy = y * T + 1;
    px(ctx, c[0], ox, oy, 14, 14);
    px(ctx, c[2], ox + 1, oy + 1, 12, 12);
    px(ctx, c[1], ox + 2, oy + 2, 10, 10);
    for (let i = 0; i < 10; i += 1) px(ctx, c[2], ox + 2 + i, oy + 2 + i);
    px(ctx, c[3], ox + 1, oy + 1, 12, 1);
  },
};

export const SCENERIES = { meadow, canyon, lab };
