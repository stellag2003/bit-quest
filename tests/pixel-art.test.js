import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ICON_BITMAPS } from '../src/presentation/pixel/icons.js';
import { FLAG, MENTOR_SPRITES, ROBOT, ROCK, TREE } from '../src/presentation/pixel/sprites.js';
import { CONTENT } from '../src/content/index.js';

const isGrid = (rows, size) => rows.length === size && rows.every((r) => r.length === size && /^[.0-3]+$/.test(r));

describe('Pixel art data', () => {
  it('every sprite is a 16×16 grid of palette indices', () => {
    const sprites = {
      ...MENTOR_SPRITES,
      ROCK,
      TREE,
      FLAG_A: FLAG[0],
      FLAG_B: FLAG[1],
      ...Object.fromEntries(['N', 'S', 'E', 'W'].flatMap((d) => ROBOT[d].map((f, i) => [`ROBOT_${d}${i}`, f]))),
      ROBOT_BLINK_S: ROBOT.blinkS,
      ROBOT_BLINK_E: ROBOT.blinkE,
    };
    for (const [name, rows] of Object.entries(sprites)) assert.ok(isGrid(rows, 16), name);
  });

  it('every mentor has a portrait', () => {
    CONTENT.mentors.forEach((m) => assert.ok(MENTOR_SPRITES[m.id], m.id));
  });

  it('icons are rectangular 1-bit bitmaps', () => {
    for (const [name, rows] of Object.entries(ICON_BITMAPS)) {
      assert.ok(rows.every((r) => r.length === rows[0].length && /^[.#]+$/.test(r)), name);
    }
  });
});

describe('Character art (assets/personagens)', () => {
  it('every portrait is a 32×32 PNG and belongs to the hero or a real mentor', async () => {
    const { PORTRAITS, PORTRAIT_SIZE } = await import('../src/presentation/pixel/portraits.js');
    const ids = new Set(['hero', ...CONTENT.mentors.map((m) => m.id)]);
    assert.ok(PORTRAITS.hero, 'main character');
    for (const [id, uri] of Object.entries(PORTRAITS)) {
      assert.ok(ids.has(id), id);
      const png = Buffer.from(uri.split(',')[1], 'base64');
      assert.equal(png.toString('ascii', 1, 4), 'PNG', id);
      assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [PORTRAIT_SIZE, PORTRAIT_SIZE], id);
    }
  });
});
