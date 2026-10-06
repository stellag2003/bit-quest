import { icon } from '../pixel/icons.js';
import { h } from '../ui/dom.js';

/**
 * In-screen dialog. Resolves with the chosen action value (or null on close).
 * `actions`: [{ label, value, primary, icon }]
 */
export class Modal {
  constructor({ title, body, actions, iconName, variant = '' }) {
    this.done = new Promise((resolve) => (this.resolve = resolve));
    const buttons = actions.map((action) => h('button', {
      class: `pbtn ${action.primary ? 'pbtn--primary' : ''}`,
      type: 'button',
      'data-autofocus': action.primary ? '' : null,
      onClick: () => this.close(action.value),
    }, action.icon ? icon(action.icon) : null, action.label));

    this.el = h('div', { class: `modal ${variant}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': title },
      h('div', { class: 'modal__panel panel' },
        iconName ? h('div', { class: 'modal__icon' }, icon(iconName)) : null,
        h('h2', { class: 'modal__title' }, title),
        body ? h('div', { class: 'modal__body' }, body) : null,
        h('div', { class: 'modal__actions' }, buttons)));
  }

  open(root) {
    root.append(this.el);
    (this.el.querySelector('[data-autofocus]') ?? this.el.querySelector('button'))?.focus({ preventScroll: true });
    return this.done;
  }

  close(value = null) {
    this.el.remove();
    this.resolve(value);
  }
}
