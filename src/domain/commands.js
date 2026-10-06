import { Registry } from '../core/Registry.js';
import { ahead, turnLeft, turnRight } from './direction.js';
import { Tile, isStandable } from './tiles.js';

/**
 * A command is `{ id, execute(world, state) }` returning either
 *   { ok: true,  state, motion }                     or
 *   { ok: false, state, motion: 'bump', error, target }.
 * The state passed in is never mutated.
 */
const moved = (state, motion) => ({ ok: true, state, motion });
const blocked = (state, error, target) => ({ ok: false, state, motion: 'bump', error, target });

const BLOCKING_ERRORS = Object.freeze({
  [Tile.VOID]: 'edge',
  [Tile.WALL]: 'hit_wall',
  [Tile.ROCK]: 'hit_rock',
});

export const walkCommand = Object.freeze({
  id: 'walk',
  execute(world, state) {
    const target = ahead(state);
    const error = BLOCKING_ERRORS[world.tileAt(target.x, target.y)];
    return error ? blocked(state, error, target) : moved({ ...state, ...target }, 'walk');
  },
});

export const turnLeftCommand = Object.freeze({
  id: 'turnLeft',
  execute: (world, state) => moved({ ...state, dir: turnLeft(state.dir) }, 'turn'),
});

export const turnRightCommand = Object.freeze({
  id: 'turnRight',
  execute: (world, state) => moved({ ...state, dir: turnRight(state.dir) }, 'turn'),
});

export const jumpCommand = Object.freeze({
  id: 'jump',
  execute(world, state) {
    const over = ahead(state, 1);
    const overTile = world.tileAt(over.x, over.y);
    if (overTile === Tile.VOID) return blocked(state, 'edge', over);
    if (overTile === Tile.WALL) return blocked(state, 'jump_wall', over);

    const land = ahead(state, 2);
    const landTile = world.tileAt(land.x, land.y);
    if (landTile === Tile.VOID) return blocked(state, 'edge', land);
    if (!isStandable(landTile)) return blocked(state, 'bad_landing', land);
    return moved({ ...state, ...land }, 'jump');
  },
});

export function createCommandRegistry() {
  return new Registry('Comando')
    .register(walkCommand)
    .register(turnLeftCommand)
    .register(turnRightCommand)
    .register(jumpCommand);
}
