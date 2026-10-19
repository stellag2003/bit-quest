import { ACHIEVEMENTS } from './achievements.js';
import { DEFAULT_DIFFICULTY, DIFFICULTIES } from './difficulty.js';
import { ENCOURAGEMENTS, FAILURES, PRAISE } from './feedback.js';
import { FASES } from './fases/index.js';
import { GUIDE } from './guide.js';
import { MENTORS } from './mentors.js';
import { ECONOMY, PALETTES } from './palettes.js';

/** Game content in Portuguese (source language). See `locales/` for en/es. */
export const CONTENT = Object.freeze({
  fases: FASES,
  mentors: MENTORS,
  achievements: ACHIEVEMENTS,
  palettes: PALETTES,
  economy: ECONOMY,
  guide: GUIDE,
  difficulties: { levels: DIFFICULTIES, defaultId: DEFAULT_DIFFICULTY },
  hero: { id: 'hero', name: 'Mary' },
  feedback: { failures: FAILURES, encouragements: ENCOURAGEMENTS, praise: PRAISE },
});
