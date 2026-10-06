import { Modal } from './components/Modal.js';

/**
 * Base contract for every screen. The App and the InputController only talk
 * to screens through this interface (mount/unmount + hardware-button hooks).
 */
export class Screen {
  constructor(ctx) {
    this.ctx = ctx;
    this.cleanups = [];
    this.modal = null;
  }

  mount(root, params = {}) {
    this.root = root;
    this.params = params;
    this.render();
  }

  render() {}

  unmount() {
    this.cleanups.splice(0).forEach((fn) => fn());
  }

  track(cleanup) {
    this.cleanups.push(cleanup);
    return cleanup;
  }

  later(fn, ms) {
    const id = setTimeout(fn, ms);
    this.track(() => clearTimeout(id));
  }

  every(fn, ms) {
    const id = setInterval(fn, ms);
    this.track(() => clearInterval(id));
  }

  async ask(options) {
    this.modal?.close(null);
    this.modal = new Modal(options);
    const value = await this.modal.open(this.root);
    this.modal = null;
    return value;
  }

  /** Background song for this screen (null = silence). */
  get music() {
    return 'theme';
  }

  /** Legend printed under the LCD: [[button, action], ...]. */
  get legend() {
    return [['A', 'escolher'], ['B', 'voltar']];
  }

  handleBack() {
    if (this.modal) return this.modal.close(null);
    return this.onBack();
  }

  onBack() {
    this.ctx.nav.go('home');
  }

  onStart() {}

  onSelect() {}
}
