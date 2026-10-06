import { isCompleteRule, rule } from '../../domain/program.js';
import { icon } from '../pixel/icons.js';
import { COMMAND_UI, SENSOR_UI } from '../ui/catalog.js';
import { h } from '../ui/dom.js';
import { clearHighlights, commandChip, highlightStep, sensorChip } from './blocks.js';

/**
 * Editor for Fase 2: fill "SE [sensor] ENTÃO [ação]" cards. The palette writes
 * into the selected slot and then advances to the next empty one.
 */
export class RuleEditor {
  constructor({ challenge, sfx }) {
    this.challenge = challenge;
    this.sfx = sfx;
    this.rules = Array.from({ length: challenge.ruleSlots }, () => rule());
    this.selected = { ruleId: this.rules[0].id, slot: 'condition' };
    this.locked = false;
    this.onChange = () => {};

    this.list = h('div', { class: 'rules', role: 'list' });
    this.defaultRule = h('span', { class: 'rule-default', dataset: { nodeId: 'default' } },
      'Senão, o Bit anda: ', icon('walk'));
    this.programEl = h('section', { class: 'program program--rules', 'aria-label': 'Suas regras' },
      h('header', { class: 'program__head' }, h('span', {}, 'Suas regras'), this.defaultRule), this.list);

    const button = (kind, id, content, aria) => h('button', {
      class: `chip chip--${kind === 'condition' ? 'sensor' : 'cmd'} palette__btn`,
      type: 'button',
      'data-sound': 'none',
      'aria-label': aria,
      dataset: { slot: kind, value: id },
      onClick: () => this.fill(kind, id),
    }, content);

    this.paletteButtons = [
      ...challenge.sensors.map((id) => button('condition', id, sensorChip(id), `SE ${SENSOR_UI[id].aria}`)),
      ...challenge.actions.map((id) => button('action', id, commandChip(id), `ENTÃO ${COMMAND_UI[id].aria}`)),
    ];
    const group = (slot, keyword) => {
      const buttons = this.paletteButtons.filter((b) => b.dataset.slot === slot);
      return h('div', { class: 'palette__group', style: { '--cols': buttons.length } },
        h('b', { class: 'kw' }, keyword), h('div', { class: 'palette__items' }, buttons));
    };
    this.paletteEl = h('div', { class: 'palette palette--rules', role: 'group', 'aria-label': 'Peças das regras', style: { '--split': `${challenge.sensors.length}fr ${challenge.actions.length}fr` } },
      group('condition', 'SE'), group('action', 'ENTÃO'));
    this.render();
  }

  isEmpty() {
    return !this.rules.some((r) => r.condition || r.action);
  }

  getProgram() {
    return structuredClone(this.rules);
  }

  select(ruleId, slot) {
    if (this.locked) return;
    const target = this.rules.find((r) => r.id === ruleId);
    if (target[slot]) {
      target[slot] = null;
      this.sfx('remove');
      this.selected = { ruleId, slot };
      return this.changed();
    }
    this.selected = { ruleId, slot };
    this.sfx('move');
    this.render();
  }

  fill(slot, value) {
    if (this.locked) return;
    const target = this.rules.find((r) => r.id === this.selected.ruleId);
    target[slot] = value;
    this.sfx('place');
    this.advance(target);
    this.changed();
  }

  advance(current) {
    if (!current.condition) return void (this.selected = { ruleId: current.id, slot: 'condition' });
    if (!current.action) return void (this.selected = { ruleId: current.id, slot: 'action' });
    const next = this.rules.find((r) => !isCompleteRule(r));
    if (next) this.selected = { ruleId: next.id, slot: next.condition ? 'action' : 'condition' };
  }

  removeLast() {
    const last = [...this.rules].reverse().find((r) => r.condition || r.action);
    if (!last) return false;
    this.select(last.id, last.action ? 'action' : 'condition');
    return true;
  }

  clear() {
    if (this.locked || this.isEmpty()) return;
    this.rules.forEach((r) => Object.assign(r, { condition: null, action: null }));
    this.selected = { ruleId: this.rules[0].id, slot: 'condition' };
    this.sfx('remove');
    this.changed();
  }

  setLocked(locked) {
    this.locked = locked;
    this.programEl.classList.toggle('is-locked', locked);
    this.render();
  }

  highlight(step) {
    highlightStep(this.programEl, step);
  }

  /** A null node means the default "SENÃO: andar" step failed. */
  markError(nodeId) {
    this.programEl.querySelector(`[data-node-id="${nodeId ?? 'default'}"]`)?.classList.add('is-error');
  }

  clearMarks() {
    clearHighlights(this.programEl);
  }

  changed() {
    this.render();
    this.onChange();
  }

  render() {
    const cards = this.rules.map((r, i) => {
      const slotButton = (slot) => {
        const value = r[slot];
        const isSelected = !this.locked && this.selected.ruleId === r.id && this.selected.slot === slot;
        const content = value ? (slot === 'condition' ? sensorChip(value) : commandChip(value)) : h('span', { class: 'slot__empty' }, '?');
        return h('button', {
          class: `slot slot--${slot} ${value ? 'is-filled' : ''} ${isSelected ? 'is-selected' : ''}`,
          type: 'button',
          'data-sound': 'none',
          disabled: this.locked,
          'aria-label': value ? 'Toque para apagar' : `Escolher ${slot === 'condition' ? 'o SE' : 'o ENTÃO'}`,
          onClick: () => this.select(r.id, slot),
        }, content);
      };
      return h('div', { class: 'rule', role: 'listitem', dataset: { nodeId: r.id }, 'aria-label': `Regra ${i + 1}` },
        h('b', { class: 'kw' }, 'SE'), slotButton('condition'), h('b', { class: 'kw' }, 'ENTÃO'), slotButton('action'));
    });
    this.list.replaceChildren(...cards);
  }
}
