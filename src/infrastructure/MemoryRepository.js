/** In-memory progress repository (tests, or when LocalStorage is unavailable). */
export class MemoryRepository {
  constructor(initial = null) {
    this.data = initial ? structuredClone(initial) : null;
  }

  load() {
    return this.data ? structuredClone(this.data) : null;
  }

  save(progress) {
    this.data = structuredClone(progress);
  }
}
