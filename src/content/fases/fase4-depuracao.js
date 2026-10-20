import { cmd, repeat, rule } from '../../domain/program.js';

/**
 * Fase 4: Depuração. Every challenge starts with a program that has ONE bug.
 * Each bug can be fixed with what the editors already do: remove a block,
 * change a Repetir count, or swap a rule's action.
 */
export const fase4 = {
  id: 'f4',
  number: 4,
  title: 'Depuração',
  mentorId: 'katherine',
  scenery: 'meadow',
  reward: { mentorId: 'sonja' },
  concept: {
    title: 'Depuração (debug)',
    summary: 'Depurar é achar e consertar o erro: rode, veja onde o Bit parou e mude só isso.',
    example: [cmd('walk'), cmd('walk'), cmd('turnRight'), cmd('walk')],
  },
  lesson: [
    { text: 'Nem todo programa funciona de primeira. Um erro no programa se chama bug.' },
    {
      text: 'Este programa tem um passo a mais. Rode e ache o bloco culpado.',
      strip: [cmd('walk'), cmd('walk'), cmd('walk'), cmd('turnRight'), cmd('walk')],
    },
    { text: 'Conserte só o que está errado: tire um bloco, mude um número ou troque uma regra.' },
  ],
  challenges: [
    {
      id: 'f4-c1',
      title: 'Um passo a mais',
      kind: 'sequence',
      goal: 'O programa tem um bug. Conserte e leve o Bit até a bandeira.',
      palette: ['walk', 'turnLeft', 'turnRight', 'jump'],
      maps: [['#.....#', '.>..#..', '.......', '...G...', '#.....#']],
      start: [cmd('walk'), cmd('walk'), cmd('walk'), cmd('turnRight'), cmd('walk'), cmd('walk')],
      optimalBlocks: 5,
      hints: ['Rode o programa: em qual bloco o Bit bate na árvore?', 'Tem um Andar a mais antes de Virar. Toque nele para tirar.'],
      solution: [cmd('walk'), cmd('walk'), cmd('turnRight'), cmd('walk'), cmd('walk')],
    },
    {
      id: 'f4-c2',
      title: 'Conta errada',
      kind: 'sequence',
      goal: 'O Repetir está contando errado. Conserte o número.',
      palette: ['walk', 'turnLeft', 'turnRight', 'jump', 'repeat'],
      maxBlocks: 2,
      maps: [['#.#.#.#.#.#', '.>.......G.', '#.#.#.#.#.#']],
      start: [repeat(6, [cmd('walk')])],
      optimalBlocks: 2,
      hints: ['O Bit para antes da bandeira. Faltam quantas casas?', 'Conte as casas até a bandeira e toque no número do Repetir até chegar nele.'],
      solution: [repeat(8, [cmd('walk')])],
    },
    {
      id: 'f4-c3',
      title: 'Regra trocada',
      kind: 'rules',
      scenery: 'canyon', // brick walls, to match the "Parede à frente" rule
      goal: 'Uma das regras está errada. Descubra qual e conserte.',
      sensors: ['rockAhead', 'wallAhead'],
      actions: ['jump', 'turnLeft', 'turnRight'],
      ruleSlots: 2,
      maps: [['########', '#>.R..##', '#####.##', '#####R##', '#G....##', '########']],
      start: [rule('rockAhead', 'jump'), rule('wallAhead', 'turnLeft')],
      optimalBlocks: 2,
      hints: ['A regra da pedra funciona. Olhe a regra da parede.', 'O caminho vira para a direita. Toque no ENTÃO da regra da parede e escolha Virar dir.'],
      solution: [rule('rockAhead', 'jump'), rule('wallAhead', 'turnRight')],
    },
  ],
};
