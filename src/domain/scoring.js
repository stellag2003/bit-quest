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

export function computeStars({ failures, blocksUsed, optimalBlocks }) {
  let stars = failures === 0 ? 3 : failures <= 2 ? 2 : 1;
  if (optimalBlocks && blocksUsed > optimalBlocks) stars = Math.min(stars, 2);
  return stars;
}

export function challengeReward({ stars, previousStars = 0 }) {
  if (previousStars > 0) {
    const improvement = Math.max(0, stars - previousStars);
    return { xp: REWARDS.replayXp + improvement * REWARDS.xpPerStar, coins: improvement * REWARDS.coinsPerStar };
  }
  return { xp: REWARDS.baseXp + stars * REWARDS.xpPerStar, coins: stars * REWARDS.coinsPerStar };
}

export function levelFromXp(xp) {
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    current: xp % XP_PER_LEVEL,
    needed: XP_PER_LEVEL,
  };
}
