import { DIR_FROM_GLYPH } from './direction.js';

export const Tile = Object.freeze({
  FLOOR: 'floor',
  WALL: 'wall',
  ROCK: 'rock',
  GOAL: 'goal',
  VOID: 'void',
});

const GLYPHS = Object.freeze({ '.': Tile.FLOOR, '#': Tile.WALL, R: Tile.ROCK, G: Tile.GOAL });

export function tileFromGlyph(glyph) {
  if (DIR_FROM_GLYPH[glyph]) return Tile.FLOOR;
  const tile = GLYPHS[glyph];
  if (!tile) throw new Error(`Glifo de mapa desconhecido: "${glyph}"`);
  return tile;
}

/** The robot can stand (and land) here. */
export const isStandable = (tile) => tile === Tile.FLOOR || tile === Tile.GOAL;

/** Too tall to jump over (walls and the world edge). */
export const isTall = (tile) => tile === Tile.WALL || tile === Tile.VOID;
