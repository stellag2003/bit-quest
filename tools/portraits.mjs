// Turns the character art in assets/personagens (32×32 PNG, transparent) into
// src/presentation/pixel/portraits.js as data URIs, so the game keeps working
// from file:// and as a single-file bundle. Run after changing the art:
//   npm run portraits
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve('.');
const SOURCES = {
  hero: 'mulher_cacheada.png', // Mary, the main character
  ada: 'ada_lovelace.png', // drawn by tools/draw-portraits.mjs
  grace: 'grace_hopper.png',
  turing: 'alan_turing.png',
  katherine: 'katherine_johnson.png',
  // drawn by tools/draw-portraits.mjs, same palette:
  sonja: 'sonja_ashauer.png',
  liane: 'liane_tarouco.png',
  jobs: 'steve_jobs.png',
};

const entries = Object.entries(SOURCES).map(([id, file]) => {
  const png = readFileSync(join(ROOT, 'assets/personagens', file));
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  if (width !== 32 || height !== 32) throw new Error(`${file}: esperado 32×32, veio ${width}×${height}`);
  return `  ${id}: 'data:image/png;base64,${png.toString('base64')}',`;
});

writeFileSync(join(ROOT, 'src/presentation/pixel/portraits.js'), `/**
 * Character portraits (32×32 pixel art, transparent PNG) generated from
 * assets/personagens by tools/portraits.mjs — do not edit by hand.
 */
export const PORTRAIT_SIZE = 32;

export const PORTRAITS = {
${entries.join('\n')}
};
`);
console.log(`src/presentation/pixel/portraits.js gerado (${entries.length} retratos)`);
