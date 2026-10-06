/** Unlock rules of the learning map (SPEC-005). Read-only over a progress object. */
export const NodeStatus = Object.freeze({ LOCKED: 'locked', AVAILABLE: 'available', COMPLETED: 'completed' });

export class ProgressionRules {
  constructor(curriculum) {
    this.curriculum = curriculum;
  }

  isFaseUnlocked(progress, faseId) {
    const index = this.curriculum.faseIndex(faseId);
    return index === 0 || progress.completedFases.includes(this.curriculum.fases[index - 1].id);
  }

  isFaseCompleted(progress, faseId) {
    return this.curriculum.fase(faseId).challenges.every((c) => (progress.stars[c.id] ?? 0) > 0);
  }

  lessonStatus(progress, faseId) {
    if (!this.isFaseUnlocked(progress, faseId)) return NodeStatus.LOCKED;
    return progress.lessonsDone.includes(faseId) ? NodeStatus.COMPLETED : NodeStatus.AVAILABLE;
  }

  challengeStatus(progress, challengeId) {
    const { fase, index } = this.curriculum.findChallenge(challengeId);
    if (this.lessonStatus(progress, fase.id) !== NodeStatus.COMPLETED) return NodeStatus.LOCKED;
    if ((progress.stars[challengeId] ?? 0) > 0) return NodeStatus.COMPLETED;
    const previous = fase.challenges[index - 1];
    return !previous || (progress.stars[previous.id] ?? 0) > 0 ? NodeStatus.AVAILABLE : NodeStatus.LOCKED;
  }

  /** First thing the player has not done yet, or null when everything is complete. */
  nextStep(progress) {
    for (const fase of this.curriculum.fases) {
      if (!this.isFaseUnlocked(progress, fase.id)) return null;
      if (this.lessonStatus(progress, fase.id) === NodeStatus.AVAILABLE) return { type: 'lesson', faseId: fase.id };
      const challenge = fase.challenges.find((c) => this.challengeStatus(progress, c.id) === NodeStatus.AVAILABLE);
      if (challenge) return { type: 'challenge', faseId: fase.id, challengeId: challenge.id };
    }
    return null;
  }

  totalStars(progress) {
    return Object.values(progress.stars).reduce((sum, s) => sum + s, 0);
  }

  completedChallenges(progress) {
    return this.curriculum.allChallenges.filter((c) => (progress.stars[c.id] ?? 0) > 0).length;
  }
}
