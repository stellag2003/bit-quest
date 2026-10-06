export const DIRS = Object.freeze({
  N: Object.freeze({ dx: 0, dy: -1 }),
  E: Object.freeze({ dx: 1, dy: 0 }),
  S: Object.freeze({ dx: 0, dy: 1 }),
  W: Object.freeze({ dx: -1, dy: 0 }),
});

const CLOCKWISE = ['N', 'E', 'S', 'W'];

export const DIR_FROM_GLYPH = Object.freeze({ '^': 'N', '>': 'E', v: 'S', '<': 'W' });

export function turnLeft(dir) {
  return CLOCKWISE[(CLOCKWISE.indexOf(dir) + 3) % 4];
}

export function turnRight(dir) {
  return CLOCKWISE[(CLOCKWISE.indexOf(dir) + 1) % 4];
}

/** Cell `distance` steps in front of a robot state. */
export function ahead(state, distance = 1) {
  const { dx, dy } = DIRS[state.dir];
  return { x: state.x + dx * distance, y: state.y + dy * distance };
}
