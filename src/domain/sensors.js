import { Registry } from '../core/Registry.js';
import { ahead } from './direction.js';
import { Tile, isTall } from './tiles.js';

/** A sensor is `{ id, test(world, state) => boolean }` used by SE/ENTÃO rules. */
const tileAhead = (world, state) => {
  const { x, y } = ahead(state);
  return world.tileAt(x, y);
};

export const rockAheadSensor = Object.freeze({
  id: 'rockAhead',
  test: (world, state) => tileAhead(world, state) === Tile.ROCK,
});

export const wallAheadSensor = Object.freeze({
  id: 'wallAhead',
  test: (world, state) => isTall(tileAhead(world, state)),
});

export function createSensorRegistry() {
  return new Registry('Sensor').register(rockAheadSensor).register(wallAheadSensor);
}
