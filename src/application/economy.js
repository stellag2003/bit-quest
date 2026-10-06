import { ENERGY_MAX, currentEnergy, fullEnergy } from '../domain/energy.js';

export class RefillEnergy {
  constructor({ store, clock, price, bus }) {
    Object.assign(this, { store, clock, price, bus });
  }

  execute() {
    const now = this.clock.now();
    const progress = this.store.get();
    if (currentEnergy(progress.energy, now).value >= ENERGY_MAX) return { ok: false, reason: 'full' };
    if (progress.coins < this.price) return { ok: false, reason: 'coins' };
    this.store.update((p) => {
      p.coins -= this.price;
      p.energy = fullEnergy(now);
    });
    this.bus.emit('energy:refilled', {});
    return { ok: true };
  }
}

export class PurchasePalette {
  constructor({ store, palettes, bus }) {
    Object.assign(this, { store, palettes, bus });
  }

  execute(paletteId) {
    const palette = this.palettes.find((p) => p.id === paletteId);
    if (!palette) throw new Error(`Paleta desconhecida: ${paletteId}`);
    const progress = this.store.get();
    if (progress.palettes.owned.includes(paletteId)) return { ok: false, reason: 'owned' };
    if (progress.coins < palette.price) return { ok: false, reason: 'coins', missing: palette.price - progress.coins };
    this.store.update((p) => {
      p.coins -= palette.price;
      p.palettes.owned.push(paletteId);
      p.palettes.current = paletteId;
    });
    this.bus.emit('item:purchased', { paletteId });
    return { ok: true };
  }
}

export class SelectPalette {
  constructor({ store }) {
    this.store = store;
  }

  execute(paletteId) {
    if (!this.store.get().palettes.owned.includes(paletteId)) throw new Error('Paleta não comprada');
    this.store.update((p) => void (p.palettes.current = paletteId));
  }
}
