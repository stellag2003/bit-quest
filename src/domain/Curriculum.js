/** Ordered list of fases; answers "where does this challenge live?". */
export class Curriculum {
  constructor(fases) {
    const ids = new Set();
    for (const fase of fases) {
      for (const id of [fase.id, ...fase.challenges.map((c) => c.id)]) {
        if (ids.has(id)) throw new Error(`Curriculum: id repetido "${id}"`);
        ids.add(id);
      }
    }
    this.fases = Object.freeze([...fases]);
  }

  fase(id) {
    const fase = this.fases.find((f) => f.id === id);
    if (!fase) throw new Error(`Fase desconhecida: ${id}`);
    return fase;
  }

  faseIndex(id) {
    return this.fases.findIndex((f) => f.id === id);
  }

  findChallenge(challengeId) {
    for (const fase of this.fases) {
      const index = fase.challenges.findIndex((c) => c.id === challengeId);
      if (index >= 0) return { fase, challenge: fase.challenges[index], index };
    }
    throw new Error(`Desafio desconhecido: ${challengeId}`);
  }

  get allChallenges() {
    return this.fases.flatMap((f) => f.challenges);
  }

  get maxStars() {
    return this.allChallenges.length * 3;
  }
}
