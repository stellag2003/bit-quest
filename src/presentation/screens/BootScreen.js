import { Screen } from '../Screen.js';
import { languagePicker } from '../components/languagePicker.js';
import { icon } from '../pixel/icons.js';
import { t } from '../i18n/index.js';
import { h, reducedMotion } from '../ui/dom.js';

/** Power-on: the first tap unlocks audio, the logo drops in, the chime plays. */
export class BootScreen extends Screen {
  get music() {
    return null;
  }

  get legend() {
    return [['A', t('legend.on')]];
  }

  render() {
    this.logo = h('div', { class: 'boot__logo', 'aria-hidden': 'true' }, 'Bit Quest');
    this.powerBtn = h('button', { class: 'pbtn pbtn--primary boot__power', type: 'button', 'data-autofocus': '', onClick: () => this.powerOn() }, icon('play'), t('boot.on'));
    this.root.append(
      languagePicker(this.ctx, { compact: true }),
      h('h1', { class: 'sr-only' }, 'Bit Quest'),
      this.logo,
      h('div', { class: 'boot__prompt' }, this.powerBtn, h('p', {}, t('boot.tagline'))),
    );
  }

  powerOn() {
    if (this.started) return;
    this.started = true;
    document.body.classList.add('is-powered');
    this.root.classList.add('is-booting');
    const fast = reducedMotion();
    this.later(() => this.ctx.sfx('boot'), fast ? 0 : 1100);
    const next = this.ctx.game.store.get().settings.guideSeen ? 'home' : 'guide';
    this.later(() => this.ctx.nav.go(next), fast ? 400 : 2100);
  }

  onStart() {
    this.powerOn();
  }

  onBack() {}
}
