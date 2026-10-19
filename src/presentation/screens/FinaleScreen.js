import { Screen } from '../Screen.js';
import { currentLanguage, t } from '../i18n/index.js';
import { spriteCanvas } from '../pixel/draw.js';
import { icon } from '../pixel/icons.js';
import { portraitCanvas } from '../pixel/portrait.js';
import { ROBOT } from '../pixel/sprites.js';
import { h, reducedMotion } from '../ui/dom.js';

/** True right after the last fase is completed, until the celebration has been shown once. */
export function finaleDue(game) {
  const s = game.playerSummary.execute();
  return s.gameCompleted && !s.finale.seen;
}

/**
 * End of the game: confetti and the victory song, a "you learned programming
 * logic" message, a make-believe certificate with the player's name, and an
 * invitation to keep playing (3 stars everywhere, Hard mode).
 */
export class FinaleScreen extends Screen {
  get music() {
    return null;
  }

  get legend() {
    return [['A', t('legend.choose')], ['B', t('legend.back')]];
  }

  render() {
    const { game, theme, bus, sfx } = this.ctx;
    const first = finaleDue(game);
    game.completeGame.execute();
    const s = game.playerSummary.execute();

    const mary = portraitCanvas('hero', { scale: 2 });
    const bit = spriteCanvas(ROBOT.S[0], theme.colors, 4);
    bit.classList.add('finale__bit');
    this.confetti = h('canvas', { class: 'finale__confetti', 'aria-hidden': 'true' });

    this.certificateEl = h('div');
    this.root.append(
      this.confetti,
      h('div', { class: 'finale' },
        h('header', { class: 'finale__hero' },
          h('div', { class: 'finale__duo', 'aria-hidden': 'true' }, mary, bit),
          h('h1', { class: 'finale__title' }, t('finale.title')),
          h('p', { class: 'finale__message' }, t('finale.message')),
          h('p', { class: 'finale__learned' }, t('finale.learned'))),
        this.certificateEl,
        h('section', { class: 'finale__next panel' },
          h('h2', {}, icon('flame'), ` ${t('finale.nextTitle')}`),
          h('p', {}, s.stars >= s.maxStars ? t('finale.allStars') : t('finale.nextText')),
          h('div', { class: 'finale__actions' },
            h('button', { class: 'pbtn pbtn--primary', type: 'button', 'data-autofocus': '', onClick: () => this.goHard() }, icon('flame'), t('finale.goHard')),
            h('button', { class: 'pbtn', type: 'button', onClick: () => this.ctx.nav.go('map') }, icon('star'), t('finale.goStars')),
            h('button', { class: 'pbtn', type: 'button', onClick: () => this.ctx.nav.go('home') }, icon('home'), t('finale.goHome'))))),
    );
    this.renderCertificate();

    if (first) {
      bus.emit('song', 'victory');
      this.later(() => sfx('achievement'), 1400);
    }
    if (!reducedMotion()) this.startConfetti(first ? 260 : 90);
  }

  renderCertificate() {
    const { game } = this.ctx;
    const s = game.playerSummary.execute();
    const name = s.finale.name || t('finale.defaultName');
    const date = new Date(s.finale.completedAt ?? Date.now()).toLocaleDateString(currentLanguage().htmlLang, { day: 'numeric', month: 'long', year: 'numeric' });
    this.nameInput = h('input', {
      class: 'certificate__input',
      type: 'text',
      maxlength: '24',
      value: s.finale.name,
      placeholder: t('finale.namePlaceholder'),
      'aria-label': t('finale.nameLabel'),
      autocomplete: 'off',
      onKeydown: (event) => event.key === 'Enter' && this.saveName(),
    });

    this.certificateEl.replaceChildren(
      h('article', { class: 'certificate', 'aria-label': t('finale.certTitle') },
        h('div', { class: 'certificate__seal', 'aria-hidden': 'true' }, icon('trophy')),
        h('p', { class: 'certificate__kicker' }, t('finale.certTitle')),
        h('h2', { class: 'certificate__title' }, t('finale.certSubtitle')),
        h('p', { class: 'certificate__text' }, t('finale.certText', { name, fases: game.curriculum.fases.length })),
        h('ul', { class: 'certificate__stats' },
          h('li', {}, icon('star'), ` ${t('finale.stars', { n: s.stars, max: s.maxStars })}`),
          h('li', {}, icon('flag'), ` ${t('finale.level', { n: s.level })}`),
          h('li', {}, icon('person'), ` ${t('finale.mentors', { n: s.unlockedMentors.length })}`)),
        h('p', { class: 'certificate__date' }, date),
        h('div', { class: 'certificate__signs' },
          h('span', {}, h('b', { class: 'certificate__sign' }, 'Bit'), t('finale.signBit')),
          h('span', {}, h('b', { class: 'certificate__sign' }, 'Mary'), t('finale.signMary'))),
        h('p', { class: 'certificate__note' }, t('finale.fictional'))),
      h('div', { class: 'certificate__name' },
        h('label', {}, t('finale.nameLabel'), this.nameInput),
        h('button', { class: 'pbtn', type: 'button', onClick: () => this.saveName() }, icon('check'), t('finale.save'))),
    );
  }

  saveName() {
    this.ctx.game.setCertificateName.execute(this.nameInput.value);
    this.ctx.sfx('coin');
    this.renderCertificate();
  }

  goHard() {
    this.ctx.game.updateSettings.execute({ difficulty: 'hard' });
    this.ctx.toast.show({ title: t('difficulty.current', { name: t('difficulty.hard') }), iconName: 'flame' });
    this.ctx.nav.go('map');
  }

  /** Pixel confetti in the screen palette, falling over the celebration. */
  startConfetti(count) {
    const canvas = this.confetti;
    const ctx = canvas.getContext('2d');
    const colors = this.ctx.theme.colors;
    const resize = () => {
      canvas.width = Math.floor(this.root.clientWidth / 3);
      canvas.height = Math.floor(this.root.clientHeight / 3);
    };
    resize();
    let pieces = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: -Math.random() * canvas.height,
      vy: 0.4 + Math.random() * 0.8,
      vx: (Math.random() - 0.5) * 0.4,
      color: colors[i % 3],
      size: 1 + (i % 2),
    }));
    this.every(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces = pieces.filter((p) => p.y < canvas.height + 2);
      for (const p of pieces) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.y / 6) * 0.2;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
    }, 33);
  }

  onBack() {
    this.ctx.nav.go('home');
  }
}
