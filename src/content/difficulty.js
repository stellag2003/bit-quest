/**
 * Difficulty levels, chosen when the game starts (and changeable in Ajustes).
 * Same maps and lessons in every level; what changes are the rules around them:
 *   stars       — failures allowed for 3★ / 2★, and whether extra blocks cap at 2★
 *   energy      — what costs energy, and whether a win gives 1 back
 *   exactBlocks — the program may not be longer than the best solution
 *   hintAfter   — failed runs needed before the hint opens
 *   hintPulse   — failed runs before the hint button starts blinking
 *   reward      — XP and coin multiplier
 *   speed       — how slowly Bit replays the program (animation time × speed)
 */
export const DIFFICULTIES = [
  {
    id: 'easy',
    icon: 'star',
    stars: { threeMaxFailures: 1, twoMaxFailures: 3, capExtraBlocks: false },
    energy: { onFailure: false, onSetupError: false, refundOnWin: 1 },
    exactBlocks: false,
    hintAfter: 0,
    hintPulse: 1,
    reward: 1,
    speed: 1.35,
  },
  {
    id: 'medium',
    icon: 'flag',
    stars: { threeMaxFailures: 0, twoMaxFailures: 2, capExtraBlocks: true },
    energy: { onFailure: true, onSetupError: false, refundOnWin: 1 },
    exactBlocks: false,
    hintAfter: 0,
    hintPulse: 2,
    reward: 1,
    speed: 1,
  },
  {
    id: 'hard',
    icon: 'flame',
    stars: { threeMaxFailures: 0, twoMaxFailures: 1, capExtraBlocks: true },
    energy: { onFailure: true, onSetupError: true, refundOnWin: 0 },
    exactBlocks: true,
    hintAfter: 2,
    hintPulse: 2,
    reward: 1.5,
    speed: 0.8,
  },
];

export const DEFAULT_DIFFICULTY = 'medium';
