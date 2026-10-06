import { icon } from '../pixel/icons.js';
import { COMMAND_UI, SENSOR_UI } from '../ui/catalog.js';
import { h } from '../ui/dom.js';

/** Inner content of a command/sensor chip: icon + label (+ small detail). */
export function chipContent(ui) {
  return [icon(ui.icon, 'chip__icon'), h('span', { class: 'chip__label' }, ui.label, ui.detail ? h('small', {}, ui.detail) : null)];
}

export const commandChip = (commandId) => chipContent(COMMAND_UI[commandId]);
export const sensorChip = (sensorId) => chipContent(SENSOR_UI[sensorId]);

/** Read-only rendering of a program (lessons, library, results). */
export function programStrip(nodes, { compact = false } = {}) {
  const render = (node) => {
    if (node.type === 'repeat') {
      return h('span', { class: 'strip__loop', dataset: { nodeId: node.id } },
        h('span', { class: 'strip__loophead' }, icon('repeat', 'chip__icon'), `${node.times}×`),
        h('span', { class: 'strip__body' }, node.body.map(render)));
    }
    if (node.type === 'rule') {
      return h('span', { class: 'strip__rule', dataset: { nodeId: node.id } },
        h('b', { class: 'kw' }, 'SE'), h('span', { class: 'chip chip--sensor' }, sensorChip(node.condition)),
        h('b', { class: 'kw' }, 'ENTÃO'), h('span', { class: 'chip chip--cmd' }, commandChip(node.action)));
    }
    return h('span', { class: `chip chip--cmd chip--${node.command}`, dataset: { nodeId: node.id } }, commandChip(node.command));
  };
  return h('div', { class: `strip ${compact ? 'strip--compact' : ''}`, role: 'list' }, nodes.map(render));
}

/** Lights the chip/loop that the current step belongs to. */
export function highlightStep(container, step) {
  container.querySelectorAll('.is-active').forEach((el) => el.classList.remove('is-active'));
  const target = container.querySelector(`[data-node-id="${step.nodeId ?? 'default'}"]`);
  target?.classList.add('is-active');
  for (const loop of step.loops ?? []) {
    const loopEl = container.querySelector(`[data-node-id="${loop.id}"]`);
    if (!loopEl) continue;
    loopEl.classList.add('is-active');
    const badge = loopEl.querySelector('[data-iteration]');
    if (badge) badge.textContent = `${loop.iteration}/${loop.times}`;
  }
}

export function clearHighlights(container) {
  container.querySelectorAll('.is-active, .is-error').forEach((el) => el.classList.remove('is-active', 'is-error'));
  container.querySelectorAll('[data-iteration]').forEach((el) => (el.textContent = ''));
}
