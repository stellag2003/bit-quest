/** Medals. `ctx` = { failuresBeforeSuccess, totalMentors, maxStars, totalStars }. */
export const ACHIEVEMENTS = [
  {
    id: 'first-program',
    title: 'Primeiro programa',
    description: 'Conclua seu primeiro desafio.',
    icon: 'check',
    test: (p) => Object.keys(p.stars).length >= 1,
  },
  {
    id: 'flawless',
    title: 'De primeira!',
    description: 'Ganhe 3 estrelas em um desafio.',
    icon: 'star',
    test: (p) => Object.values(p.stars).some((s) => s === 3),
  },
  {
    id: 'debugger',
    title: 'Caçador de bugs',
    description: 'Conserte um programa depois de errar.',
    icon: 'bug',
    test: (p, ctx) => (ctx?.failuresBeforeSuccess ?? 0) > 0,
  },
  {
    id: 'loop-master',
    title: 'Mestre dos loops',
    description: 'Complete a fase Repetição.',
    icon: 'repeat',
    test: (p) => p.completedFases.includes('f3'),
  },
  {
    id: 'streak-3',
    title: 'Três dias seguidos',
    description: 'Jogue 3 dias em sequência.',
    icon: 'flame',
    test: (p) => p.streak.count >= 3,
  },
  {
    id: 'all-mentors',
    title: 'Sala dos mentores',
    description: 'Desbloqueie todos os mentores.',
    icon: 'person',
    test: (p, ctx) => p.unlockedMentors.length >= (ctx?.totalMentors ?? Infinity),
  },
  {
    id: 'star-sky',
    title: 'Céu estrelado',
    description: 'Junte todas as estrelas do jogo.',
    icon: 'trophy',
    test: (p, ctx) => (ctx?.totalStars ?? 0) >= (ctx?.maxStars ?? Infinity),
  },
];
