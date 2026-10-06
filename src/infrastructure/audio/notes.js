const SEMITONES = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };

/** 'A4' → 440. Numbers pass through; 'r' (rest) → 0. */
export function noteToFreq(note) {
  if (typeof note === 'number') return note;
  if (note === 'r') return 0;
  const match = /^([A-G]#?)(\d)$/.exec(note);
  if (!match) throw new Error(`Nota inválida: ${note}`);
  const [, name, octave] = match;
  return 440 * 2 ** ((SEMITONES[name] + (Number(octave) - 4) * 12) / 12);
}
