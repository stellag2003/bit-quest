import { icon } from '../pixel/icons.js';
import { h } from '../ui/dom.js';

/** Small banners at the top of the screen, shown one at a time. */
export class Toaster {
  constructor(layer) {
    this.layer = layer;
    this.queue = [];
    this.showing = false;
  }

  show({ title, text = '', iconName = 'star', duration = 2200 }) {
    this.queue.push({ title, text, iconName, duration });
    if (!this.showing) this.next();
  }

  next() {
    const item = this.queue.shift();
    if (!item) {
      this.showing = false;
      return;
    }
    this.showing = true;
    const el = h('div', { class: 'toast', role: 'status' },
      icon(item.iconName, 'toast__icon'),
      h('div', {}, h('strong', {}, item.title), item.text ? h('span', {}, item.text) : null));
    this.layer.append(el);
    setTimeout(() => {
      el.classList.add('is-leaving');
      setTimeout(() => {
        el.remove();
        this.next();
      }, 220);
    }, item.duration);
  }
}
