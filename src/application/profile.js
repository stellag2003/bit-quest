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
