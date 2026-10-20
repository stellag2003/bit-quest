import { Screen } from '../Screen.js';
import { finaleDue } from './FinaleScreen.js';
import { goToStep } from './navigation.js';
import { spritePixels } from '../pixel/draw.js';
import { PORTRAIT_SIZE } from '../pixel/portraits.js';
import { hasPortrait, portraitPixels } from '../pixel/portrait.js';
import { icon } from '../pixel/icons.js';
import { t } from '../i18n/index.js';
import { MENTOR_SPRITES } from '../pixel/sprites.js';
import { h, reducedMotion, sleep, tween } from '../ui/dom.js';
import { mentorCard } from './mentorCard.js';

const FRAME = 96;

/** SPEC-006: silhouette → pixels appear in random order → name and story. */
export class MentorUnlockScreen extends Screen {
  get music() {
    return null;
  }

  get legend() {
    return [['A', t('legend.choose')], ['B', t('legend.map')]];
  }

  render() {
    const { game } = this.ctx;
    this.mentor = game.content.mentors.find((m) => m.id === this.params.mentorId);
    this.canvas = h('canvas', { class: 'portrait unlock__portrait', width: FRAME, height: FRAME, role: 'img', 'aria-label': t('mentor.portraitOf', { name: this.mentor.name }) });
    this.details = h('div', { class: 'unlock__details' });

    this.root.append(
      h('p', { class: 'unlock__kicker' }, t('mentor.unlocked')),
      h('div', { class: 'unlock__frame' }, this.canvas),
      this.details,
    );
    this.reveal();
  }

  async reveal() {
    const { theme } = this.ctx;
    const { id } = this.mentor;
    // Both kinds of art become a list of [x, y, color] pixels: 32×32 portraits or 16×16 LCD sprites.
    const art = hasPortrait(id)
      ? { size: PORTRAIT_SIZE, pixels: await portraitPixels(id), color: (c) => c }
      : { size: 16, pixels: spritePixels(MENTOR_SPRITES[id]), color: (c) => theme.colors[c] };
    const ctx = this.canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.scale(FRAME / art.size, FRAME / art.size);
    const paint = (pixels, tone = null) => pixels.forEach(([x, y, c]) => {
      ctx.fillStyle = tone ?? art.color(c);
      ctx.fillRect(x, y, 1, 1);
    });
    paint(art.pixels, theme.colors[1]);

    if (!reducedMotion()) {
      await sleep(700);
      this.ctx.sfx('unlock');
      const pixels = [...art.pixels].sort(() => Math.random() - 0.5);
      let drawn = 0;
      await tween(1100, (progress) => {
        const target = Math.round(pixels.length * progress);
        paint(pixels.slice(drawn, target));
        drawn = target;
      });
    } else {
      this.ctx.sfx('unlock');
    }
    ctx.clearRect(0, 0, art.size, art.size);
    paint(art.pixels);
    this.root.classList.add('is-revealed');
    this.showDetails();
  }

  showDetails() {
    if (!this.root.isConnected) return;
    const { game } = this.ctx;
    this.details.append(
      mentorCard(this.mentor),
      h('div', { class: 'unlock__actions' },
        h('button', {
          class: 'pbtn',
          type: 'button',
          onClick: () => {
            game.selectMentor.execute(this.mentor.id);
            this.ctx.toast.show({ title: t('mentor.nowGuide', { name: this.mentor.name }), iconName: 'person' });
          },
        }, icon('person'), t('mentor.choose')),
        h('button', { class: 'pbtn pbtn--primary', type: 'button', onClick: () => this.onBack() }, t('mentor.continue'))),
    );
    this.details.querySelector('.pbtn--primary').focus({ preventScroll: true });
  }

  onBack() {
    if (finaleDue(this.ctx.game)) return this.ctx.nav.go('finale');
    goToStep(this.ctx.nav, this.params.next);
  }
}
