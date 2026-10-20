import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONTENT } from '../src/content/index.js';
import { cmd } from '../src/domain/program.js';
import { makeGame } from './helpers.js';

const fase1 = CONTENT.fases[0];
const [first] = fase1.challenges;
const wrong = [cmd('turnLeft'), cmd('walk'), cmd('walk')]; // 3 blocks (fits hard's limit) that miss the flag

function gameAt(difficulty) {
  const ctx = makeGame();
  ctx.game.updateSettings.execute({ difficulty });
  ctx.game.completeLesson.execute(fase1.id);
  return ctx;
}

const energyOf = (game) => game.playerSummary.execute().energy.value;

describe('Difficulty levels', () => {
  it('starts on medium until the player chooses', () => {
    const { game } = makeGame();
    assert.equal(game.store.get().settings.difficulty, null);
    assert.equal(game.currentDifficulty.execute().id, 'medium');
  });

  it('easy: failing never costs energy, but still counts against stars', () => {
    const { game } = gameAt('easy');
    const session = game.startChallenge.execute(first.id);
    session.submit(wrong);
    session.submit(wrong);
    assert.equal(energyOf(game), 5);
    const outcome = session.submit(first.solution);
    assert.equal(outcome.status, 'success');
    assert.equal(outcome.stars, 2); // easy: up to 1 failure keeps 3★, up to 3 keeps 2★
  });

  it('easy: one mistake still earns 3 stars; medium gives 2', () => {
    for (const [level, expected] of [['easy', 3], ['medium', 2]]) {
      const { game } = gameAt(level);
      const session = game.startChallenge.execute(first.id);
      session.submit(wrong);
      assert.equal(session.submit(first.solution).stars, expected, level);
    }
  });

  it('medium keeps the original rules: a failed run costs 1 energy, a win gives it back', () => {
    const { game } = gameAt('medium');
    const session = game.startChallenge.execute(first.id);
    assert.equal(session.submit(wrong).energyLost, true);
    assert.equal(energyOf(game), 4);
    session.submit(first.solution);
    assert.equal(energyOf(game), 5);
  });

  it('hard: empty programs cost energy, wins give none back and pay 1.5× rewards', () => {
    const medium = gameAt('medium').game.startChallenge.execute(first.id).submit(first.solution);
    const { game } = gameAt('hard');
    const session = game.startChallenge.execute(first.id);
    assert.equal(session.submit([]).energyLost, true);
    session.submit(wrong);
    assert.equal(energyOf(game), 3);
    const outcome = session.submit(first.solution);
    assert.equal(energyOf(game), 3);
    assert.equal(outcome.stars, 2); // the empty program never ran; 1 failed run on hard → 2★ (2 runs → 1★)
    assert.ok(outcome.reward.xp >= Math.round(medium.reward.xp * 0.5));
  });

  it('hard: the block limit is the best solution, and every challenge stays solvable', () => {
    const { game } = gameAt('hard');
    const session = game.startChallenge.execute(first.id);
    assert.equal(session.challenge.maxBlocks, first.optimalBlocks);
    const longer = [cmd('turnLeft'), cmd('turnRight'), ...first.solution];
    assert.equal(session.submit(longer).evaluation.failure.code, 'too_many_blocks');
    for (const fase of CONTENT.fases) {
      for (const c of fase.challenges) {
        const effective = { ...c, maxBlocks: Math.min(c.maxBlocks ?? Infinity, c.optimalBlocks) };
        assert.equal(game.evaluator.evaluate(effective, c.solution).success, true, c.id);
      }
    }
  });

  it('hard: the hint opens only after 2 failed runs', () => {
    const { game } = gameAt('hard');
    const session = game.startChallenge.execute(first.id);
    assert.equal(session.hintsLockedFor, 2);
    session.submit(wrong);
    session.submit(wrong);
    assert.equal(session.hintsLockedFor, 0);
  });
});

describe('Easy mode helps', () => {
  it('only easy shows the path preview, the hint on screen and the answer button', () => {
    const levels = Object.fromEntries(CONTENT.difficulties.levels.map((d) => [d.id, d]));
    assert.deepEqual([levels.easy.preview, levels.easy.hintOnScreen, levels.easy.answerAfter], [true, true, 2]);
    for (const id of ['medium', 'hard']) assert.deepEqual([levels[id].preview, levels[id].hintOnScreen, levels[id].answerAfter], [false, false, null], id);
  });
});
