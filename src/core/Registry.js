/**
 * Keyed collection of pluggable behaviours (commands, sensors, runners).
 * New entries can be registered without touching the code that consumes them.
 */
export class Registry {
  constructor(kind) {
    this.kind = kind;
    this.items = new Map();
  }

  register(item) {
    if (!item || typeof item.id !== 'string') throw new Error(`${this.kind}: item sem id`);
    if (this.items.has(item.id)) throw new Error(`${this.kind}: "${item.id}" já registrado`);
    this.items.set(item.id, item);
    return this;
  }

  has(id) {
    return this.items.has(id);
  }

  get(id) {
    const item = this.items.get(id);
    if (!item) throw new Error(`${this.kind} desconhecido: "${id}"`);
    return item;
  }

  ids() {
    return [...this.items.keys()];
  }
}
