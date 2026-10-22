import { countBlocks } from './program.js';

/**
 * Difficulty applied to a challenge. Pure: returns a new challenge object.
 * "exactBlocks" turns the best solution's size into the block limit, so the
 * editor stops at the shortest program (rule challenges already are exact).
 * Debugging challenges (`start`) keep room for their starting program: the
 * child must be able to run the buggy program and watch where it goes wrong.
 */
export function applyDifficulty(challenge, difficulty) {
  if (!difficulty?.exactBlocks || !challenge.optimalBlocks) return challenge;
  const startSize = challenge.start && challenge.kind === 'sequence' ? countBlocks(challenge.start) : 0;
  const maxBlocks = Math.max(Math.min(challenge.maxBlocks ?? Infinity, challenge.optimalBlocks), startSize);
  return { ...challenge, maxBlocks };
}

export function findDifficulty(difficulties, id, fallbackId) {
  return difficulties.find((d) => d.id === id) ?? difficulties.find((d) => d.id === fallbackId) ?? difficulties[0];
}
