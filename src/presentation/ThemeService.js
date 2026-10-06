/** Applies the owned screen palette as CSS variables and exposes it to canvas code. */
export class ThemeService {
  constructor({ palettes, store, bus, root = document.documentElement }) {
    Object.assign(this, { palettes, store, bus, root });
    this.currentId = null;
    this.colors = palettes[0].colors;
  }

  start() {
    this.apply(this.store.get().palettes.current);
    this.store.subscribe((progress) => {
      if (progress.palettes.current === this.currentId) return;
      this.apply(progress.palettes.current);
      this.bus.emit('theme:changed', { id: this.currentId });
    });
  }

  apply(paletteId) {
    const palette = this.palettes.find((p) => p.id === paletteId) ?? this.palettes[0];
    this.currentId = palette.id;
    this.colors = palette.colors;
    palette.colors.forEach((color, i) => this.root.style.setProperty(`--c${i}`, color));
  }
}
