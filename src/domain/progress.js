import { fullEnergy } from './energy.js';

/** Shape of the saved game (SPEC-007 "Persistência"). */
export const SAVE_VERSION = 1;

export function createInitialProgress(now, { firstMentor = 'ada', firstPalette = 'classic' } = {}) {
  return {
    version: SAVE_VERSION,
    xp: 0,
    coins: 30,
    stars: {},
    lessonsDone: [],
    completedFases: [],
    unlockedMentors: [firstMentor],
    currentMentor: firstMentor,
    energy: fullEnergy(now),
    streak: { count: 0, lastDay: null },
    achievements: [],
    palettes: { owned: [firstPalette], current: firstPalette },
    settings: { sfx: true, music: true },
    stats: { runs: 0, failures: 0 },
  };
}

/** Fills fields added in newer versions; tolerates corrupted input. */
export function migrateProgress(saved, now, options) {
  const base = createInitialProgress(now, options);
  if (!saved || typeof saved !== 'object') return base;
  const merged = { ...base, ...saved, version: SAVE_VERSION };
  for (const key of ['energy', 'streak', 'palettes', 'settings', 'stats']) {
    merged[key] = { ...base[key], ...(saved[key] ?? {}) };
  }
  for (const key of ['lessonsDone', 'completedFases', 'unlockedMentors', 'achievements']) {
    if (!Array.isArray(merged[key])) merged[key] = base[key];
  }
  if (typeof merged.stars !== 'object' || merged.stars === null) merged.stars = {};
  return merged;
}
