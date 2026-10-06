import { h } from './ui/dom.js';

/** Screen router living inside the LCD. */
export class App {
  constructor({ screenLayer, legendEl, screens, bus, input }) {
    Object.assign(this, { screenLayer, legendEl, screens, bus, input });
    this.current = null;
    this.ctx = null;
  }

  setContext(ctx) {
    this.ctx = ctx;
  }

  go(name, params = {}) {
    const ScreenClass = this.screens[name];
    if (!ScreenClass) throw new Error(`Tela desconhecida: ${name}`);
    this.current?.unmount();

    const root = h('div', { class: `scr scr--${name}` });
    this.screenLayer.replaceChildren(root);
    const screen = new ScreenClass(this.ctx);
    this.current = screen;
    this.currentName = name;
    this.currentParams = params;
    screen.mount(root, params);

    this.input.setScreen(screen, root);
    this.renderLegend(screen.legend);
    this.bus.emit('screen:changed', { name, music: screen.music });
    requestAnimationFrame(() => root.querySelector('[data-autofocus]')?.focus({ preventScroll: true }));
  }

  refresh() {
    if (this.currentName) this.go(this.currentName, this.currentParams);
  }

  renderLegend(items) {
    this.legendEl.replaceChildren(...items.map(([button, action]) =>
      h('span', { class: 'legend__item' }, h('b', { class: `legend__key legend__key--${button.toLowerCase()}` }, button), action)));
  }
}
