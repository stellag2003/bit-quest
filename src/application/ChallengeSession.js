/** One attempt-series at a challenge: counts failures (for stars) and hands out hints. */
export class ChallengeSession {
  constructor({ fase, challenge, index, difficulty, submitProgram, hintBook }) {
    this.fase = fase;
    this.challenge = challenge;
    this.index = index;
    this.difficulty = difficulty;
    this.submitProgram = submitProgram;
    this.hintBook = hintBook;
    this.failures = 0;
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

  /** What the next hint costs: { freeLeft, cost, coins }. */
  hintStatus() {
    return this.hintBook.status(this.challenge.id);
  }

  /** Next hint (Medium/Hard: subtler nudges first); charges coins once the free ones are used. */
  takeHint() {
    return this.hintBook.take(this.challenge);
  }
}
