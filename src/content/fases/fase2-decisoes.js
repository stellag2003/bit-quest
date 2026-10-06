import { rule } from '../../domain/program.js';

/** SPEC-003 — Fase 2: Decisões (SE / ENTÃO). */
const RULE_PALETTE = { sensors: ['rockAhead', 'wallAhead'], actions: ['jump', 'turnLeft', 'turnRight'] };

export const fase2 = {
  id: 'f2',
  number: 2,
  title: 'Decisões',
  mentorId: 'grace',
  scenery: 'canyon',
  reward: { mentorId: 'turing' },
  concept: {
    title: 'Condição',
    summary: 'SE algo acontecer, ENTÃO faça uma ação. Assim o programa decide sozinho o que fazer.',
    example: [rule('rockAhead', 'jump')],
  },
  lesson: [
    { text: 'Olá, sou a Grace! Agora o Bit anda sozinho... mas o caminho tem surpresas.' },
    {
      text: 'Programas tomam decisões. SE tiver pedra à frente, ENTÃO o Bit pula.',
      demo: {
        kind: 'rules',
        map: ['########', '>..R..RG', '########'],
        program: [rule('rockAhead', 'jump')],
      },
    },
    { text: 'Quando nenhuma regra combina, o Bit simplesmente anda para a frente.' },
  ],
  challenges: [
    {
      id: 'f2-c1',
      title: 'Pule as pedras',
      kind: 'rules',
      goal: 'Crie uma regra para passar pelas pedras.',
      ...RULE_PALETTE,
      ruleSlots: 1,
      maps: [['.........', '#########', '#>.R..R.G', '#########', '.........']],
      optimalBlocks: 1,
      hints: ['Escolha o SE: o que o Bit vê à frente?', 'SE pedra à frente, ENTÃO pular.'],
      solution: [rule('rockAhead', 'jump')],
    },
    {
      id: 'f2-c2',
      title: 'Desvie das paredes',
      kind: 'rules',
      goal: 'Ensine o Bit a fazer as curvas sozinho.',
      ...RULE_PALETTE,
      ruleSlots: 1,
      maps: [['#######', '#>...##', '####.##', '####.##', '#G...##', '#######']],
      optimalBlocks: 1,
      hints: ['O que fazer quando aparecer uma parede?', 'Olhe para onde o caminho segue: a curva é para a direita.'],
      solution: [rule('wallAhead', 'turnRight')],
    },
    {
      id: 'f2-c3',
      title: 'Dois mapas',
      kind: 'rules',
      goal: 'As mesmas regras precisam vencer os 2 mapas.',
      ...RULE_PALETTE,
      ruleSlots: 2,
      maps: [
        ['#######', '#>.R.##', '####.##', '####R##', '####.##', '#G.R.##', '#######'],
        ['#######', '#>..R.#', '#####.#', '#####.#', '#G.R..#', '#######'],
      ],
      optimalBlocks: 2,
      hints: ['Você vai precisar de duas regras: uma para pedras e outra para paredes.', 'SE pedra → pular. SE parede → virar para a direita.'],
      solution: [rule('rockAhead', 'jump'), rule('wallAhead', 'turnRight')],
    },
  ],
};
