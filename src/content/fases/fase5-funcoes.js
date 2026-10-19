import { call, cmd, fn } from '../../domain/program.js';

/** Fase 5: Funções. The child builds a ★ block once and uses it several times. */
const FN_PALETTE = ['walk', 'turnLeft', 'turnRight', 'jump', 'call'];

export const fase5 = {
  id: 'f5',
  number: 5,
  title: 'Funções',
  mentorId: 'sonja',
  scenery: 'canyon',
  reward: { mentorId: 'liane' },
  concept: {
    title: 'Função',
    summary: 'Uma função é um bloco novo que você cria juntando outros blocos. Depois é só usar esse bloco quantas vezes quiser.',
    example: [fn([cmd('walk'), cmd('jump')]), call(), call()],
  },
  lesson: [
    { text: 'Às vezes o mesmo pedaço de programa aparece várias vezes. Dá para escrever ele uma vez só!' },
    {
      text: 'Coloque os passos dentro da ★ Função. Cada bloco ★ que você usar faz tudo o que está lá dentro.',
      demo: {
        kind: 'sequence',
        map: ['#.G#', '#..#', '>..#'],
        program: [fn([cmd('walk'), cmd('turnLeft'), cmd('walk'), cmd('turnRight')]), call(), call()],
      },
    },
    { text: 'Primeiro monte a função lá em cima. Depois use o bloco ★ no programa.' },
  ],
  challenges: [
    {
      id: 'f5-c1',
      title: 'O bloco mágico',
      kind: 'sequence',
      goal: 'Crie uma função e chegue à bandeira com só 5 blocos.',
      palette: FN_PALETTE,
      functionMax: 4,
      maxBlocks: 5,
      maps: [['#.#.#.#.#', '>..R...RG', '#.#.#.#.#']],
      optimalBlocks: 5,
      hints: ['O caminho se repete: Andar, Andar, Pular.', 'Função: Andar, Andar, Pular. Programa: ★ e ★.'],
      solution: [fn([cmd('walk'), cmd('walk'), cmd('jump')]), call(), call()],
    },
    {
      id: 'f5-c2',
      title: 'Escada da Sonja',
      kind: 'sequence',
      goal: 'Suba a escada usando no máximo 7 blocos.',
      palette: FN_PALETTE,
      functionMax: 4,
      maxBlocks: 7,
      maps: [['.......', '..G#...', '.#..#..', '..#..#.', '...#.<.', '.......']],
      optimalBlocks: 7,
      hints: ['Cada degrau é igual: andar, virar, andar, virar.', 'Função: Andar, Virar dir., Andar, Virar esq. Use ★ três vezes.'],
      solution: [fn([cmd('walk'), cmd('turnRight'), cmd('walk'), cmd('turnLeft')]), call(), call(), call()],
    },
    {
      id: 'f5-c3',
      title: 'Padrão escondido',
      kind: 'sequence',
      goal: 'Ache o pedaço que se repete e use no máximo 8 blocos.',
      palette: FN_PALETTE,
      functionMax: 4,
      maxBlocks: 8,
      maps: [['#########', '>.R..####', '####.####', '####R####', '####.####', '####..R.G', '#########']],
      optimalBlocks: 8,
      hints: ['Antes e depois de cada curva o Bit faz: Andar, Pular, Andar.', 'Função: Andar, Pular, Andar. Programa: ★, Virar dir., ★, Virar esq., ★.'],
      solution: [fn([cmd('walk'), cmd('jump'), cmd('walk')]), call(), cmd('turnRight'), call(), cmd('turnLeft'), call()],
    },
  ],
};
