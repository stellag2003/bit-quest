import { ACHIEVEMENTS } from './achievements.js';
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
  hero: { id: 'hero', name: 'Mary' },
  feedback: { failures: FAILURES, encouragements: ENCOURAGEMENTS, praise: PRAISE },
});
