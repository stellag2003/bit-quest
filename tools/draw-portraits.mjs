// Draws the mentor portraits that did not come with the art delivery (Ada,
// Sonja, Liane, Steve Jobs) as 32×32 PNGs in the same 19-color palette.
// Ada is drawn by hand (left half, mirrored); the others are variations of
// her base (hair, clothes, glasses) so all of them share one style.
// Usage: node tools/draw-portraits.mjs [scale] [outDir]
//   default: scale 1 into assets/personagens/ — then run `npm run portraits`.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const PAL = ['181425', '262b44', '3a4466', '5a6988', '8b9bb4', 'c0cbdc', 'ffffff', '3e2731', '733e39', 'b86f50', 'e4a672', 'ead4aa', 'a22633', 'e43b44', 'f6757a', 'f77622', 'feae34', '63c74d', '0099db'];
const KEYS = '0123456789abcdefghi';

const ADA_LEFT = [
  '................',
  '...........00000',
  '.........0077778',
  '........07787778',
  '.......077877778',
  '......0778777778',
  '......0787777770',
  '.....07877777700',
  '.....0787777700b',
  '....0787777700bb',
  '....078777700bbb',
  '...07877770abbbb',
  '...0878770abbbbb',
  '..07877770ab77bb',
  '..0787870abbbbbb',
  '..0878770abb00bb',
  '..0787870abb60bb',
  '..0877870abbbbbb',
  '..0787870aebbbba',
  '..0878770abbbbbb',
  '..0787870abbbbbd',
  '..08778770abbbbb',
  '..078787770aabbb',
  '...08787770aaaaa',
  '...0878770..0aab',
  '....087870..0abb',
  '.....0000.1110ab',
  '......1112222111',
  '....11122255665a',
  '...1112222556666',
  '..11122222256666',
  '.111222222225566',
];

const mirror = (left) => left.map((half) => half + [...half].reverse().join(''));
const grid = (rows) => rows.map((r) => [...r]);
const put = (g, x, y, k) => { g[y][x] = k; };
const both = (g, x, y, k) => { put(g, x, y, k); put(g, 31 - x, y, k); };
const recolor = (g, map, fromRow = 0, toRow = 31) => {
  for (let y = fromRow; y <= toRow; y++) for (let x = 0; x < 32; x++) if (map[g[y][x]]) g[y][x] = map[g[y][x]];
};
const SKIN = new Set(['9', 'a', 'b', 'd', 'e']);
/**
 * Cuts the hair at row `y`: below it, each row keeps only the face/neck plus
 * a one-pixel outline, so no old hair outline is left hanging.
 */
const cutHair = (g, y) => {
  for (let row = y; row <= 25; row++) {
    const xs = g[row].map((ch, x) => (SKIN.has(ch) ? x : -1)).filter((x) => x >= 0);
    if (!xs.length) continue;
    const [first, last] = [Math.min(...xs), Math.max(...xs)];
    for (let x = 0; x < 32; x++) {
      if (x < first - 1 || x > last + 1) g[row][x] = '.';
      else if (x === first - 1 || x === last + 1) g[row][x] = '0';
    }
  }
  for (let x = 0; x < 32; x++) if (['7', '8', '4', '5'].includes(g[y - 1][x]) && g[y][x] === '.') g[y - 1][x] = '0';
};
/** Keeps the hair at most `margin` px away from the face on rows from..to (a closer haircut). */
const skinSpan = (row) => {
  const xs = row.map((ch, x) => (SKIN.has(ch) ? x : -1)).filter((x) => x >= 0);
  return xs.length ? [Math.min(...xs), Math.max(...xs)] : null;
};
const trimHair = (g, from, to, margin) => {
  const widest = skinSpan(g[14]); // rows above the face follow the face's widest line
  for (let row = from; row <= to; row++) {
    const [first, last] = (row < 14 ? null : skinSpan(g[row])) ?? widest;
    for (let x = 0; x < 32; x++) {
      if (x < first - margin - 1 || x > last + margin + 1) g[row][x] = '.';
      else if (x === first - margin - 1 || x === last + margin + 1) g[row][x] = '0';
    }
  }
};

