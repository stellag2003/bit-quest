/** Shared shape returned by every runner (see SPEC-001 "trace"). */
export const runResult = (success, steps, failure, finalState) => ({ success, steps, failure, finalState });

/** A problem found before the robot moves — it costs no energy. */
export const validationFailure = (problem, world) =>
  runResult(false, [], { ...problem, stepIndex: -1 }, { ...world.start });

export const toStep = (base, outcome) => ({
  ...base,
  to: outcome.state,
  motion: outcome.motion,
  ok: outcome.ok,
  error: outcome.error ?? null,
  target: outcome.target ?? null,
});
