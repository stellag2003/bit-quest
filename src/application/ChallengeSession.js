/** One attempt-series at a challenge: counts failures (for stars) and cycles hints. */
export class ChallengeSession {
  constructor({ fase, challenge, index, submitProgram }) {
    this.fase = fase;
    this.challenge = challenge;
    this.index = index;
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
    if (outcome.status === 'failed' && outcome.energyLost) this.failures += 1;
    return outcome;
  }

  nextHint() {
    const { hints } = this.challenge;
    const hint = hints[this.hintIndex % hints.length];
    this.hintIndex += 1;
    return hint;
  }
}
