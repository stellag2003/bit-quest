/**
 * Minimal publish/subscribe channel. Lets rules announce what happened
 * (xp earned, mentor unlocked...) without knowing who reacts (audio, UI).
 */
export class EventBus {
  constructor() {
    this.handlers = new Map();
  }

  on(type, handler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type).add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }

  emit(type, payload) {
    for (const handler of this.handlers.get(type) ?? []) {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[EventBus] handler for "${type}" failed`, error);
      }
    }
  }
}
