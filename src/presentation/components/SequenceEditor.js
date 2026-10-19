import { REPEAT_LIMITS, call, cmd, countBlocks, fn, repeat } from '../../domain/program.js';
import { icon } from '../pixel/icons.js';
import { t, tn } from '../i18n/index.js';
import { COMMAND_UI } from '../ui/catalog.js';
import { h } from '../ui/dom.js';
import { bugBadge, clearHighlights, commandChip, highlightStep } from './blocks.js';

const MAX_PROGRAM = 12;
const LOOP_BODY_MAX = 4;

/**
 * Editor for sequence challenges: tap palette → append block; tap block → remove;
 * Repetir captures the next blocks until closed. Debugging challenges start
 * from `challenge.start`; function challenges (`functionMax`) add a ★ Função
 * frame on top whose body is filled the same way. Same interface as RuleEditor.
 */
export class SequenceEditor {
  constructor({ challenge, sfx }) {
    this.challenge = challenge;
    this.sfx = sfx;
    this.nodes = structuredClone(challenge.start ?? []);
    // ★ Função: always present, filled first (the cursor starts inside it).
    this.def = challenge.functionMax ? fn([]) : null;
    this.target = this.def?.id ?? null;
    this.locked = false;
    this.onChange = () => {};
    this.limit = challenge.maxBlocks ?? MAX_PROGRAM;

    this.counter = h('span', { class: 'program__count', 'aria-live': 'polite' });
    this.list = h('div', { class: 'program__list', role: 'list' });
    this.programEl = h('section', { class: 'program', 'aria-label': t('seq.title') },
      h('header', { class: 'program__head' }, h('span', {}, t('seq.title')), challenge.start ? bugBadge() : null, this.counter), this.list);
    this.paletteButtons = challenge.palette.map((id) => h('button', {
      class: `chip chip--cmd chip--${id} palette__btn`,
      type: 'button',
      'aria-label': t('seq.add', { what: COMMAND_UI[id].aria }),
      'data-sound': 'none',
      dataset: { command: id },
      onClick: () => this.add(id),
    }, commandChip(id)));
    this.paletteEl = h('div', { class: 'palette palette--grid', role: 'group', 'aria-label': t('seq.palette'), style: { '--cols': challenge.palette.length } }, this.paletteButtons);
    this.render();
  }

  get blocks() {
    return countBlocks(this.getProgram());
  }

  /** The open container (a Repetir or the ★ Função) receiving new blocks, if any. */
  get loop() {
    if (this.def && this.target === this.def.id) return this.def;
    return this.nodes.find((n) => n.id === this.target) ?? null;
  }

  get bodyMax() {
    return this.loop === this.def ? this.challenge.functionMax : LOOP_BODY_MAX;
  }

  isEmpty() {
    return this.nodes.length === 0 && !this.def?.body.length;
  }

  getProgram() {
    return structuredClone(this.def ? [this.def, ...this.nodes] : this.nodes);
  }

  canAdd(commandId) {
    if (this.locked || this.blocks >= this.limit) return false;
    const open = this.loop;
    // Repetir and ★ never go inside the ★ itself: tapping them closes it and adds to the main program.
    if (commandId === 'repeat') return !open || open === this.def;
    return true;
  }

  add(commandId) {
    if (!this.canAdd(commandId)) return;
    if (this.loop === this.def && (commandId === 'repeat' || commandId === 'call')) this.target = null;
    const make = () => (commandId === 'call' ? call() : cmd(commandId));
    if (commandId === 'repeat') {
      const node = repeat(REPEAT_LIMITS.min, []);
      this.nodes.push(node);
      this.target = node.id;
    } else if (this.loop) {
      this.loop.body.push(make());
      if (this.loop.body.length >= this.bodyMax) this.target = null;
    } else {
      this.nodes.push(make());
    }
    this.sfx('place');
    this.changed();
  }

  remove(nodeId) {
    if (this.locked) return;
    const index = this.nodes.findIndex((n) => n.id === nodeId);
    if (index >= 0) {
      if (this.target === nodeId) this.target = null;
      this.nodes.splice(index, 1);
    } else {
      [this.def, ...this.nodes].forEach((n) => n && n.body && (n.body = n.body.filter((b) => b.id !== nodeId)));
    }
    this.sfx('remove');
    this.changed();
  }

  /** B button: undo the last placed block. */
  removeLast() {
    if (this.nodes.length === 0 && this.def?.body.length) return this.remove(this.def.body.at(-1).id);
    const loop = this.loop;
    if (loop?.body.length) return this.remove(loop.body.at(-1).id);
    const last = this.nodes.at(-1);
    if (!last) return false;
    if (last.type === 'repeat' && last.body.length && !loop) {
      this.target = last.id;
      return this.remove(last.body.at(-1).id);
    }
    return this.remove(last.id);
  }

  clear() {
    if (this.locked || this.isEmpty()) return;
    this.nodes = [];
    if (this.def) this.def.body = [];
    this.target = this.def?.id ?? null;
    this.sfx('remove');
    this.changed();
  }

