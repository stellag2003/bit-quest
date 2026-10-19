/**
 * Difficulty applied to a challenge. Pure: returns a new challenge object.
 * "exactBlocks" turns the best solution's size into the block limit, so the
 * editor stops at the shortest program (rule challenges already are exact).
 */
export function applyDifficulty(challenge, difficulty) {
  if (!difficulty?.exactBlocks || !challenge.optimalBlocks) return challenge;
  const maxBlocks = Math.min(challenge.maxBlocks ?? Infinity, challenge.optimalBlocks);
  return { ...challenge, maxBlocks };
}

export function findDifficulty(difficulties, id, fallbackId) {
  return difficulties.find((d) => d.id === id) ?? difficulties.find((d) => d.id === fallbackId) ?? difficulties[0];
}
