import { newlyUnlockedAchievements } from '../domain/achievements.js';
import { currentEnergy, gainEnergy, msUntilNextEnergy, spendEnergy } from '../domain/energy.js';
import { applyDifficulty, findDifficulty } from '../domain/difficulty.js';
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

/** The player's difficulty level (settings.difficulty), with the default before they choose. */
export class CurrentDifficulty {
  constructor({ store, difficulties, defaultId }) {
    Object.assign(this, { store, difficulties, defaultId });
  }

  execute() {
    return findDifficulty(this.difficulties, this.store.get().settings.difficulty, this.defaultId);
  }
}

export class StartChallenge {
  constructor({ store, curriculum, rules, submitProgram, currentDifficulty, hintBook }) {
    Object.assign(this, { store, curriculum, rules, submitProgram, currentDifficulty, hintBook });
  }

  execute(challengeId) {
    if (this.rules.challengeStatus(this.store.get(), challengeId) === NodeStatus.LOCKED) {
      throw new Error('Desafio bloqueado');
    }
    const { fase, challenge, index } = this.curriculum.findChallenge(challengeId);
    const difficulty = this.currentDifficulty.execute();
    return new ChallengeSession({ fase, challenge: applyDifficulty(challenge, difficulty), index, difficulty, submitProgram: this.submitProgram, hintBook: this.hintBook });
  }
}

/**
 * Runs the program, then applies consequences: energy on failure;
 * stars, XP, coins, streak, fase completion, mentor and medals on success.
 * How much each of those weighs comes from the current difficulty.
 */
export class SubmitProgram {
  constructor({ store, curriculum, rules, evaluator, clock, bus, achievements, mentorCount, currentDifficulty }) {
    Object.assign(this, { store, curriculum, rules, evaluator, clock, bus, achievements, mentorCount, currentDifficulty });
  }

  execute({ challengeId, program, failuresSoFar = 0 }) {
    const now = this.clock.now();
    const difficulty = this.currentDifficulty.execute();
    const { fase, challenge: base } = this.curriculum.findChallenge(challengeId);
    const challenge = applyDifficulty(base, difficulty);
    const energy = currentEnergy(this.store.get().energy, now);
    const usesEnergy = difficulty.energy.onFailure || difficulty.energy.onSetupError;
    if (usesEnergy && energy.value <= 0) return { status: 'no_energy', msUntilNext: msUntilNextEnergy(energy, now) };

    const evaluation = this.evaluator.evaluate(challenge, program);
    if (!evaluation.success) return this.applyFailure(evaluation, energy, now, difficulty);
    return this.applySuccess({ fase, challenge, evaluation, failuresSoFar, now, difficulty });
  }

  /** `executed`: Bit actually ran and went wrong (counts against stars). Setup errors never ran. */
  applyFailure(evaluation, energy, now, difficulty) {
    const executed = evaluation.failure.stepIndex >= 0;
    const energyLost = executed ? difficulty.energy.onFailure : difficulty.energy.onSetupError;
    this.store.update((p) => {
      p.energy = energyLost ? spendEnergy(energy, now) : energy;
      p.stats.runs += 1;
      if (executed) p.stats.failures += 1;
    });
    this.bus.emit('run:failed', { code: evaluation.failure.code, energyLost });
    return { status: 'failed', evaluation, energyLost, executed };
  }

  applySuccess({ fase, challenge, evaluation, failuresSoFar, now, difficulty }) {
    const before = this.store.get();
    const stars = computeStars({ failures: failuresSoFar, blocksUsed: evaluation.blocksUsed, optimalBlocks: challenge.optimalBlocks }, difficulty.stars);
    const previousStars = before.stars[challenge.id] ?? 0;
    const reward = challengeReward({ stars, previousStars, multiplier: difficulty.reward });
    const faseWasComplete = before.completedFases.includes(fase.id);
    let faseCompleted = false;
    let mentorUnlocked = null;

    this.store.update((p) => {
      p.stars[challenge.id] = Math.max(previousStars, stars);
      p.xp += reward.xp;
      p.coins += reward.coins;
      if (difficulty.energy.refundOnWin) p.energy = gainEnergy(p.energy, now, difficulty.energy.refundOnWin);
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
