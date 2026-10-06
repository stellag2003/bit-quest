import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ENERGY_MAX, ENERGY_REGEN_MS, currentEnergy, gainEnergy, spendEnergy } from '../src/domain/energy.js';
import { cmd } from '../src/domain/program.js';
import { computeStars } from '../src/domain/scoring.js';
import { registerActivity, visibleStreak } from '../src/domain/streak.js';
import { CONTENT } from '../src/content/index.js';
import { MemoryRepository } from '../src/infrastructure/MemoryRepository.js';
import { makeGame, solveFase } from './helpers.js';

const [fase1, fase2, fase3] = CONTENT.fases;

describe('SPEC-005 map unlocking', () => {
  it('AC-5.1 challenges unlock in order after the lesson', () => {
    const { game } = makeGame();
    assert.throws(() => game.startChallenge.execute('f1-c1'), /bloqueado/);
    game.completeLesson.execute('f1');
    assert.doesNotThrow(() => game.startChallenge.execute('f1-c1'));
    assert.throws(() => game.startChallenge.execute('f1-c2'), /bloqueado/);
    assert.throws(() => game.completeLesson.execute('f2'), /bloqueada/);
  });

  it('AC-5.2 completing a fase grants the bonus and mentor exactly once', () => {
    const { game, events } = makeGame();
    const outcomes = solveFase(game, fase1);
    const last = outcomes.at(-1);
    assert.equal(last.faseCompleted, true);
    assert.equal(last.mentorUnlocked, 'grace');
    assert.deepEqual(game.store.get().unlockedMentors, ['ada', 'grace']);

    const replay = game.startChallenge.execute('f1-c3').submit(fase1.challenges[2].solution);
    assert.equal(replay.faseCompleted, false);
    assert.equal(replay.mentorUnlocked, null);
    assert.equal(events.filter((e) => e.type === 'mentor:unlocked').length, 1);
    assert.equal(game.mapOverview.execute().fases[1].unlocked, true);
  });

  it('whole game can be finished, unlocking all mentors and medals', () => {
    const { game } = makeGame();
    [fase1, fase2, fase3].forEach((f) => solveFase(game, f));
    const p = game.store.get();
    assert.deepEqual(p.completedFases, ['f1', 'f2', 'f3']);
    assert.equal(p.unlockedMentors.length, CONTENT.mentors.length);
    assert.ok(p.achievements.includes('loop-master'));
    assert.ok(p.achievements.includes('star-sky'));
    assert.equal(game.mapOverview.execute().next, null);
  });
});

describe('SPEC-005 stars and rewards', () => {
  it('stars depend on failures and block economy', () => {
    assert.equal(computeStars({ failures: 0, blocksUsed: 3, optimalBlocks: 3 }), 3);
    assert.equal(computeStars({ failures: 2, blocksUsed: 3, optimalBlocks: 3 }), 2);
    assert.equal(computeStars({ failures: 5, blocksUsed: 3, optimalBlocks: 3 }), 1);
    assert.equal(computeStars({ failures: 0, blocksUsed: 6, optimalBlocks: 3 }), 2);
  });

  it('failures cost energy and lower the stars; validation errors are free', () => {
    const { game } = makeGame();
    game.completeLesson.execute('f1');
    const session = game.startChallenge.execute('f1-c1');
    assert.equal(session.submit([]).energyLost, false);
    assert.equal(session.submit([cmd('walk')]).energyLost, true);
    assert.equal(game.playerSummary.execute().energy.value, ENERGY_MAX - 1);
    const win = session.submit(fase1.challenges[0].solution);
    assert.equal(win.stars, 2);
    assert.equal(game.playerSummary.execute().energy.value, ENERGY_MAX);
    assert.ok(game.store.get().achievements.includes('debugger'));
  });

  it('blocks runs when energy is empty, and refills with coins', () => {
    const { game } = makeGame();
    game.completeLesson.execute('f1');
    const session = game.startChallenge.execute('f1-c1');
    for (let i = 0; i < ENERGY_MAX; i += 1) session.submit([cmd('walk')]);
    assert.equal(session.submit([cmd('walk')]).status, 'no_energy');
    assert.equal(game.refillEnergy.execute().ok, true);
    assert.equal(game.playerSummary.execute().energy.value, ENERGY_MAX);
  });

  it('progress survives a reload through the repository', () => {
    const repository = new MemoryRepository();
    const first = makeGame({ repository });
    solveFase(first.game, fase1);
    const second = makeGame({ repository });
    assert.deepEqual(second.game.store.get().completedFases, ['f1']);
  });
});

describe('SPEC-005 energy and streak', () => {
  it('AC-5.3 energy regenerates and never exceeds the max', () => {
    let e = { value: ENERGY_MAX, updatedAt: 0 };
    e = spendEnergy(e, 1000);
    e = spendEnergy(e, 2000);
    assert.equal(currentEnergy(e, 1000 + ENERGY_REGEN_MS).value, ENERGY_MAX - 1);
    assert.equal(currentEnergy(e, 1000 + ENERGY_REGEN_MS * 10).value, ENERGY_MAX);
    assert.equal(gainEnergy({ value: ENERGY_MAX, updatedAt: 0 }, 5, 3).value, ENERGY_MAX);
    assert.throws(() => spendEnergy({ value: 0, updatedAt: 0 }, 0));
  });

  it('AC-5.4 streak grows on consecutive days and resets after a gap', () => {
    let s = registerActivity({ count: 0, lastDay: null }, '2026-10-05');
    s = registerActivity(s, '2026-10-06');
    assert.equal(s.count, 2);
    assert.equal(registerActivity(s, '2026-10-06').count, 2);
    assert.equal(registerActivity(s, '2026-10-08').count, 1);
    assert.equal(visibleStreak(s, '2026-10-07'), 2);
    assert.equal(visibleStreak(s, '2026-10-09'), 0);
    assert.equal(registerActivity({ count: 4, lastDay: '2026-02-28' }, '2026-03-01').count, 5);
  });
});

describe('Economy and profile', () => {
  it('buys and selects palettes; mentors must be unlocked to be chosen (AC-6.1)', () => {
    const { game } = makeGame();
    assert.equal(game.purchasePalette.execute('sunset').ok, false);
    assert.equal(game.purchasePalette.execute('pocket').ok, true);
    assert.equal(game.store.get().palettes.current, 'pocket');
    assert.throws(() => game.selectPalette.execute('ocean'));
    assert.throws(() => game.selectMentor.execute('turing'));
  });

  it('reset keeps audio settings', () => {
    const { game } = makeGame();
    game.updateSettings.execute({ music: false });
    solveFase(game, fase1);
    game.resetProgress.execute();
    assert.equal(game.store.get().completedFases.length, 0);
    assert.equal(game.store.get().settings.music, false);
  });
});
