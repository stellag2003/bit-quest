import { ENERGY_MAX } from '../../domain/energy.js';
import { icon } from '../pixel/icons.js';
import { formatCountdown, h } from '../ui/dom.js';

/** Energy as battery cells. */
export function energyMeter(energy) {
  const cells = Array.from({ length: ENERGY_MAX }, (_, i) => h('span', { class: `energy__cell ${i < energy.value ? 'is-full' : ''}` }));
  const label = `Energia ${energy.value} de ${energy.max}`;
  return h('span', { class: 'energy', title: label, 'aria-label': label, role: 'img' }, icon('energy', 'energy__icon'), cells);
}

export function statChip(iconName, value, label) {
  return h('span', { class: 'stat', 'aria-label': `${label}: ${value}` }, icon(iconName), h('span', { class: 'stat__value' }, value));
}

export function starRow(count, max = 3, className = '') {
  return h('span', { class: `stars ${className}`, role: 'img', 'aria-label': `${count} de ${max} estrelas` },
    Array.from({ length: max }, (_, i) => icon('star', i < count ? 'star is-on' : 'star')));
}

export function xpBar(summary) {
  return h('div', { class: 'xpbar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': summary.needed, 'aria-valuenow': summary.current, 'aria-label': `Nível ${summary.level}` },
    h('span', { class: 'xpbar__level' }, `Nv ${summary.level}`),
    h('span', { class: 'xpbar__track' }, h('span', { class: 'xpbar__fill', style: { '--fill': `${(summary.current / summary.needed) * 100}%` } })),
    h('span', { class: 'xpbar__value' }, `${summary.current}/${summary.needed} XP`));
}

/** Shared top bar: back button, title, energy and coins. */
export function topBar({ title, onBack, summary, backIcon = 'back', extra = null }) {
  const energyText = summary.energy.value < summary.energy.max ? h('span', { class: 'topbar__timer', 'data-energy-timer': '' }, `+1 em ${formatCountdown(summary.energy.msUntilNext)}`) : null;
  return h('header', { class: 'topbar' },
    h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Voltar', onClick: onBack }, icon(backIcon)),
    h('h1', { class: 'topbar__title' }, title),
    h('div', { class: 'topbar__stats' }, extra, energyMeter(summary.energy), energyText, statChip('coin', summary.coins, 'Moedas')));
}
