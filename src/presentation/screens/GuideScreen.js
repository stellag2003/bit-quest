import { Screen } from '../Screen.js';
import { spriteCanvas } from '../pixel/draw.js';
import { icon } from '../pixel/icons.js';
import { t } from '../i18n/index.js';
import { portraitCanvas } from '../pixel/portrait.js';
import { ROBOT } from '../pixel/sprites.js';
import { h } from '../ui/dom.js';

/** "Como jogar": paged tour of every feature. Shown once after boot, then from the "?" on home. */
export class GuideScreen extends Screen {
  get legend() {
    return [['A', t('legend.next')], ['◀▶', t('legend.pages')], ['B', t('legend.exit')]];
  }

  render() {
    this.slides = this.ctx.game.content.guide;
    this.index = 0;
    this.page = h('div', { class: 'guide__page', 'aria-live': 'polite' });
    this.dots = h('div', { class: 'lesson__dots', 'aria-hidden': 'true' });
    this.prevBtn = h('button', { class: 'pbtn', type: 'button', onClick: () => this.prev() }, icon('back'), t('guide.prev'));
    this.nextBtn = h('button', { class: 'pbtn pbtn--primary', type: 'button', 'data-autofocus': '', onClick: () => this.next() });

    this.root.append(
      h('header', { class: 'topbar' },
        h('button', { class: 'iconbtn', type: 'button', 'aria-label': t('guide.close'), onClick: () => this.finish() }, icon('close')),
        h('h1', { class: 'topbar__title' }, t('guide.title')),
        h('button', { class: 'pbtn guide__skip', type: 'button', onClick: () => this.finish() }, t('guide.skip'))),
      this.page,
      h('footer', { class: 'lesson__foot' }, this.prevBtn, this.dots, this.nextBtn),
    );
    this.show();
  }

  show() {
    const slide = this.slides[this.index];
    const last = this.index === this.slides.length - 1;
    this.prevBtn.disabled = this.index === 0;
    this.nextBtn.replaceChildren(...(last ? [icon('play'), t('guide.start')] : [t('guide.next')]));
    this.dots.replaceChildren(...this.slides.map((_, i) => h('span', { class: i === this.index ? 'is-on' : '' })));
    this.page.replaceChildren(
      h('p', { class: 'guide__count' }, t('guide.count', { n: this.index + 1, total: this.slides.length })),
      ...(slide.robot ? [this.robot()] : []),
      h('h2', { class: 'guide__title' }, slide.title),
      h('p', { class: 'guide__text' }, slide.text),
      h('ul', { class: 'guide__items' }, slide.items.map(([iconName, label, detail]) => h('li', { class: 'guide__item panel' },
        iconName === 'key' ? h('b', { class: 'guide__key' }, label) : [icon(iconName, 'guide__icon'), h('strong', {}, label)],
        h('span', {}, detail)))),
    );
    this.page.scrollTop = 0;
  }

  robot() {
    const robot = spriteCanvas(ROBOT.S[0], this.ctx.theme.colors, 4);
    robot.classList.add('guide__robot');
    const heroArt = portraitCanvas('hero', { scale: 2 });
    heroArt.classList.add('guide__robot');
    const hero = h('figure', { class: 'home__mary' }, heroArt, h('figcaption', {}, this.ctx.game.content.hero.name));
    return h('div', { class: 'guide__duo', 'aria-hidden': 'true' }, hero, robot);
  }

  next() {
    if (this.index === this.slides.length - 1) return this.finish();
    this.index += 1;
    this.ctx.sfx('lesson');
    this.show();
  }

  prev() {
    if (this.index === 0) return;
    this.index -= 1;
    this.show();
  }

  finish() {
    this.ctx.game.updateSettings.execute({ guideSeen: true });
    this.ctx.nav.go('home');
  }

  onDirection(direction) {
    if (direction === 'right') this.next();
    else if (direction === 'left') this.prev();
    else return false;
    return true;
  }

  onStart() {
    this.next();
  }

  onBack() {
    this.finish();
  }
}
