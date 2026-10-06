import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createCommandRegistry } from '../src/domain/commands.js';
import { cmd, countBlocks, expandedLength, repeat, rule } from '../src/domain/program.js';
import { RuleRunner } from '../src/domain/runners/RuleRunner.js';
import { SequenceRunner } from '../src/domain/runners/SequenceRunner.js';
import { createSensorRegistry } from '../src/domain/sensors.js';
import { World } from '../src/domain/World.js';

const commands = createCommandRegistry();
const sequence = new SequenceRunner(commands);
const rules = new RuleRunner(commands, createSensorRegistry());

describe('SPEC-002 SequenceRunner', () => {
  const world = new World(['>..G']);

  it('wins as soon as the robot reaches the goal', () => {
    const r = sequence.run([cmd('walk'), cmd('walk'), cmd('walk'), cmd('walk')], world);
    assert.equal(r.success, true);
    assert.equal(r.steps.length, 3);
  });

  it('AC-1.4 failure points to the guilty block', () => {
    const bad = cmd('jump');
    const r = sequence.run([cmd('walk'), cmd('walk'), bad], world);
    assert.equal(r.success, false);
    assert.equal(r.failure.code, 'edge');
    assert.equal(r.failure.nodeId, bad.id);
    assert.equal(r.failure.stepIndex, 2);
  });

  it('reports not_reached and empty programs (validation costs no step)', () => {
    assert.equal(sequence.run([cmd('walk')], world).failure.code, 'not_reached');
    const empty = sequence.run([], world);
    assert.equal(empty.failure.code, 'empty');
    assert.equal(empty.failure.stepIndex, -1);
  });
});

describe('SPEC-004 loops', () => {
  it('AC-4.1 counts blocks and expanded commands', () => {
    const program = [repeat(5, [cmd('walk')])];
    assert.equal(countBlocks(program), 2);
    assert.equal(expandedLength(program), 5);
  });

  it('records loop iterations in the trace', () => {
    const r = sequence.run([repeat(3, [cmd('walk')])], new World(['>..G']));
    assert.equal(r.success, true);
    assert.deepEqual(r.steps.map((s) => s.loops[0].iteration), [1, 2, 3]);
  });

  it('rejects empty loops', () => {
    assert.equal(sequence.run([repeat(3, [])], new World(['>..G'])).failure.code, 'empty_loop');
  });
});

describe('SPEC-003 RuleRunner', () => {
  it('walks by default and fires matching rules', () => {
    const jumpRule = rule('rockAhead', 'jump');
    const r = rules.run([jumpRule], new World(['>.R.G']));
    assert.equal(r.success, true);
    assert.deepEqual(r.steps.map((s) => s.command), ['walk', 'jump', 'walk']);
    assert.equal(r.steps[1].nodeId, jumpRule.id);
  });

  it('AC-3.2 detects robots walking in circles', () => {
    const map = ['#######', '#>...##', '####.##', '####.##', '#G...##', '#######'];
    const r = rules.run([rule('wallAhead', 'turnLeft')], new World(map));
    assert.equal(r.failure.code, 'stuck_loop');
  });

  it('rejects incomplete rules without moving', () => {
    const r = rules.run([rule('rockAhead', null)], new World(['>.G']));
    assert.equal(r.failure.code, 'incomplete_rule');
    assert.equal(r.steps.length, 0);
  });
});
