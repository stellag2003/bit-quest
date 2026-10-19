export class SelectMentor {
  constructor({ store }) {
    this.store = store;
  }

  execute(mentorId) {
    if (!this.store.get().unlockedMentors.includes(mentorId)) throw new Error('Mentor ainda bloqueado');
    this.store.update((p) => void (p.currentMentor = mentorId));
  }
}

export class UpdateSettings {
  constructor({ store }) {
    this.store = store;
  }

  execute(changes) {
    this.store.update((p) => void Object.assign(p.settings, changes));
  }
}

/** The end-of-game celebration: shown once, remembers when and the name on the certificate. */
export class CompleteGame {
  constructor({ store, clock }) {
    Object.assign(this, { store, clock });
  }

  execute() {
    this.store.update((p) => {
      p.finale.seen = true;
      p.finale.completedAt ??= this.clock.now();
    });
  }
}

export class SetCertificateName {
  constructor({ store }) {
    this.store = store;
  }

  execute(name) {
    const clean = String(name ?? '').replace(/\s+/g, ' ').trim().slice(0, 24);
    this.store.update((p) => void (p.finale.name = clean));
    return clean;
  }
}

export class ResetProgress {
  constructor({ store, bus }) {
    Object.assign(this, { store, bus });
  }

  execute() {
    const { settings } = this.store.get();
    this.store.reset();
    this.store.update((p) => void (p.settings = settings));
    this.bus.emit('progress:reset', {});
  }
}
