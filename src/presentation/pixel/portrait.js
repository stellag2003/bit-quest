import { PORTRAITS, PORTRAIT_SIZE } from './portraits.js';

/**
 * Full-color 32×32 character art. Always scaled by a whole number with
 * smoothing off, so every art pixel stays a crisp square.
 */
const images = new Map();

function image(id) {
  if (!images.has(id)) {
    const img = new Image();
    img.src = PORTRAITS[id];
    images.set(id, img.decode().then(() => img));
  }
  return images.get(id);
}

export const hasPortrait = (id) => Boolean(PORTRAITS[id]);

/** Canvas of `PORTRAIT_SIZE × scale` px. `silhouette` paints every opaque pixel in that color (locked mentors). */
export function portraitCanvas(id, { scale = 2, silhouette = null } = {}) {
  const size = PORTRAIT_SIZE * Math.max(1, Math.round(scale));
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  canvas.className = 'sprite pixelart';
  image(id).then((img) => {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, size, size);
    if (silhouette) {
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = silhouette;
      ctx.fillRect(0, 0, size, size);
    }
  }).catch(() => {});
  return canvas;
}

/** Opaque pixels as [x, y, 'rgba(...)'] at art scale — used by the mentor reveal animation. */
export async function portraitPixels(id) {
  const img = await image(id);
  const canvas = document.createElement('canvas');
  canvas.width = PORTRAIT_SIZE;
  canvas.height = PORTRAIT_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const { data } = ctx.getImageData(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);
  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const p = i / 4;
    pixels.push([p % PORTRAIT_SIZE, Math.floor(p / PORTRAIT_SIZE), `rgba(${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3] / 255})`]);
  }
  return pixels;
}
