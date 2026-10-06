import { newlyUnlockedAchievements } from '../domain/achievements.js';
import { currentEnergy, gainEnergy, msUntilNextEnergy, spendEnergy } from '../domain/energy.js';
import { NodeStatus } from '../domain/ProgressionRules.js';
import { REWARDS, challengeReward, computeStars, levelFromXp } from '../domain/scoring.js';
import { dayKey, registerActivity } from '../domain/streak.js';
import { ChallengeSession } from './ChallengeSession.js';

export class CompleteLesson {
  constructor({ store, rules, bus }) {
    Object.assign(this, { store, rules, bus });
  }

  execute(faseId) {
    if (this.rules.lessonStatus(this.store.get(), faseId) === NodeStatus.LOCKED) throw new Error('Lição bloqueada');
    this.store.update((p) => {
      if (!p.lessonsDone.includes(faseId)) p.lessonsDone.push(faseId);
    });
    this.bus.emit('lesson:completed', { faseId });
    return this.rules.nextStep(this.store.get());
  }
}

export class StartChallenge {
  constructor({ store, curriculum, rules, submitProgram }) {
    Object.assign(this, { store, curriculum, rules, submitProgram });
  }

  execute(challengeId) {
    if (this.rules.challengeStatus(this.store.get(), challengeId) === NodeStatus.LOCKED) {
      throw new Error('Desafio bloqueado');
    }
    const { fase, challenge, index } = this.curriculum.findChallenge(challengeId);
    return new ChallengeSession({ fase, challenge, index, submitProgram: this.submitProgram });
  }
}

/**
 * Runs the program, then applies consequences: energy on failure;
 * stars, XP, coins, streak, fase completion, mentor and medals on success.
 */
export class SubmitProgram {
  constructor({ store, curriculum, rules, evaluator, clock, bus, achievements, mentorCount }) {
    Object.assign(this, { store, curriculum, rules, evaluator, clock, bus, achievements, mentorCount });
  }

  execute({ challengeId, program, failuresSoFar = 0 }) {
    const now = this.clock.now();
    const { fase, challenge } = this.curriculum.findChallenge(challengeId);
    const energy = currentEnergy(this.store.get().energy, now);
    if (energy.value <= 0) return { status: 'no_energy', msUntilNext: msUntilNextEnergy(energy, now) };

    const evaluation = this.evaluator.evaluate(challenge, program);
    if (!evaluation.success) return this.applyFailure(evaluation, energy, now);
    return this.applySuccess({ fase, challenge, evaluation, failuresSoFar, now });
  }

  applyFailure(evaluation, energy, now) {
    const energyLost = evaluation.failure.stepIndex >= 0;
    this.store.update((p) => {
      p.energy = energyLost ? spendEnergy(energy, now) : energy;
      p.stats.runs += 1;
      if (energyLost) p.stats.failures += 1;
    });
    this.bus.emit('run:failed', { code: evaluation.failure.code, energyLost });
    return { status: 'failed', evaluation, energyLost };
  }

  applySuccess({ fase, challenge, evaluation, failuresSoFar, now }) {
    const before = this.store.get();
    const stars = computeStars({ failures: failuresSoFar, blocksUsed: evaluation.blocksUsed, optimalBlocks: challenge.optimalBlocks });
    const previousStars = before.stars[challenge.id] ?? 0;
    const reward = challengeReward({ stars, previousStars });
    const faseWasComplete = before.completedFases.includes(fase.id);
    let faseCompleted = false;
    let mentorUnlocked = null;

    this.store.update((p) => {
      p.stars[challenge.id] = Math.max(previousStars, stars);
      p.xp += reward.xp;
      p.coins += reward.coins;
      p.energy = gainEnergy(p.energy, now, 1);
      p.streak = registerActivity(p.streak, dayKey(now));
      p.stats.runs += 1;
      if (!faseWasComplete && this.rules.isFaseCompleted(p, fase.id)) {
        faseCompleted = true;
        p.completedFases.push(fase.id);
        p.xp += REWARDS.faseBonusXp;
        p.coins += REWARDS.faseBonusCoins;
        const mentorId = fase.reward?.mentorId;
        if (mentorId && !p.unlockedMentors.includes(mentorId)) {
          p.unlockedMentors.push(mentorId);
          mentorUnlocked = mentorId;
        }
      }
    });

    const achievements = this.unlockAchievements(failuresSoFar);
    const after = this.store.get();
    const totalXp = after.xp - before.xp;
    const totalCoins = after.coins - before.coins;
    const levelUp = levelFromXp(after.xp).level > levelFromXp(before.xp).level;

    this.bus.emit('challenge:completed', { challengeId: challenge.id, stars });
    if (faseCompleted) this.bus.emit('fase:completed', { faseId: fase.id });
    if (mentorUnlocked) this.bus.emit('mentor:unlocked', { mentorId: mentorUnlocked });
    achievements.forEach((a) => this.bus.emit('achievement:unlocked', { id: a.id }));

    return {
      status: 'success',
      evaluation,
      stars,
      previousStars,
      reward: { xp: totalXp, coins: totalCoins, faseBonus: faseCompleted },
      faseCompleted,
      mentorUnlocked,
      achievements,
      levelUp,
      level: levelFromXp(after.xp).level,
    };
  }

  unlockAchievements(failuresSoFar) {
    const progress = this.store.get();
    const unlocked = newlyUnlockedAchievements(progress, this.achievements, {
      failuresBeforeSuccess: failuresSoFar,
      totalMentors: this.mentorCount,
      totalStars: this.rules.totalStars(progress),
      maxStars: this.curriculum.maxStars,
    });
    if (unlocked.length) this.store.update((p) => void p.achievements.push(...unlocked.map((a) => a.id)));
    return unlocked;
  }
}
