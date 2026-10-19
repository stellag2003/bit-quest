/**
 * Screen palettes (darkest → lightest). Bought with coins in Ajustes.
 * Each one brings its own background song (`song` = id in the sound bank).
 */
export const PALETTES = [
  { id: 'classic', name: 'Clássico', price: 0, song: 'theme', songName: 'Aventura', colors: ['#0f380f', '#306230', '#8bac0f', '#c9dc8b'] },
  { id: 'pocket', name: 'Bolso', price: 30, song: 'pocket', songName: 'Passeio', colors: ['#22231f', '#55574d', '#9ea091', '#dfe1d3'] },
  { id: 'sunset', name: 'Pôr do sol', price: 50, song: 'sunset', songName: 'Entardecer', colors: ['#2b1530', '#7b2f52', '#e0745a', '#fbdcab'] },
  { id: 'ocean', name: 'Oceano', price: 50, song: 'ocean', songName: 'Maré', colors: ['#0d1b3d', '#265a99', '#5fb4d9', '#d9f4f5'] },
];

export const ECONOMY = Object.freeze({ energyRefillPrice: 15 });
