import { countBlocks, findSequenceProblem, flatten } from '../program.js';
import { runResult, toStep, validationFailure } from './runResult.js';

/** Runs a list of commands (and Repetir loops) in order. Used by Fases 1 and 3. */
export class SequenceRunner {
  constructor(commands, { maxSteps = 200 } = {}) {
    this.commands = commands;
    this.maxSteps = maxSteps;
  }

  get kind() {
    return 'sequence';
  }

  measure(program) {
    return countBlocks(program);
  }

  run(program, world) {
    const problem = findSequenceProblem(program);
    if (problem) return validationFailure(problem, world);

    let state = { ...world.start };
    const steps = [];

    for (const { node, loops } of flatten(program)) {
      if (steps.length >= this.maxSteps) {
        return runResult(false, steps, { code: 'too_long', stepIndex: steps.length - 1, nodeId: node.id }, state);
      }
      const outcome = this.commands.get(node.command).execute(world, state);
      steps.push(toStep({ nodeId: node.id, command: node.command, loops, from: state }, outcome));

      if (!outcome.ok) {
        return runResult(false, steps, { code: outcome.error, stepIndex: steps.length - 1, nodeId: node.id }, state);
      }
      state = outcome.state;
      if (world.isGoal(state)) return runResult(true, steps, null, state);
    }

    const last = steps.at(-1);
    return runResult(false, steps, { code: 'not_reached', stepIndex: steps.length - 1, nodeId: last?.nodeId ?? null }, state);
  }
}
