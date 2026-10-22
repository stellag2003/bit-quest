/**
 * Hints per challenge. Easy: always free. Medium/Hard: the first `freeHints` are free,
 * each one after that costs `hintPrice` coins. How many were used is saved per challenge,
 * so leaving and coming back does not refill the free ones.
 *
 * Medium/Hard start with the subtler nudges and only then reach the direct hints:
 * the hints you pay for are the more helpful ones.
 */
export class HintBook {
  constructor({ store, currentDifficulty }) {
    Object.assign(this, { store, currentDifficulty });
  }

  /** { used, freeLeft (null = unlimited), cost (0 = free), coins } for the next hint. */
  status(challengeId) {
    const { freeHints = null, hintPrice = 0 } = this.currentDifficulty.execute();
    const { hintsUsed, coins } = this.store.get();
    const used = hintsUsed?.[challengeId] ?? 0;
    const freeLeft = freeHints == null ? null : Math.max(0, freeHints - used);
    return { used, freeLeft, cost: freeLeft === 0 ? hintPrice : 0, coins };
  }

  /** Gives the next hint, charging coins once the free ones are over. */
  take(challenge) {
    const { used, cost, coins } = this.status(challenge.id);
    if (cost > coins) return { ok: false, reason: 'coins', cost, coins };
    const list = this.currentDifficulty.execute().subtleHints && challenge.nudges?.length
      ? [...challenge.nudges, ...challenge.hints]
      : challenge.hints;
    this.store.update((p) => {
      p.coins -= cost;
      p.hintsUsed = { ...p.hintsUsed, [challenge.id]: used + 1 };
    });
    return { ok: true, text: list[used % list.length], paid: cost, ...this.status(challenge.id) };
  }
}
