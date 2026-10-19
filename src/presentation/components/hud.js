import { ENERGY_MAX } from '../../domain/energy.js';
import { icon } from '../pixel/icons.js';
import { t } from '../i18n/index.js';
import { formatCountdown, h } from '../ui/dom.js';

/** Energy as battery cells. With `onClick` it becomes a button that opens the energy dialog. */
export function energyMeter(energy, { onClick } = {}) {
  const cells = Array.from({ length: ENERGY_MAX }, (_, i) => h('span', { class: `energy__cell ${i < energy.value ? 'is-full' : ''}` }));
  const label = t('energy.aria', { value: energy.value, max: energy.max });
  if (!onClick) return h('span', { class: 'energy', title: label, 'aria-label': label, role: 'img' }, icon('energy', 'energy__icon'), cells);
  const low = energy.value < energy.max;
  return h('button', { class: `energy energy--btn ${low ? 'is-low' : ''}`, type: 'button', 'aria-label': `${label}. ${t('energy.openAria')}`, onClick },
    icon('energy', 'energy__icon'), cells, low ? h('b', { class: 'energy__plus', 'aria-hidden': 'true' }, '+') : null);
}

export function statChip(iconName, value, label) {
  return h('span', { class: 'stat', 'aria-label': `${label}: ${value}` }, icon(iconName), h('span', { class: 'stat__value' }, value));
}

export function starRow(count, max = 3, className = '') {
  return h('span', { class: `stars ${className}`, role: 'img', 'aria-label': t('stars.aria', { n: count, max }) },
    Array.from({ length: max }, (_, i) => icon('star', i < count ? 'star is-on' : 'star')));
}

export function xpBar(summary) {
  return h('div', { class: 'xpbar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': summary.needed, 'aria-valuenow': summary.current, 'aria-label': t('xp.level', { n: summary.level }) },
    h('span', { class: 'xpbar__level' }, t('xp.short', { n: summary.level })),
    h('span', { class: 'xpbar__track' }, h('span', { class: 'xpbar__fill', style: { '--fill': `${(summary.current / summary.needed) * 100}%` } })),
    h('span', { class: 'xpbar__value' }, `${summary.current}/${summary.needed} XP`));
}

/** Shared top bar: back button, title, energy and coins. */
export function topBar({ title, onBack, summary, backIcon = 'back', extra = null, onEnergy }) {
  const energyText = summary.energy.value < summary.energy.max ? h('span', { class: 'topbar__timer', 'data-energy-timer': '' }, t('energy.timer', { time: formatCountdown(summary.energy.msUntilNext) })) : null;
  return h('header', { class: 'topbar' },
    h('button', { class: 'iconbtn', type: 'button', 'aria-label': t('common.back'), onClick: onBack }, icon(backIcon)),
    h('h1', { class: 'topbar__title' }, title),
    h('div', { class: 'topbar__stats' }, extra, energyMeter(summary.energy, { onClick: onEnergy }), energyText, statChip('coin', summary.coins, t('common.coins'))));
}
