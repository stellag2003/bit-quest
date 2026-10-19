import { ENERGY_REGEN_MS } from '../../domain/energy.js';
import { t } from '../i18n/index.js';
import { formatCountdown, h } from '../ui/dom.js';
import { energyMeter } from './hud.js';

/**
 * Energy status + refill, shared by every screen that shows the energy bar.
 * Resolves with 'refilled', the `leave` action value, or null (closed).
 */
export async function openEnergyDialog(screen, { title = t('energy.title'), leave = null } = {}) {
  const { game, sfx, toast } = screen.ctx;
  const price = game.content.economy.energyRefillPrice;
  const { energy, coins } = game.playerSummary.execute();
  const full = energy.value >= energy.max;
  const canRefill = !full && coins >= price;
  const status = full
    ? t('energy.full')
    : t('energy.next', { time: formatCountdown(energy.msUntilNext) });

  const choice = await screen.ask({
    title,
    iconName: 'energy',
    body: h('div', { class: 'energy-dialog' },
      h('div', { class: 'energy-dialog__meter' }, energyMeter(energy), h('strong', {}, t('energy.count', { value: energy.value, max: energy.max }))),
      h('p', {}, status),
      h('ul', { class: 'energy-dialog__rules' },
        h('li', {}, t('energy.ruleFail')),
        h('li', {}, t('energy.ruleRegen', { min: ENERGY_REGEN_MS / 60000 })),
        h('li', {}, t('energy.ruleWin'))),
      !full && !canRefill ? h('p', { class: 'energy-dialog__missing' }, t('energy.missing', { n: price - coins })) : null),
    actions: [
      canRefill ? { label: t('energy.refill', { price }), value: 'refill', primary: true, icon: 'coin' } : null,
      leave ?? { label: t('common.close'), value: null, primary: !canRefill },
    ].filter(Boolean),
  });

  if (choice !== 'refill') return choice;
  if (!game.refillEnergy.execute().ok) return null;
  sfx('coin');
  toast.show({ title: t('energy.refilled'), iconName: 'energy' });
  return 'refilled';
}