  cycleTimes(node) {
    if (this.locked) return;
    node.times = node.times >= REPEAT_LIMITS.max ? REPEAT_LIMITS.min : node.times + 1;
    this.sfx('move');
    this.changed();
  }

  setTarget(nodeId) {
    if (this.locked) return;
    this.target = nodeId;
    this.sfx('move');
    this.render();
  }

  setLocked(locked) {
    this.locked = locked;
    this.programEl.classList.toggle('is-locked', locked);
    this.render();
  }

  highlight(step) {
    highlightStep(this.list, step);
  }

  markError(nodeId) {
    if (nodeId) this.list.querySelector(`[data-node-id="${nodeId}"]`)?.classList.add('is-error');
  }

  clearMarks() {
    clearHighlights(this.list);
  }

  changed() {
    this.render();
    this.onChange();
  }

  render() {
    const blocks = this.blocks;
    this.counter.textContent = this.challenge.maxBlocks ? t('seq.limit', { n: blocks, max: this.limit }) : tn('seq.blocks', blocks);
    this.counter.classList.toggle('is-full', blocks >= this.limit);
    this.paletteButtons.forEach((btn) => (btn.disabled = !this.canAdd(btn.dataset.command)));

    const items = this.nodes.map((node) => (node.type === 'repeat' ? this.renderLoop(node) : this.renderBlock(node)));
    if (!this.loop && !this.locked) items.push(h('span', { class: 'cursor', 'aria-hidden': 'true' }));
    if (this.nodes.length === 0 && !this.def) {
      items.unshift(h('p', { class: 'program__empty' }, t('seq.empty')));
    }
    if (this.def) items.unshift(this.renderFunction(this.def));
    this.list.replaceChildren(...items);
    // The list scrolls inside its own area: keep the cursor (where the next block goes) in view.
    const cursor = this.list.querySelector('.cursor');
    if (cursor) this.list.scrollTop = Math.max(0, cursor.offsetTop - this.list.clientHeight + cursor.offsetHeight + 8);
  }

  renderBlock(node) {
    const id = node.type === 'call' ? 'call' : node.command;
    return h('button', {
      class: `chip chip--cmd chip--${id} block`,
      type: 'button',
      role: 'listitem',
      'data-sound': 'none',
      'aria-label': t('seq.remove', { what: COMMAND_UI[id].aria }),
      dataset: { nodeId: node.id },
      disabled: this.locked,
      onClick: () => this.remove(node.id),
    }, commandChip(id));
  }

  /** The ★ Função frame: like a Repetir without a counter, and it cannot be removed. */
  renderFunction(def) {
    const open = this.target === def.id && !this.locked;
    const body = def.body.map((child) => this.renderBlock(child));
    if (open) body.push(h('span', { class: 'cursor', 'aria-hidden': 'true' }));
    else if (def.body.length < this.challenge.functionMax && !this.locked) {
      body.push(h('button', { class: 'loop__add', type: 'button', 'aria-label': t('seq.fnAdd'), onClick: () => this.setTarget(def.id) }, '+'));
    }
    return h('div', { class: `loop loop--fn ${open ? 'is-open' : ''}`, role: 'listitem', dataset: { nodeId: def.id } },
      h('div', { class: 'loop__head' },
        h('span', { class: 'loop__fnname' }, icon('star', 'chip__icon'), t('seq.function')),
        h('small', { class: 'loop__fncount' }, `${def.body.length}/${this.challenge.functionMax}`),
        open ? h('button', { class: 'loop__close', type: 'button', 'aria-label': t('seq.fnClose'), onClick: () => this.setTarget(null) }, icon('check')) : null),
      h('div', { class: 'loop__body' }, body));
  }

  renderLoop(node) {
    const open = this.target === node.id && !this.locked;
    const body = node.body.map((child) => this.renderBlock(child));
    if (open) body.push(h('span', { class: 'cursor', 'aria-hidden': 'true' }));
    else if (node.body.length < LOOP_BODY_MAX && !this.locked) {
      body.push(h('button', { class: 'loop__add', type: 'button', 'aria-label': t('seq.loopAdd'), onClick: () => this.setTarget(node.id) }, '+'));
    }
    return h('div', { class: `loop ${open ? 'is-open' : ''}`, role: 'listitem', dataset: { nodeId: node.id } },
      h('div', { class: 'loop__head' },
        h('button', { class: 'loop__remove', type: 'button', 'data-sound': 'none', 'aria-label': t('seq.loopRemove'), disabled: this.locked, onClick: () => this.remove(node.id) }, icon('repeat', 'chip__icon'), t('seq.repeat')),
        h('button', { class: 'loop__times', type: 'button', 'data-sound': 'none', 'aria-label': t('seq.loopTimes', { n: node.times }), disabled: this.locked, onClick: () => this.cycleTimes(node) }, `${node.times}×`),
        h('span', { class: 'loop__iter', 'data-iteration': '' }),
        open ? h('button', { class: 'loop__close', type: 'button', 'aria-label': t('seq.loopClose'), onClick: () => this.setTarget(null) }, icon('check')) : null),
      h('div', { class: 'loop__body' }, body));
  }
}
