import { REPEAT_LIMITS, cmd, countBlocks, repeat } from '../../domain/program.js';
import { icon } from '../pixel/icons.js';
import { COMMAND_UI } from '../ui/catalog.js';
import { h } from '../ui/dom.js';
import { clearHighlights, commandChip, highlightStep } from './blocks.js';

const MAX_PROGRAM = 12;
const LOOP_BODY_MAX = 4;

/**
 * Editor for Fases 1 and 3: tap palette → append block; tap block → remove;
 * Repetir captures the next blocks until closed. Same interface as RuleEditor.
 */
export class SequenceEditor {
  constructor({ challenge, sfx }) {
    this.challenge = challenge;
    this.sfx = sfx;
    this.nodes = [];
    this.target = null;
    this.locked = false;
    this.onChange = () => {};
    this.limit = challenge.maxBlocks ?? MAX_PROGRAM;

    this.counter = h('span', { class: 'program__count', 'aria-live': 'polite' });
    this.list = h('div', { class: 'program__list', role: 'list' });
    this.programEl = h('section', { class: 'program', 'aria-label': 'Seu programa' },
      h('header', { class: 'program__head' }, h('span', {}, 'Seu programa'), this.counter), this.list);
    this.paletteButtons = challenge.palette.map((id) => h('button', {
      class: `chip chip--cmd chip--${id} palette__btn`,
      type: 'button',
      'aria-label': `Adicionar ${COMMAND_UI[id].aria}`,
      'data-sound': 'none',
      dataset: { command: id },
      onClick: () => this.add(id),
    }, commandChip(id)));
    this.paletteEl = h('div', { class: 'palette palette--grid', role: 'group', 'aria-label': 'Comandos', style: { '--cols': challenge.palette.length } }, this.paletteButtons);
    this.render();
  }

  get blocks() {
    return countBlocks(this.nodes);
  }

  get loop() {
    return this.nodes.find((n) => n.id === this.target) ?? null;
  }

  isEmpty() {
    return this.nodes.length === 0;
  }

  getProgram() {
    return structuredClone(this.nodes);
  }

  canAdd(commandId) {
    if (this.locked || this.blocks >= this.limit) return false;
    if (commandId === 'repeat') return !this.loop;
    return true;
  }

  add(commandId) {
    if (!this.canAdd(commandId)) return;
    if (commandId === 'repeat') {
      const node = repeat(REPEAT_LIMITS.min, []);
      this.nodes.push(node);
      this.target = node.id;
    } else if (this.loop) {
      this.loop.body.push(cmd(commandId));
      if (this.loop.body.length >= LOOP_BODY_MAX) this.target = null;
    } else {
      this.nodes.push(cmd(commandId));
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
      this.nodes.forEach((n) => n.type === 'repeat' && (n.body = n.body.filter((b) => b.id !== nodeId)));
    }
    this.sfx('remove');
    this.changed();
  }

  /** B button: undo the last placed block. */
  removeLast() {
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
    this.target = null;
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
    this.counter.textContent = this.challenge.maxBlocks ? `Blocos ${blocks}/${this.limit}` : `${blocks} ${blocks === 1 ? 'bloco' : 'blocos'}`;
    this.counter.classList.toggle('is-full', blocks >= this.limit);
    this.paletteButtons.forEach((btn) => (btn.disabled = !this.canAdd(btn.dataset.command)));

    const items = this.nodes.map((node) => (node.type === 'repeat' ? this.renderLoop(node) : this.renderBlock(node)));
    if (!this.loop && !this.locked) items.push(h('span', { class: 'cursor', 'aria-hidden': 'true' }));
    if (this.nodes.length === 0) {
      items.unshift(h('p', { class: 'program__empty' }, 'Toque nos comandos abaixo para montar o caminho.'));
    }
    this.list.replaceChildren(...items);
  }

  renderBlock(node) {
    return h('button', {
      class: `chip chip--cmd chip--${node.command} block`,
      type: 'button',
      role: 'listitem',
      'data-sound': 'none',
      'aria-label': `${COMMAND_UI[node.command].aria}. Toque para remover.`,
      dataset: { nodeId: node.id },
      disabled: this.locked,
      onClick: () => this.remove(node.id),
    }, commandChip(node.command));
  }

  renderLoop(node) {
    const open = this.target === node.id && !this.locked;
    const body = node.body.map((child) => this.renderBlock(child));
    if (open) body.push(h('span', { class: 'cursor', 'aria-hidden': 'true' }));
    else if (node.body.length < LOOP_BODY_MAX && !this.locked) {
      body.push(h('button', { class: 'loop__add', type: 'button', 'aria-label': 'Colocar blocos dentro do Repetir', onClick: () => this.setTarget(node.id) }, '+'));
    }
    return h('div', { class: `loop ${open ? 'is-open' : ''}`, role: 'listitem', dataset: { nodeId: node.id } },
      h('div', { class: 'loop__head' },
        h('button', { class: 'loop__remove', type: 'button', 'data-sound': 'none', 'aria-label': 'Remover Repetir', disabled: this.locked, onClick: () => this.remove(node.id) }, icon('repeat', 'chip__icon'), 'Repetir'),
        h('button', { class: 'loop__times', type: 'button', 'data-sound': 'none', 'aria-label': `Repetir ${node.times} vezes. Toque para mudar.`, disabled: this.locked, onClick: () => this.cycleTimes(node) }, `${node.times}×`),
        h('span', { class: 'loop__iter', 'data-iteration': '' }),
        open ? h('button', { class: 'loop__close', type: 'button', 'aria-label': 'Fechar o Repetir', onClick: () => this.setTarget(null) }, icon('check')) : null),
      h('div', { class: 'loop__body' }, body));
  }
}
