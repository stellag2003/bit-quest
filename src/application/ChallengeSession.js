/** One attempt-series at a challenge: counts failures (for stars) and cycles hints. */
export class ChallengeSession {
  constructor({ fase, challenge, index, difficulty, submitProgram }) {
    this.fase = fase;
    this.challenge = challenge;
    this.index = index;
    this.difficulty = difficulty;
    this.submitProgram = submitProgram;
    this.failures = 0;
    this.hintIndex = 0;
  }

  submit(program) {
    const outcome = this.submitProgram.execute({
      challengeId: this.challenge.id,
      program,
      failuresSoFar: this.failures,
    });
    if (outcome.status === 'failed' && outcome.executed) this.failures += 1;
    return outcome;
  }

  /** Failed runs still needed before the hint opens (0 = available). */
  get hintsLockedFor() {
    return Math.max(0, (this.difficulty?.hintAfter ?? 0) - this.failures);
  }

  nextHint() {
    const { hints } = this.challenge;
    const hint = hints[this.hintIndex % hints.length];
    this.hintIndex += 1;
    return hint;
  }
}
