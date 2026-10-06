/** Persists progress in LocalStorage; tolerant to corrupted saves and blocked storage. */
export class LocalStorageRepository {
  constructor(key = 'bitquest.save.v1', storage = globalThis.localStorage) {
    this.key = key;
    this.storage = storage;
  }

  static isAvailable(storage = globalThis.localStorage) {
    try {
      const probe = '__bitquest_probe__';
      storage.setItem(probe, '1');
      storage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  }

  load() {
    try {
      const raw = this.storage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('[save] ignorando save inválido', error);
      return null;
    }
  }

  save(progress) {
    try {
      this.storage.setItem(this.key, JSON.stringify(progress));
    } catch (error) {
      console.warn('[save] não foi possível salvar', error);
    }
  }
}
