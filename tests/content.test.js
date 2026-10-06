import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ChallengeEvaluator } from '../src/domain/ChallengeEvaluator.js';
import { createCommandRegistry } from '../src/domain/commands.js';
import { cmd, flatten } from '../src/domain/program.js';
import { RuleRunner } from '../src/domain/runners/RuleRunner.js';
import { SequenceRunner } from '../src/domain/runners/SequenceRunner.js';
import { createSensorRegistry } from '../src/domain/sensors.js';
import { World } from '../src/domain/World.js';
import { CONTENT } from '../src/content/index.js';
import { FAILURES } from '../src/content/feedback.js';

const commands = createCommandRegistry();
const evaluator = new ChallengeEvaluator([new SequenceRunner(commands), new RuleRunner(commands, createSensorRegistry())]);

describe('Content: every challenge is solvable (AC-2.1)', () => {
  for (const fase of CONTENT.fases) {
    for (const challenge of fase.challenges) {
      it(`${challenge.id} ${challenge.title}`, () => {
        challenge.maps.forEach((rows) => new World(rows));
        const result = evaluator.evaluate(challenge, challenge.solution);
        assert.equal(result.success, true, JSON.stringify(result.failure));
        assert.equal(result.blocksUsed, challenge.optimalBlocks);
        if (challenge.maxBlocks) assert.ok(result.blocksUsed <= challenge.maxBlocks);
      });
    }
  }
});

describe('Content: AC-4.2 loop challenges need a loop', () => {
  for (const challenge of CONTENT.fases[2].challenges) {
    it(`${challenge.id} unrolled solution exceeds the block limit`, () => {
      const unrolled = [...flatten(challenge.solution)].map(({ node }) => cmd(node.command));
      const result = evaluator.evaluate(challenge, unrolled);
      assert.equal(result.failure?.code, 'too_many_blocks');
    });
  }
});

describe('Content: lesson demos and copy', () => {
  it('every lesson demo reaches its goal', () => {
    for (const fase of CONTENT.fases) {
      for (const slide of fase.lesson.filter((s) => s.demo)) {
        const challenge = { kind: slide.demo.kind, maps: [slide.demo.map] };
        assert.equal(evaluator.evaluate(challenge, slide.demo.program).success, true, fase.id);
      }
    }
  });

  it('every engine failure code has kid-friendly feedback', () => {
    const codes = ['empty', 'empty_loop', 'incomplete_rule', 'too_many_blocks', 'edge', 'hit_wall', 'hit_rock', 'jump_wall', 'bad_landing', 'not_reached', 'stuck_loop', 'too_long'];
    codes.forEach((code) => assert.ok(FAILURES[code]?.title && FAILURES[code]?.hint, code));
  });

  it('every fase reward points to an existing mentor and every mentor has a game message', () => {
    const ids = CONTENT.mentors.map((m) => m.id);
    CONTENT.fases.forEach((f) => assert.ok(ids.includes(f.reward.mentorId) && ids.includes(f.mentorId)));
    CONTENT.mentors.forEach((m) => assert.ok(m.message && m.fact && m.intro));
  });
});
