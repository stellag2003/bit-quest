/** Star and reward rules from SPEC-005. */
export const REWARDS = Object.freeze({
  baseXp: 10,
  xpPerStar: 5,
  coinsPerStar: 2,
  replayXp: 5,
  faseBonusXp: 50,
  faseBonusCoins: 20,
});

export const XP_PER_LEVEL = 100;

/** SPEC-005 defaults (the "medium" level); each difficulty passes its own thresholds. */
export const DEFAULT_STAR_RULES = Object.freeze({ threeMaxFailures: 0, twoMaxFailures: 2, capExtraBlocks: true });

export function computeStars({ failures, blocksUsed, optimalBlocks }, rules = DEFAULT_STAR_RULES) {
  let stars = failures <= rules.threeMaxFailures ? 3 : failures <= rules.twoMaxFailures ? 2 : 1;
  if (rules.capExtraBlocks && optimalBlocks && blocksUsed > optimalBlocks) stars = Math.min(stars, 2);
  return stars;
}

export function challengeReward({ stars, previousStars = 0, multiplier = 1 }) {
  const scale = (value) => Math.round(value * multiplier);
  if (previousStars > 0) {
    const improvement = Math.max(0, stars - previousStars);
    return { xp: scale(REWARDS.replayXp + improvement * REWARDS.xpPerStar), coins: scale(improvement * REWARDS.coinsPerStar) };
  }
  return { xp: scale(REWARDS.baseXp + stars * REWARDS.xpPerStar), coins: scale(stars * REWARDS.coinsPerStar) };
}

export function levelFromXp(xp) {
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    current: xp % XP_PER_LEVEL,
    needed: XP_PER_LEVEL,
  };
}
