import { ENERGY_MAX, currentEnergy, msUntilNextEnergy } from '../domain/energy.js';
import { levelFromXp } from '../domain/scoring.js';
import { dayKey, visibleStreak } from '../domain/streak.js';

/** Read models for the screens. They never change state. */
export class PlayerSummaryQuery {
  constructor({ store, rules, curriculum, clock, mentors }) {
    Object.assign(this, { store, rules, curriculum, clock, mentors });
  }

  execute() {
    const p = this.store.get();
    const now = this.clock.now();
    const energy = currentEnergy(p.energy, now);
    return {
      xp: p.xp,
      ...levelFromXp(p.xp),
      coins: p.coins,
      energy: { value: energy.value, max: ENERGY_MAX, msUntilNext: msUntilNextEnergy(p.energy, now) },
      streak: visibleStreak(p.streak, dayKey(now)),
      mentor: this.mentors.find((m) => m.id === p.currentMentor) ?? this.mentors[0],
      completedChallenges: this.rules.completedChallenges(p),
      totalChallenges: this.curriculum.allChallenges.length,
      stars: this.rules.totalStars(p),
      maxStars: this.curriculum.maxStars,
      settings: { ...p.settings },
      palettes: structuredClone(p.palettes),
      unlockedMentors: [...p.unlockedMentors],
      achievements: [...p.achievements],
      lessonsDone: [...p.lessonsDone],
    };
  }
}

export class MapOverviewQuery {
  constructor({ store, rules, curriculum }) {
    Object.assign(this, { store, rules, curriculum });
  }

  execute() {
    const p = this.store.get();
    const fases = this.curriculum.fases.map((fase, i) => {
      const previous = this.curriculum.fases[i - 1];
      return {
        id: fase.id,
        number: fase.number,
        title: fase.title,
        mentorId: fase.mentorId,
        scenery: fase.scenery,
        unlocked: this.rules.isFaseUnlocked(p, fase.id),
        completed: p.completedFases.includes(fase.id),
        lockedHint: previous ? `Complete a fase ${previous.title} para abrir` : '',
        lesson: { status: this.rules.lessonStatus(p, fase.id) },
        challenges: fase.challenges.map((c, index) => ({
          id: c.id,
          number: index + 1,
          title: c.title,
          status: this.rules.challengeStatus(p, c.id),
          stars: p.stars[c.id] ?? 0,
        })),
      };
    });
    return { fases, next: this.rules.nextStep(p) };
  }
}
