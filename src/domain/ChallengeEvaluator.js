import { World } from './World.js';

/**
 * Runs a program against every map of a challenge using the runner that
 * matches `challenge.kind`. Any runner exposing { kind, measure, run } works.
 */
export class ChallengeEvaluator {
  constructor(runners) {
    this.runners = new Map(runners.map((runner) => [runner.kind, runner]));
  }

  runnerFor(challenge) {
    const runner = this.runners.get(challenge.kind);
    if (!runner) throw new Error(`Sem executor para desafios do tipo "${challenge.kind}"`);
    return runner;
  }

  evaluate(challenge, program) {
    const runner = this.runnerFor(challenge);
    const blocksUsed = runner.measure(program);

    if (challenge.maxBlocks && blocksUsed > challenge.maxBlocks) {
      return { success: false, runs: [], blocksUsed, commandsExecuted: 0, failure: { code: 'too_many_blocks', stepIndex: -1, nodeId: null, mapIndex: 0 } };
    }

    const runs = [];
    for (const [mapIndex, rows] of challenge.maps.entries()) {
      const result = runner.run(program, new World(rows));
      runs.push({ mapIndex, ...result });
      if (!result.success) {
        return { success: false, runs, blocksUsed, commandsExecuted: countSteps(runs), failure: { ...result.failure, mapIndex } };
      }
    }
    return { success: true, runs, blocksUsed, commandsExecuted: countSteps(runs), failure: null };
  }
}

const countSteps = (runs) => runs.reduce((total, run) => total + run.steps.length, 0);
