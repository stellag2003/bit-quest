import { t } from '../i18n/index.js';
import { spriteCanvas } from '../pixel/draw.js';
import { hasPortrait, portraitCanvas } from '../pixel/portrait.js';
import { MENTOR_SPRITES } from '../pixel/sprites.js';
import { h, reducedMotion, sleep } from '../ui/dom.js';

/**
 * `scale` is in 16-px sprite units (scale 2 = 32 px on screen). Mentors with
 * 32×32 art use it at half the scale, rounded up so it stays a whole number.
 */
export function mentorPortrait(mentorId, colors, { scale = 4, locked = false } = {}) {
  const canvas = hasPortrait(mentorId)
    ? portraitCanvas(mentorId, { scale: Math.ceil(scale / 2), silhouette: locked ? colors[1] : null })
    : spriteCanvas(MENTOR_SPRITES[mentorId], colors, scale, locked ? { tone: colors[1] } : {});
  canvas.classList.add('portrait');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', locked ? t('mentor.locked') : t('mentor.portrait'));
  return canvas;
}

/** Portrait + speech balloon with a typewriter effect. Tap to finish the line. */
export class MentorSpeech {
  constructor({ mentor, colors, sfx, compact = false }) {
    this.sfx = sfx;
    this.text = h('p', { class: 'speech__text', 'aria-hidden': 'true' });
    this.spoken = h('p', { class: 'sr-only', 'aria-live': 'polite' });
    this.el = h('div', { class: `speech ${compact ? 'speech--compact' : ''}` },
      h('div', { class: 'speech__who' }, mentorPortrait(mentor.id, colors, { scale: compact ? 2 : 3 }), h('span', { class: 'speech__name' }, mentor.name.split(' ')[0])),
      h('div', { class: 'speech__balloon' }, this.text, this.spoken));
    this.el.addEventListener('click', () => (this.skip = true));
  }

  async say(line) {
    this.skip = false;
    const token = {};
    this.token = token;
    this.spoken.textContent = line;
    if (reducedMotion()) {
      this.text.textContent = line;
      return;
    }
    this.text.textContent = '';
    for (let i = 1; i <= line.length; i += 1) {
      if (this.token !== token) return;
      if (this.skip) {
        this.text.textContent = line;
        return;
      }
      this.text.textContent = line.slice(0, i);
      if (i % 3 === 0 && line[i - 1] !== ' ') this.sfx('type');
      await sleep(22);
    }
  }

  stop() {
    this.token = null;
  }
}
