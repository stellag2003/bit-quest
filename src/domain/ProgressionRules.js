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

  /**
   * The step right after `challengeId` in map order, if it is open: the next
   * challenge of the fase, or — when the fase is over — the next fase's lesson.
   * A new fase always starts with its lesson (even on a replay), so the child
   * gets the context before the challenges. Null when nothing is open.
   */
  stepAfter(progress, challengeId) {
    const { fase, index } = this.curriculum.findChallenge(challengeId);
    const sibling = fase.challenges[index + 1];
    if (sibling) {
      return this.challengeStatus(progress, sibling.id) === NodeStatus.LOCKED ? null : { type: 'challenge', faseId: fase.id, challengeId: sibling.id };
    }
    const nextFase = this.curriculum.fases[this.curriculum.faseIndex(fase.id) + 1];
    if (!nextFase) return null;
    if (this.lessonStatus(progress, nextFase.id) === NodeStatus.LOCKED) return null;
    return { type: 'lesson', faseId: nextFase.id };
  }

  totalStars(progress) {
    return Object.values(progress.stars).reduce((sum, s) => sum + s, 0);
  }

  completedChallenges(progress) {
    return this.curriculum.allChallenges.filter((c) => (progress.stars[c.id] ?? 0) > 0).length;
  }
}
