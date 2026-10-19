import { Screen } from '../Screen.js';
import { createEditor } from '../components/editors.js';
import { openEnergyDialog } from '../components/energyDialog.js';
import { energyMeter } from '../components/hud.js';
import { mentorPortrait } from '../components/mentorViews.js';
import { WorldView } from '../components/WorldView.js';
import { icon } from '../pixel/icons.js';
import { t } from '../i18n/index.js';
import { h, pick, sleep } from '../ui/dom.js';

/**
 * SPEC-002/003/004 screen states: editing → running → (success | failure) → editing.
 * The verdict always comes from the domain (`session.submit`); this screen
 * only replays the returned trace and shows feedback.
 */
export class ChallengeScreen extends Screen {
  get music() {
    return null;
  }

  get legend() {
    return [['A', t('legend.choose')], ['B', t('legend.erase')]];
  }

  render() {
    const { game, theme, sfx } = this.ctx;
    try {
      this.session = game.startChallenge.execute(this.params.challengeId);
    } catch {
      this.later(() => this.ctx.nav.go('map'), 0);
      return;
    }
    const { fase, challenge, index } = this.session;
    this.challenge = challenge;
    this.mentor = game.content.mentors.find((m) => m.id === fase.mentorId);
    this.state = 'editing';

    this.editor = createEditor(challenge, { sfx });
    this.editor.onChange = () => this.onProgramChange();
    this.view = new WorldView({ theme, sfx, scenery: fase.scenery, label: t('challenge.mapAria', { goal: challenge.goal }) });
    this.track(() => this.view.destroy());

    this.energySlot = h('div', { class: 'challenge__energy' });
    this.hintBtn = h('button', { class: 'iconbtn', type: 'button', 'aria-label': t('challenge.hint'), onClick: () => this.showHint() }, icon('hint'));
    this.runBtn = h('button', { class: 'pbtn pbtn--primary pbtn--run', type: 'button', onClick: () => this.run() }, icon('play'), t('challenge.run'));
    this.clearBtn = h('button', { class: 'iconbtn', type: 'button', 'aria-label': t('challenge.clear'), onClick: () => this.clearAll() }, icon('trash'));
    this.feedbackLayer = h('div', { class: 'feedback-layer' });
    this.controls = h('div', { class: 'challenge__controls' },
      this.editor.paletteEl,
      h('div', { class: 'challenge__actions' }, this.clearBtn, this.runBtn),
      this.feedbackLayer);
    this.tabs = challenge.maps.length > 1
      ? h('div', { class: 'maptabs', role: 'tablist', 'aria-label': t('challenge.maps') }, challenge.maps.map((_, i) =>
        h('button', { class: 'maptab', type: 'button', role: 'tab', 'aria-selected': String(i === 0), onClick: () => this.showMap(i) }, t('challenge.mapTab', { n: i + 1 }))))
      : null;

    this.root.append(
      h('header', { class: 'topbar' },
        h('button', { class: 'iconbtn', type: 'button', 'aria-label': t('common.backToMap'), onClick: () => this.ctx.nav.go('map') }, icon('back')),
        h('div', { class: 'topbar__title' }, h('span', { class: 'fase__number' }, t('challenge.kicker', { n: fase.number, index: index + 1 })), h('h1', {}, challenge.title)),
        this.energySlot,
        this.hintBtn),
      h('p', { class: 'goal' }, icon('flag'), challenge.goal),
      h('div', { class: 'challenge__stage' }, this.tabs, this.view.el),
      this.editor.programEl,
      this.controls,
    );
    this.view.setWorld(challenge.maps[0]);
    this.renderEnergy();
    this.onProgramChange();
    this.editor.paletteEl.querySelector('button:not([disabled])')?.setAttribute('data-autofocus', '');
  }

  renderEnergy() {
    const { energy } = this.ctx.game.playerSummary.execute();
    this.energySlot.replaceChildren(energyMeter(energy, { onClick: () => this.showEnergy() }));
  }

  /** Map tab chosen by the player; ignored mid-run so the replay stays on the right map. */
  showMap(index) {
    if (this.state !== 'running') this.displayMap(index);
  }

  displayMap(index) {
    this.tabs?.querySelectorAll('.maptab').forEach((tab, i) => tab.setAttribute('aria-selected', String(i === index)));
    this.view.setWorld(this.challenge.maps[index]);
  }

  onProgramChange() {
    if (this.state === 'failed') this.retry();
    this.editor.clearMarks();
    this.runBtn.classList.toggle('is-ready', !this.editor.isEmpty());
  }

  clearAll() {
    if (this.state === 'running') return;
    this.editor.clear();
  }

