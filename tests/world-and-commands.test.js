import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createCommandRegistry } from '../src/domain/commands.js';
import { World } from '../src/domain/World.js';

const commands = createCommandRegistry();
const exec = (id, world, state) => commands.get(id).execute(world, state);

describe('SPEC-001 World', () => {
  it('parses start, goal and tiles', () => {
    const w = new World(['#>.G']);
    assert.deepEqual(w.start, { x: 1, y: 0, dir: 'E' });
    assert.deepEqual(w.goal, { x: 3, y: 0 });
    assert.equal(w.tileAt(0, 0), 'wall');
    assert.equal(w.tileAt(9, 9), 'void');
  });

  it('AC-1.5 rejects invalid maps', () => {
    assert.throws(() => new World(['..G']), /início/);
    assert.throws(() => new World(['>..']), /bandeira/);
    assert.throws(() => new World(['>.G', '..']), /largura/);
    assert.throws(() => new World(['>.X.G']), /desconhecido/);
  });
});

describe('SPEC-001 Commands', () => {
  const world = new World(['>.R.#', '.....', '....G']);
  const start = world.start;

  it('AC-1.1 walk moves one cell; blocked moves fail without moving', () => {
    assert.deepEqual(exec('walk', world, start).state, { x: 1, y: 0, dir: 'E' });
    const rock = exec('walk', world, { x: 1, y: 0, dir: 'E' });
    assert.equal(rock.ok, false);
    assert.equal(rock.error, 'hit_rock');
    assert.deepEqual(rock.state, { x: 1, y: 0, dir: 'E' });
    assert.equal(exec('walk', world, { x: 3, y: 0, dir: 'E' }).error, 'hit_wall');
    assert.equal(exec('walk', world, { x: 0, y: 0, dir: 'N' }).error, 'edge');
  });

  it('AC-1.2 turning keeps the position', () => {
    assert.deepEqual(exec('turnLeft', world, start).state, { x: 0, y: 0, dir: 'N' });
    assert.deepEqual(exec('turnRight', world, start).state, { x: 0, y: 0, dir: 'S' });
  });

  it('AC-1.3 jump clears rocks but not walls', () => {
    const jumped = exec('jump', world, { x: 1, y: 0, dir: 'E' });
    assert.equal(jumped.ok, true);
    assert.deepEqual(jumped.state, { x: 3, y: 0, dir: 'E' });
    assert.equal(exec('jump', world, { x: 3, y: 0, dir: 'E' }).error, 'jump_wall');
    assert.equal(exec('jump', world, { x: 0, y: 0, dir: 'E' }).error, 'bad_landing');
  });
});
