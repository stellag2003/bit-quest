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
    { text: 'Agora o Bit anda sozinho... mas o caminho tem surpresas.' },
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
      nudges: ['O que aparece no caminho e faz o Bit parar?', 'Uma regra diz: SE o Bit vê algo, ENTÃO ele faz alguma coisa. O que ele vê aqui?'],
      solution: [rule('rockAhead', 'jump')],
    },
    {
      id: 'f2-c2',
      title: 'Desvie das paredes',
      kind: 'rules',
      goal: 'Ensine o Bit a fazer as curvas sozinho.',
      // Only walls on this map: no "Pedra à frente" to choose, so it cannot confuse.
      ...RULE_PALETTE,
      sensors: ['wallAhead'],
      ruleSlots: 1,
      maps: [['#######', '#>...##', '####.##', '####.##', '#G...##', '#######']],
      optimalBlocks: 1,
      hints: ['O que fazer quando aparecer uma parede?', 'Olhe para onde o caminho segue: a curva é para a direita.'],
      nudges: ['Siga o caminho com o dedo. O que acontece em cada canto?', 'Em todos os cantos a curva é para o mesmo lado?'],
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
      nudges: ['Compare os dois mapas: que obstáculos aparecem em cada um?', 'Uma regra só não resolve tudo. Quantas situações diferentes existem?'],
      solution: [rule('rockAhead', 'jump'), rule('wallAhead', 'turnRight')],
    },
  ],
};
