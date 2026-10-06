import { EventBus } from '../src/core/EventBus.js';
import { createGame } from '../src/application/createGame.js';
import { CONTENT } from '../src/content/index.js';
import { MemoryRepository } from '../src/infrastructure/MemoryRepository.js';

export class FakeClock {
  constructor(start = new Date(2026, 9, 6, 10, 0, 0).getTime()) {
    this.time = start;
  }
  now() {
    return this.time;
  }
  advance(ms) {
    this.time += ms;
  }
}

export function makeGame({ clock = new FakeClock(), repository = new MemoryRepository() } = {}) {
  const bus = new EventBus();
  const events = [];
  const record = (type) => bus.on(type, (payload) => events.push({ type, payload }));
  ['run:failed', 'challenge:completed', 'fase:completed', 'mentor:unlocked', 'achievement:unlocked'].forEach(record);
  const game = createGame({ content: CONTENT, repository, clock, bus });
  return { game, clock, bus, events, repository };
}

/** Plays a whole fase with its official solutions. */
export function solveFase(game, fase) {
  game.completeLesson.execute(fase.id);
  return fase.challenges.map((c) => game.startChallenge.execute(c.id).submit(c.solution));
}
