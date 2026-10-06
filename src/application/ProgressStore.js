/**
 * Single owner of the player's progress. Persists through an injected
 * repository (`load()` / `save(progress)`) so storage can be swapped.
 */
export class ProgressStore {
  constructor({ repository, clock, createInitial, migrate }) {
    this.repository = repository;
    this.clock = clock;
    this.createInitial = createInitial;
    this.migrate = migrate;
    this.listeners = new Set();
    this.state = this.load();
  }

  load() {
    const saved = this.repository.load();
    return saved ? this.migrate(saved, this.clock.now()) : this.createInitial(this.clock.now());
  }

  get() {
    return this.state;
  }

  /** `mutator` receives a deep copy it may change in place; the copy becomes the new state. */
  update(mutator) {
    const draft = structuredClone(this.state);
    this.state = mutator(draft) ?? draft;
    this.repository.save(this.state);
    this.listeners.forEach((listener) => listener(this.state));
    return this.state;
  }

  reset() {
    return this.update(() => this.createInitial(this.clock.now()));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
