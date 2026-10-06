import { cmd, repeat } from '../../domain/program.js';

/** SPEC-004 — Fase 3: Repetição (loops). */
const LOOP_PALETTE = ['walk', 'turnLeft', 'turnRight', 'jump', 'repeat'];

export const LOOP_MESSAGE =
  'Você acabou de criar um loop! Ele permite repetir uma ação várias vezes sem precisar escrever o mesmo comando.';

export const fase3 = {
  id: 'f3',
  number: 3,
  title: 'Repetição',
  mentorId: 'turing',
  scenery: 'lab',
  reward: { mentorId: 'katherine' },
  concept: {
    title: 'Repetição (loop)',
    summary: 'Em vez de escrever o mesmo comando muitas vezes, use Repetir e diga quantas vezes.',
    example: [repeat(5, [cmd('walk')])],
  },
  lesson: [
    {
      text: 'Eu sou o Alan. Repare: Andar, Andar, Andar, Andar, Andar... que cansativo!',
      strip: [cmd('walk'), cmd('walk'), cmd('walk'), cmd('walk'), cmd('walk')],
    },
    {
      text: 'Com Repetir 5× Andar, você escreve uma vez e o Bit repete sozinho.',
      demo: {
        kind: 'sequence',
        map: ['#.#.#.#.', '.>....G.', '#.#.#.#.'],
        program: [repeat(5, [cmd('walk')])],
      },
    },
    { text: 'Isso se chama loop. Agora cada desafio tem um limite de blocos. Economize!' },
  ],
  challenges: [
    {
      id: 'f3-c1',
      title: 'Corredor longo',
      kind: 'sequence',
      goal: 'Chegue à bandeira usando só 2 blocos.',
      palette: LOOP_PALETTE,
      maxBlocks: 2,
      maps: [['#.#.#.#.#', '.>....G..', '#.#.#.#.#']],
      optimalBlocks: 2,
      hints: ['Coloque o bloco Repetir e um Andar dentro dele.', 'Toque no ×2 para mudar quantas vezes repetir. Conte as casas!'],
      successMessage: LOOP_MESSAGE,
      solution: [repeat(5, [cmd('walk')])],
    },
    {
      id: 'f3-c2',
      title: 'Escada',
      kind: 'sequence',
      goal: 'Suba a escada com no máximo 5 blocos.',
      palette: LOOP_PALETTE,
      maxBlocks: 5,
      maps: [['.......', '...#G..', '..#..#.', '.#..#..', '.>.#...', '.......']],
      optimalBlocks: 5,
      hints: ['Cada degrau é igual: andar, virar, andar, virar.', 'Repetir 3× [Andar, Virar ↺, Andar, Virar ↻].'],
      solution: [repeat(3, [cmd('walk'), cmd('turnLeft'), cmd('walk'), cmd('turnRight')])],
    },
    {
      id: 'f3-c3',
      title: 'Saltos no ritmo',
      kind: 'sequence',
      goal: 'Encontre o padrão e use só 3 blocos.',
      palette: LOOP_PALETTE,
      maxBlocks: 3,
      maps: [['#.#.#.#.#.', '>.R..R..RG', '#.#.#.#.#.']],
      optimalBlocks: 3,
      hints: ['Antes de cada pedra há um chão livre. Qual é o padrão?', 'Repetir 3× [Andar, Pular].'],
      solution: [repeat(3, [cmd('walk'), cmd('jump')])],
    },
  ],
};
