import { cmd } from '../../domain/program.js';

/** SPEC-002 — Fase 1: Sequências. */
export const fase1 = {
  id: 'f1',
  number: 1,
  title: 'Sequências',
  mentorId: 'ada',
  scenery: 'meadow',
  reward: { mentorId: 'grace' },
  concept: {
    title: 'Sequência',
    summary: 'Um programa é uma lista de comandos. O computador faz um por vez, do primeiro ao último.',
    example: [cmd('walk'), cmd('walk'), cmd('turnRight'), cmd('walk')],
  },
  lesson: [
    { text: 'Oi! Eu sou a Ada. Este é o Bit, um robô que adora seguir instruções.' },
    {
      text: 'Um programa é uma lista de comandos. O Bit faz um de cada vez, na ordem.',
      demo: {
        kind: 'sequence',
        map: ['#.....#', '.>..#..', '...G...', '#.....#'],
        program: [cmd('walk'), cmd('walk'), cmd('turnRight'), cmd('walk')],
      },
    },
    { text: 'Se a ordem muda, o caminho muda. Vamos montar seu primeiro programa?' },
  ],
  challenges: [
    {
      id: 'f1-c1',
      title: 'Primeiros passos',
      kind: 'sequence',
      goal: 'Leve o Bit até a bandeira.',
      palette: ['walk', 'turnLeft', 'turnRight', 'jump'],
      maps: [['#.....#', '..#....', '.>..G..', '....#..', '#.....#']],
      optimalBlocks: 3,
      hints: ['Conte os quadradinhos entre o Bit e a bandeira.', 'São 3 passos para a frente: Andar, Andar, Andar.'],
      solution: [cmd('walk'), cmd('walk'), cmd('walk')],
    },
    {
      id: 'f1-c2',
      title: 'A curva',
      kind: 'sequence',
      goal: 'A bandeira está depois da curva.',
      palette: ['walk', 'turnLeft', 'turnRight', 'jump'],
      maps: [['#.....#', '.>..#..', '..#....', '...G...', '#.....#']],
      optimalBlocks: 5,
      hints: ['O Bit precisa virar antes da árvore.', 'Ande 2, vire para a direita e ande mais 2.'],
      solution: [cmd('walk'), cmd('walk'), cmd('turnRight'), cmd('walk'), cmd('walk')],
    },
    {
      id: 'f1-c3',
      title: 'Pedra no caminho',
      kind: 'sequence',
      goal: 'Passe pela pedra e chegue à bandeira.',
      palette: ['walk', 'turnLeft', 'turnRight', 'jump'],
      maps: [['#......#', '....G...', '.#......', '.>.R...#', '#....#..']],
      optimalBlocks: 5,
      hints: ['Pedras são baixinhas: dá para Pular por cima.', 'Ande, pule a pedra, vire para a esquerda e ande 2.'],
      solution: [cmd('walk'), cmd('jump'), cmd('turnLeft'), cmd('walk'), cmd('walk')],
    },
  ],
};
