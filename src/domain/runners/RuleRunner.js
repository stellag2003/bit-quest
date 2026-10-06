import { findRuleProblem, isCompleteRule } from '../program.js';
import { runResult, toStep, validationFailure } from './runResult.js';

/**
 * Fase 2: the robot walks on its own; on every tick the first rule whose
 * sensor fires replaces the default command (SPEC-003).
 */
export class RuleRunner {
  constructor(commands, sensors, { defaultCommand = 'walk', maxTicks = 60 } = {}) {
    this.commands = commands;
    this.sensors = sensors;
    this.defaultCommand = defaultCommand;
    this.maxTicks = maxTicks;
  }

  get kind() {
    return 'rules';
  }

  measure(rules) {
    return rules.filter(isCompleteRule).length;
  }

  run(rules, world) {
    const problem = findRuleProblem(rules);
    if (problem) return validationFailure(problem, world);

    const active = rules.filter(isCompleteRule);
    const visited = new Set();
    const steps = [];
    let state = { ...world.start };

    for (let tick = 0; tick < this.maxTicks; tick += 1) {
      const key = `${state.x},${state.y},${state.dir}`;
      if (visited.has(key)) {
        // Rules are deterministic: the same state again means an endless circle.
        return runResult(false, steps, { code: 'stuck_loop', stepIndex: steps.length - 1, nodeId: steps.at(-1)?.nodeId ?? null }, state);
      }
      visited.add(key);

      const fired = active.find((r) => this.sensors.get(r.condition).test(world, state));
      const command = fired ? fired.action : this.defaultCommand;
      const outcome = this.commands.get(command).execute(world, state);
      steps.push(toStep({ nodeId: fired?.id ?? null, command, loops: [], from: state }, outcome));

      if (!outcome.ok) {
        return runResult(false, steps, { code: outcome.error, stepIndex: steps.length - 1, nodeId: fired?.id ?? null }, state);
      }
      state = outcome.state;
      if (world.isGoal(state)) return runResult(true, steps, null, state);
    }
    return runResult(false, steps, { code: 'too_long', stepIndex: steps.length - 1, nodeId: null }, state);
  }
}