/** Round glasses (frame color `k`) around the eyes on rows 14–16. */
const glasses = (g, k = '1') => {
  for (const x of [10, 11, 12, 13, 14]) both(g, x, 14, k);
  for (const x of [10, 14]) { both(g, x, 15, k); both(g, x, 16, k); }
  for (const x of [11, 12, 13]) both(g, x, 17, k);
  put(g, 15, 15, k); put(g, 16, 15, k);
};
/** Clothes: body rows 26–31 recolored, with an optional collar color. */
const clothes = (g, body, light, collar = null) => {
  recolor(g, { 1: body, 2: light }, 26, 31);
  if (collar) recolor(g, { 5: collar, 6: collar }, 26, 31);
};

function ada() {
  const g = grid(mirror(ADA_LEFT));
  put(g, 22, 4, 'd'); put(g, 23, 4, 'c'); put(g, 22, 5, 'c'); // red ribbon
  return g;
}

function sonja() {
  const g = grid(mirror(ADA_LEFT));
  cutHair(g, 21); // shoulder-length waves instead of long ringlets
  trimHair(g, 4, 20, 3);
  for (let y = 2; y <= 6; y++) { put(g, 15, y, '7'); put(g, 16, y, '7'); } // no centre parting...
  for (let y = 2; y <= 5; y++) put(g, 12, y, '8'); // ...a side parting instead
  clothes(g, '3', '4', '6'); // grey-blue blouse, white collar
  for (const x of [12, 14]) both(g, x, 26, '6'); // pearl necklace
  put(g, 16, 27, '6'); put(g, 15, 27, '6');
  return g;
}

function liane() {
  const g = grid(mirror(ADA_LEFT));
  recolor(g, { 7: '4', 8: '5' }, 0, 25); // light grey hair
  cutHair(g, 18); // short hair
  trimHair(g, 4, 17, 2);
  for (let y = 2; y <= 6; y++) { put(g, 15, y, '4'); put(g, 16, y, '4'); }
  glasses(g, '3');
  clothes(g, 'c', 'd', '6'); // red top, white collar
  return g;
}

// Short, receding dark hair: the top of the head is drawn on its own (left half, mirrored).
const JOBS_TOP = [
  '................',
  '................',
  '................',
  '..........000000',
  '.........0777777',
  '........07777777',
  '........0777bbbb',
  '........077bbbbb',
  '........07bbbbbb',
  '........0abbbbbb',
  '........0abbbbbb',
  '........0abbbbbb',
  '........0abbbbbb',
];

function jobs() {
  const g = grid(mirror([...JOBS_TOP, ...ADA_LEFT.slice(JOBS_TOP.length)]));
  cutHair(g, 13);
  glasses(g, '3');
  recolor(g, { d: 'a' }, 20, 20); // no red lips
  for (const [x, y] of [[11, 21], [13, 22], [15, 22], [12, 23], [14, 23]]) both(g, x, y, '8'); // stubble
  both(g, 14, 20, '9'); put(g, 15, 20, '9'); put(g, 16, 20, '9');
  clothes(g, '0', '1', '0'); // black turtleneck
  for (let x = 12; x <= 19; x++) { g[24][x] = '0'; g[25][x] = '0'; } // high collar
  return g;
}

const CHARACTERS = { ada_lovelace: ada, sonja_ashauer: sonja, liane_tarouco: liane, steve_jobs: jobs };

function png(rows, scale) {
  const size = 32 * scale;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const ch = rows[Math.floor(y / scale)][Math.floor(x / scale)];
      if (ch === '.') continue;
      const hex = PAL[KEYS.indexOf(ch)];
      if (!hex) throw new Error(`cor desconhecida: ${ch}`);
      const i = y * (size * 4 + 1) + 1 + x * 4;
      raw[i] = parseInt(hex.slice(0, 2), 16); raw[i + 1] = parseInt(hex.slice(2, 4), 16); raw[i + 2] = parseInt(hex.slice(4, 6), 16); raw[i + 3] = 255;
    }
  }
  const table = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = table[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, c]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const scale = Number(process.argv[2] ?? 1);
const outDir = process.argv[3] ?? 'assets/personagens';
for (const [file, draw] of Object.entries(CHARACTERS)) {
  writeFileSync(join(outDir, `${file}${scale > 1 ? `_x${scale}` : ''}.png`), png(draw().map((r) => r.join('')), scale));
}
console.log(`${Object.keys(CHARACTERS).length} retratos desenhados em ${outDir}`);
