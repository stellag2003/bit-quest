import { icon } from '../pixel/icons.js';
import { h } from '../ui/dom.js';

/** Mentor story block, shared by the unlock screen and the library. */
export function mentorCard(mentor) {
  return h('article', { class: 'mentor-card' },
    h('h2', { class: 'mentor-card__name' }, mentor.name),
    h('p', { class: 'mentor-card__meta' }, h('span', {}, mentor.years), h('span', {}, mentor.area)),
    h('p', {}, mentor.intro),
    h('div', { class: 'mentor-card__fact panel' }, h('strong', {}, icon('star'), ' Curiosidade'), h('p', {}, mentor.fact)),
    h('blockquote', { class: 'mentor-card__message' },
      h('p', {}, mentor.message),
      h('footer', {}, 'Frase criada para o jogo. Não é uma citação histórica.')));
}
