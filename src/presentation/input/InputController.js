const KEYMAP = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  z: 'a',
  Z: 'a',
  Enter: 'a',
  x: 'b',
  X: 'b',
  Escape: 'b',
  Backspace: 'b',
  ' ': 'start',
  Shift: 'select',
};
const DIRECTIONS = new Set(['up', 'down', 'left', 'right']);

/**
 * Maps the virtual console buttons and the keyboard to screen intents:
 * D-pad → focus movement, A → activate, B → back, START/SELECT → screen hooks.
 */
export class InputController {
  constructor({ buttons, navigator, sfx, onFirstInteraction }) {
    Object.assign(this, { buttons, navigator, sfx, onFirstInteraction });
    this.screen = null;
    this.root = null;
  }

  setScreen(screen, root) {
    this.screen = screen;
    this.root = root;
  }

  attach() {
    for (const [name, el] of Object.entries(this.buttons)) {
      el.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        el.classList.add('is-down');
        this.press(name);
      });
      const release = () => el.classList.remove('is-down');
      el.addEventListener('pointerup', release);
      el.addEventListener('pointerleave', release);
      el.addEventListener('pointercancel', release);
      el.addEventListener('contextmenu', (event) => event.preventDefault());
    }

    window.addEventListener('keydown', (event) => {
      const name = KEYMAP[event.key];
      if (!name || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target.closest?.('input, textarea')) return;
      event.preventDefault();
      if (event.repeat && !DIRECTIONS.has(name)) return;
      this.buttons[name]?.classList.add('is-down');
      setTimeout(() => this.buttons[name]?.classList.remove('is-down'), 120);
      this.press(name, { keyboard: true });
    });

    window.addEventListener('pointerdown', (event) => {
      this.onFirstInteraction?.();
      if (event.target.closest('.console__controls')) return;
      document.body.classList.remove('using-dpad');
      document.querySelectorAll('.is-cursor').forEach((el) => el.classList.remove('is-cursor'));
    }, { capture: true });
  }

  press(name) {
    this.onFirstInteraction?.();
    navigator.vibrate?.(8);
    if (!this.screen) return;
    if (DIRECTIONS.has(name)) {
      this.sfx('move');
      if (this.screen.onDirection?.(name) !== true) this.navigator.move(name, this.root);
      return;
    }
    if (name === 'a') return this.navigator.activate(this.root);
    this.sfx('press');
    if (name === 'b') this.screen.handleBack();
    else if (name === 'start') this.screen.onStart();
    else if (name === 'select') this.screen.onSelect();
  }
}
