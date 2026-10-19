import { Screen } from '../Screen.js';
import { t } from '../i18n/index.js';
import { icon } from '../pixel/icons.js';
import { h } from '../ui/dom.js';

/**
 * Asked once when the game starts (and reachable from Ajustes): easy, medium
 * or hard. Each card lists what actually changes in that level.
 */
export class DifficultyScreen extends Screen {
  get legend() {
    return this.fromSettings ? [['A', t('legend.choose')], ['B', t('legend.back')]] : [['A', t('legend.choose')]];
  }

  get fromSettings() {
    return this.params?.from === 'settings';
  }

  render() {
    const { game } = this.ctx;
    const current = game.store.get().settings.difficulty ?? game.content.difficulties.defaultId;
    this.root.append(
      h('header', { class: 'difficulty__head' },
        this.fromSettings ? h('button', { class: 'iconbtn', type: 'button', 'aria-label': t('common.back'), onClick: () => this.onBack() }, icon('back')) : null,
        h('div', {}, h('h1', { class: 'difficulty__title' }, t('difficulty.title')), h('p', { class: 'difficulty__subtitle' }, t('difficulty.subtitle')))),
      h('div', { class: 'difficulty__list', role: 'radiogroup', 'aria-label': t('difficulty.title') },
        game.content.difficulties.levels.map((level) => this.card(level, level.id === current))),
    );
  }

  card(level, selected) {
    const name = t(`difficulty.${level.id}`);
    return h('button', {
      class: `difficulty-card panel ${selected ? 'is-current' : ''}`,
      type: 'button',
      role: 'radio',
      'aria-checked': String(selected),
      'data-autofocus': selected ? '' : null,
      onClick: () => this.choose(level.id),
    },
    h('span', { class: 'difficulty-card__icon' }, icon(level.icon)),
    h('span', { class: 'difficulty-card__body' },
      h('strong', {}, name),
      h('ul', {}, [1, 2, 3].map((n) => h('li', {}, t(`difficulty.${level.id}.${n}`))))));
  }

  choose(id) {
    const { game, nav, toast } = this.ctx;
    game.updateSettings.execute({ difficulty: id });
    toast.show({ title: t('difficulty.current', { name: t(`difficulty.${id}`) }), iconName: 'check' });
    if (this.fromSettings) return nav.go('settings');
    nav.go(game.store.get().settings.guideSeen ? 'home' : 'guide');
  }

  onBack() {
    if (this.fromSettings) this.ctx.nav.go('settings');
  }
}
