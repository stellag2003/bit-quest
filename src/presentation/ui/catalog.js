/** How domain ids are shown to kids (labels + icons). */
export const COMMAND_UI = {
  walk: { label: 'Andar', icon: 'walk', aria: 'Andar para a frente' },
  turnLeft: { label: 'Virar', detail: 'esq.', icon: 'turnLeft', aria: 'Virar para a esquerda' },
  turnRight: { label: 'Virar', detail: 'dir.', icon: 'turnRight', aria: 'Virar para a direita' },
  jump: { label: 'Pular', icon: 'jump', aria: 'Pular por cima' },
  repeat: { label: 'Repetir', icon: 'repeat', aria: 'Repetir comandos' },
};

export const SENSOR_UI = {
  rockAhead: { label: 'Pedra', detail: 'à frente', icon: 'rock', aria: 'Pedra à frente' },
  wallAhead: { label: 'Parede', detail: 'à frente', icon: 'wall', aria: 'Parede à frente' },
};