  async run() {
    if (this.state === 'running') return;
    if (this.state === 'failed') this.retry();
    const outcome = this.session.submit(this.editor.getProgram());
    if (outcome.status === 'no_energy') return this.noEnergy();

    const { evaluation } = outcome;
    if (!evaluation.success && evaluation.failure.stepIndex < 0) {
      this.ctx.sfx('wrong');
      this.editor.markError(evaluation.failure.nodeId);
      return this.showFailure(evaluation, false);
    }

    this.state = 'running';
    this.editor.setLocked(true);
    this.runBtn.disabled = true;
    this.root.classList.add('is-running');

    for (const run of evaluation.runs) {
      if (this.challenge.maps.length > 1) {
        this.displayMap(run.mapIndex);
        await sleep(350);
      } else {
        this.view.reset();
      }
      const finished = await this.view.play(run, { onStep: (step) => this.editor.highlight(step) });
      if (!finished) return;
      if (!run.success) break;
      if (run.mapIndex < evaluation.runs.length - 1) await sleep(450);
    }

    this.root.classList.remove('is-running');
    this.runBtn.disabled = false;
    this.editor.setLocked(false);
    if (outcome.status === 'success') return this.succeed(outcome);

    this.state = 'failed';
    this.ctx.sfx('wrong');
    this.editor.markError(evaluation.failure.nodeId);
    this.renderEnergy();
    this.showFailure(evaluation, outcome.energyLost);
  }

  succeed(outcome) {
    this.state = 'done';
    this.ctx.sfx('correct');
    this.feedbackLayer.replaceChildren(h('div', { class: 'banner', role: 'status' }, t('challenge.success')));
    this.later(() => this.ctx.nav.go('result', { challengeId: this.challenge.id, outcome }), 1100);
  }

  showFailure(evaluation, energyLost) {
    const { failure } = evaluation;
    const { failures, encouragements } = this.ctx.game.content.feedback;
    const copy = failures[failure.code] ?? { title: t('challenge.unknownTitle'), hint: t('challenge.unknownHint') };
    const multiMap = this.challenge.maps.length > 1;
    const where = failure.stepIndex >= 0 ? t(multiMap ? 'challenge.whereStepMap' : 'challenge.whereStep', { step: failure.stepIndex + 1, map: failure.mapIndex + 1 }) : null;
    this.hintBtn.classList.toggle('is-pulsing', this.session.failures >= 2);

    const card = h('div', { class: 'feedback panel', role: 'alert' },
      h('div', { class: 'feedback__head' }, icon(energyLost ? 'bug' : 'hint', 'feedback__icon'), h('strong', {}, copy.title)),
      h('p', { class: 'feedback__hint' }, where ? h('b', {}, `${where} `) : null, copy.hint),
      energyLost ? h('p', { class: 'feedback__note' }, icon('energy'), ` ${t('challenge.energyLost')} ${pick(encouragements)}`) : null,
      h('div', { class: 'feedback__actions' },
        h('button', { class: 'pbtn', type: 'button', onClick: () => this.showHint() }, icon('hint'), t('challenge.hintBtn')),
        h('button', { class: 'pbtn pbtn--primary', type: 'button', onClick: () => this.retry() }, energyLost ? t('challenge.retry') : t('challenge.ok'))));
    this.feedbackLayer.replaceChildren(card);
    this.controls.classList.add('has-feedback');
    if (energyLost) this.state = 'failed';
    requestAnimationFrame(() => card.querySelector('.pbtn--primary')?.focus({ preventScroll: true }));
  }

  /** Back to editing with the same program: fix, don't restart. */
  retry() {
    this.state = 'editing';
    this.feedbackLayer.replaceChildren();
    this.controls.classList.remove('has-feedback');
    this.view.reset();
  }

  async showHint() {
    if (this.state === 'running') return;
    this.ctx.sfx('lesson');
    await this.ask({
      title: t('challenge.hintTitle'),
      body: h('div', { class: 'hint' }, mentorPortrait(this.mentor.id, this.ctx.theme.colors, { scale: 3 }),
        h('div', {}, h('strong', {}, this.mentor.name), h('p', {}, this.session.nextHint()))),
      actions: [{ label: t('challenge.gotIt'), value: true, primary: true }],
    });
  }

  async showEnergy() {
    if (this.state === 'running') return;
    if (await openEnergyDialog(this) === 'refilled') this.renderEnergy();
  }

  async noEnergy() {
    this.ctx.sfx('wrong');
    const choice = await openEnergyDialog(this, { title: t('energy.empty'), leave: { label: t('common.backToMap'), value: 'map' } });
    if (choice === 'refilled') this.renderEnergy();
    else if (choice === 'map') this.ctx.nav.go('map');
  }

  onBack() {
    if (this.state === 'running' || this.state === 'done') return;
    if (this.state === 'failed') return this.retry();
    if (this.editor.removeLast() === false) this.ctx.nav.go('map');
  }

  onStart() {
    if (this.state === 'failed') this.retry();
    this.run();
  }

  onSelect() {
    this.showHint();
  }
}
