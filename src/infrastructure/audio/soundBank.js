/**
 * 8-bit sound design as data. Effects: [note|freq, seconds] lists, optional
 * pitch slide. Songs: tempo + voices of [note, beats].
 */
export const SFX = {
  press: { wave: 'square', gain: 0.12, notes: [['A5', 0.035]] },
  move: { wave: 'square', gain: 0.07, notes: [['E5', 0.025]] },
  place: { wave: 'square', gain: 0.12, notes: [['E5', 0.04], ['A5', 0.06]] },
  remove: { wave: 'square', gain: 0.1, notes: [['A4', 0.04], ['E4', 0.06]] },
  step: { wave: 'triangle', gain: 0.22, notes: [['C3', 0.05]] },
  turn: { wave: 'triangle', gain: 0.18, notes: [['G3', 0.04]] },
  jump: { wave: 'square', gain: 0.12, notes: [[260, 0.16]], slideTo: 900 },
  bump: { wave: 'square', gain: 0.16, notes: [[140, 0.16]], slideTo: 60 },
  wrong: { wave: 'square', gain: 0.13, notes: [['E4', 0.11], ['C4', 0.2]] },
  correct: { wave: 'square', gain: 0.13, notes: [['C5', 0.08], ['E5', 0.08], ['G5', 0.14]] },
  star: { wave: 'square', gain: 0.12, notes: [['C6', 0.06], ['G6', 0.12]] },
  xp: { wave: 'square', gain: 0.08, notes: [['G5', 0.04], ['C6', 0.05]] },
  coin: { wave: 'square', gain: 0.11, notes: [['B5', 0.07], ['E6', 0.22]] },
  achievement: { wave: 'square', gain: 0.12, notes: [['G5', 0.08], ['C6', 0.08], ['E6', 0.08], ['G6', 0.24]] },
  unlock: {
    wave: 'square',
    gain: 0.11,
    notes: [['C5', 0.07], ['E5', 0.07], ['G5', 0.07], ['C6', 0.07], ['E6', 0.07], ['G6', 0.07], ['C7', 0.4]],
  },
  boot: { wave: 'square', gain: 0.14, notes: [['B5', 0.09], ['E6', 0.6]] },
  lesson: { wave: 'triangle', gain: 0.2, notes: [['C5', 0.06], ['G5', 0.1]] },
  type: { wave: 'square', gain: 0.03, notes: [['C6', 0.012]] },
};

export const SONGS = {
  victory: {
    bpm: 168,
    loop: false,
    gain: 0.1,
    voices: [
      {
        wave: 'square',
        notes: [['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['C6', 1], ['G5', 0.5], ['C6', 2], ['A5', 0.5], ['B5', 0.5], ['C6', 0.5], ['D6', 0.5], ['E6', 3]],
      },
      {
        wave: 'triangle',
        gain: 2.2,
        notes: [['C3', 1], ['G3', 1], ['C3', 1], ['G3', 1], ['F3', 1], ['G3', 1], ['C3', 3]],
      },
    ],
  },
  theme: {
    bpm: 132,
    loop: true,
    gain: 0.045,
    voices: [
      {
        wave: 'square',
        notes: [
          ['E5', 1], ['G5', 1], ['C6', 1], ['G5', 1], ['A5', 1], ['G5', 0.5], ['E5', 0.5], ['D5', 2],
          ['F5', 1], ['A5', 1], ['C6', 1], ['A5', 1], ['G5', 1], ['E5', 1], ['C5', 2],
          ['E5', 1], ['G5', 1], ['C6', 1], ['D6', 1], ['E6', 1], ['D6', 0.5], ['C6', 0.5], ['A5', 2],
          ['G5', 1], ['E5', 1], ['D5', 1], ['F5', 1], ['E5', 1], ['D5', 1], ['C5', 2],
        ],
      },
      {
        wave: 'triangle',
        gain: 3,
        notes: [
          ['C3', 2], ['C3', 2], ['F2', 2], ['G2', 2],
          ['F2', 2], ['F2', 2], ['C3', 2], ['C3', 2],
          ['C3', 2], ['G2', 2], ['A2', 2], ['A2', 2],
          ['G2', 2], ['G2', 2], ['C3', 2], ['C3', 2],
        ],
      },
    ],
  },
};
