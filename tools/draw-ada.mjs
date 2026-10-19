// Draws Ada Lovelace as a 32×32 PNG in the same 19-color palette as the other
// characters (no art for her came with the delivery).
// Rows are written as the LEFT half (16 px) and mirrored, then a few
// asymmetric touches are applied.
// Usage: node tools/draw-ada.mjs assets/personagens/ada_lovelace.png [scale]
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const PAL = ['181425', '262b44', '3a4466', '5a6988', '8b9bb4', 'c0cbdc', 'ffffff', '3e2731', '733e39', 'b86f50', 'e4a672', 'ead4aa', 'a22633', 'e43b44', 'f6757a', 'f77622', 'feae34', '63c74d', '0099db'];
const KEYS = '0123456789abcdefghi';

const LEFT = [
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

const rows = LEFT.map((half, y) => {
  if (half.length !== 16) throw new Error(`linha ${y}: ${half.length}`);
  return half + [...half].reverse().join('');
});

// Asymmetric touch: a small red ribbon in the hair on her right side.
const put = (x, y, k) => { rows[y] = rows[y].slice(0, x) + k + rows[y].slice(x + 1); };
put(22, 4, 'd'); put(23, 4, 'c'); put(22, 5, 'c');

const scale = Number(process.argv[3] ?? 1);
const size = 32 * scale;
const raw = Buffer.alloc(size * (size * 4 + 1));
for (let y = 0; y < size; y++) {
  const row = rows[Math.floor(y / scale)];
  raw[y * (size * 4 + 1)] = 0;
  for (let x = 0; x < size; x++) {
    const ch = row[Math.floor(x / scale)];
    const i = y * (size * 4 + 1) + 1 + x * 4;
    if (ch === '.') continue;
    const hex = PAL[KEYS.indexOf(ch)];
    if (!hex) throw new Error(`cor desconhecida: ${ch}`);
    raw[i] = parseInt(hex.slice(0, 2), 16); raw[i + 1] = parseInt(hex.slice(2, 4), 16); raw[i + 2] = parseInt(hex.slice(4, 6), 16); raw[i + 3] = 255;
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (buf) => { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(body));
  return Buffer.concat([len, body, c]);
};
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
writeFileSync(process.argv[2], Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
