import { Screen } from '../Screen.js';
import { drawSprite, spritePixels } from '../pixel/draw.js';
import { icon } from '../pixel/icons.js';
import { MENTOR_SPRITES } from '../pixel/sprites.js';
import { h, reducedMotion, sleep, tween } from '../ui/dom.js';
import { mentorCard } from './mentorCard.js';

const SCALE = 6;

/** SPEC-006: silhouette → pixels appear in random order → name and story. */
export class MentorUnlockScreen extends Screen {
  get music() {
    return null;
  }

  get legend() {
    return [['A', 'escolher'], ['B', 'mapa']];
  }

  render() {
    const { game } = this.ctx;
    this.mentor = game.content.mentors.find((m) => m.id === this.params.mentorId);
    this.canvas = h('canvas', { class: 'portrait unlock__portrait', width: 16 * SCALE, height: 16 * SCALE, role: 'img', 'aria-label': `Retrato de ${this.mentor.name}` });
    this.details = h('div', { class: 'unlock__details' });

    this.root.append(
      h('p', { class: 'unlock__kicker' }, 'Novo mentor desbloqueado!'),
      h('div', { class: 'unlock__frame' }, this.canvas),
      this.details,
    );
    this.reveal();
  }

  async reveal() {
    const { theme } = this.ctx;
    const ctx = this.canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);
    const sprite = MENTOR_SPRITES[this.mentor.id];
    drawSprite(ctx, sprite, 0, 0, theme.colors, { tone: theme.colors[1] });

    if (!reducedMotion()) {
      await sleep(700);
      this.ctx.sfx('unlock');
      const pixels = spritePixels(sprite).sort(() => Math.random() - 0.5);
      let drawn = 0;
      await tween(1100, (t) => {
        const target = Math.round(pixels.length * t);
        for (; drawn < target; drawn += 1) {
          const [x, y, c] = pixels[drawn];
          ctx.fillStyle = theme.colors[c];
          ctx.fillRect(x, y, 1, 1);
        }
      });
    } else {
      this.ctx.sfx('unlock');
    }
    drawSprite(ctx, sprite, 0, 0, theme.colors);
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
            this.ctx.toast.show({ title: `${this.mentor.name} agora é seu guia`, iconName: 'person' });
          },
        }, icon('person'), 'Escolher como guia'),
        h('button', { class: 'pbtn pbtn--primary', type: 'button', onClick: () => this.ctx.nav.go('map') }, 'Continuar')),
    );
    this.details.querySelector('.pbtn--primary').focus({ preventScroll: true });
  }

  onBack() {
    this.ctx.nav.go('map');
  }
}
