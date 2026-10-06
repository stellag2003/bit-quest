import { DIR_FROM_GLYPH } from './direction.js';
import { Tile, tileFromGlyph } from './tiles.js';

/** Immutable grid parsed from text rows (see SPEC-001). */
export class World {
  constructor(rows) {
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('World: mapa vazio');
    this.width = rows[0].length;
    this.height = rows.length;
    this.start = null;
    this.goal = null;
    const tiles = [];

    rows.forEach((row, y) => {
      if (row.length !== this.width) throw new Error(`World: linha ${y} com largura diferente`);
      [...row].forEach((glyph, x) => {
        const tile = tileFromGlyph(glyph);
        if (DIR_FROM_GLYPH[glyph]) {
          if (this.start) throw new Error('World: mais de um início');
          this.start = Object.freeze({ x, y, dir: DIR_FROM_GLYPH[glyph] });
        }
        if (tile === Tile.GOAL) {
          if (this.goal) throw new Error('World: mais de uma bandeira');
          this.goal = Object.freeze({ x, y });
        }
        tiles.push(tile);
      });
    });

    if (!this.start) throw new Error('World: mapa sem início');
    if (!this.goal) throw new Error('World: mapa sem bandeira');
    this.tiles = Object.freeze(tiles);
    Object.freeze(this);
  }

  inside(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  tileAt(x, y) {
    return this.inside(x, y) ? this.tiles[y * this.width + x] : Tile.VOID;
  }

  isGoal({ x, y }) {
    return x === this.goal.x && y === this.goal.y;
  }
}
