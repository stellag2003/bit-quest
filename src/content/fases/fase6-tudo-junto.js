import { call, cmd, fn, repeat, rule } from '../../domain/program.js';

/** Fase 6: Tudo junto. Final challenges mixing decisions, loops and functions on bigger maps. */
export const fase6 = {
  id: 'f6',
  number: 6,
  title: 'Tudo junto',
  mentorId: 'liane',
  scenery: 'lab',
  reward: { mentorId: 'jobs' },
  concept: {
    title: 'Pensamento computacional',
    summary: 'Programadores misturam tudo o que aprenderam: sequência, decisões, repetição e funções. Escolha a melhor ferramenta para cada caminho.',
    example: [repeat(2, [call(), cmd('turnRight')])],
  },
  lesson: [
    { text: 'Você já sabe sequências, decisões, repetição e funções. Agora é hora de juntar tudo!' },
    {
      text: 'Antes de montar, olhe o mapa inteiro: o que se repete? Onde o Bit precisa decidir?',
      strip: [fn([cmd('walk'), cmd('jump'), cmd('walk')]), repeat(2, [call(), cmd('turnRight')])],
    },
    { text: 'Não existe só um jeito certo. Mas o melhor programa é curto e fácil de entender.' },
  ],
  challenges: [
    {
      id: 'f6-c1',
      title: 'Labirinto de regras',
      kind: 'rules',
      goal: 'Crie as regras que levam o Bit por todo o labirinto.',
      sensors: ['rockAhead', 'wallAhead'],
      actions: ['jump', 'turnLeft', 'turnRight'],
      ruleSlots: 2,
      maps: [['#########', '#>.R...##', '######.##', '######R##', '######.##', '#G..R..##', '#########']],
      optimalBlocks: 2,
      hints: ['Você vai precisar de uma regra para pedras e outra para paredes.', 'SE pedra → Pular. SE parede → Virar dir.'],
      solution: [rule('rockAhead', 'jump'), rule('wallAhead', 'turnRight')],
    },
    {
      id: 'f6-c2',
      title: 'Volta na praça',
      kind: 'sequence',
      goal: 'Dê a volta nas pedras usando só 4 blocos.',
      palette: ['walk', 'turnLeft', 'turnRight', 'jump', 'repeat'],
      maxBlocks: 4,
      maps: [['>.R.', '##..', '#..R', 'GR..']],
      optimalBlocks: 4,
      hints: ['Andar, Pular, Virar... e de novo. Quantas vezes?', 'Repetir 3× [Andar, Pular, Virar dir.].'],
      solution: [repeat(3, [cmd('walk'), cmd('jump'), cmd('turnRight')])],
    },
    {
      id: 'f6-c3',
      title: 'Desafio final',
      kind: 'sequence',
      goal: 'Use uma função dentro do Repetir. No máximo 8 blocos!',
      palette: ['walk', 'turnLeft', 'turnRight', 'jump', 'repeat', 'call'],
      functionMax: 4,
      maxBlocks: 8,
      maps: [['>.R..####', '####.####', '####R####', '####.####', '####..R..', '########.', '########R', '########.', '########G']],
      optimalBlocks: 8,
      hints: ['O pedaço Andar, Pular, Andar aparece 4 vezes, com curvas entre eles.', 'Função: Andar, Pular, Andar. Programa: Repetir 2× [★, Virar dir., ★, Virar esq.].'],
      solution: [fn([cmd('walk'), cmd('jump'), cmd('walk')]), repeat(2, [call(), cmd('turnRight'), call(), cmd('turnLeft')])],
    },
  ],
};
