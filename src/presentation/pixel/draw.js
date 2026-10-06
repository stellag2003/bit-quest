/** Draws a sprite (rows of palette indices) onto a 2D context at art-pixel scale 1. */
export function drawSprite(ctx, rows, ox, oy, colors, { flip = false, tone = null } = {}) {
  const width = rows[0].length;
  rows.forEach((row, y) => {
    for (let x = 0; x < width; x += 1) {
      const ch = row[x];
      if (ch === '.') continue;
      ctx.fillStyle = tone ?? colors[Number(ch)];
      ctx.fillRect(ox + (flip ? width - 1 - x : x), oy + y, 1, 1);
    }
  });
}

/** Opaque pixels as [x, y, colorIndex] — used by the mentor reveal animation. */
export function spritePixels(rows) {
  const pixels = [];
  rows.forEach((row, y) => [...row].forEach((ch, x) => ch !== '.' && pixels.push([x, y, Number(ch)])));
  return pixels;
}

export function spriteCanvas(rows, colors, scale = 4, options = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = rows[0].length * scale;
  canvas.height = rows.length * scale;
  canvas.className = 'sprite';
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  drawSprite(ctx, rows, 0, 0, colors, options);
  return canvas;
}
