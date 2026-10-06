import { ENCOURAGEMENTS, FAILURES } from '../../content/feedback.js';
import { Screen } from '../Screen.js';
import { createEditor } from '../components/editors.js';
import { energyMeter } from '../components/hud.js';
import { mentorPortrait } from '../components/mentorViews.js';
import { WorldView } from '../components/WorldView.js';
import { icon } from '../pixel/icons.js';
import { formatCountdown, h, pick, sleep } from '../ui/dom.js';

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
    return [['A', 'escolher'], ['B', 'apagar'], ['START', 'executar'], ['SELECT', 'dica']];
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
    this.view = new WorldView({ theme, sfx, scenery: fase.scenery, label: `Mapa do desafio. ${challenge.goal}` });
    this.track(() => this.view.destroy());

    this.energySlot = h('div', { class: 'challenge__energy' });
    this.hintBtn = h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Pedir dica', onClick: () => this.showHint() }, icon('hint'));
    this.runBtn = h('button', { class: 'pbtn pbtn--primary pbtn--run', type: 'button', onClick: () => this.run() }, icon('play'), 'Executar');
    this.clearBtn = h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Apagar tudo', onClick: () => this.clearAll() }, icon('trash'));
    this.feedbackLayer = h('div', { class: 'feedback-layer' });
    this.controls = h('div', { class: 'challenge__controls' },
      this.editor.paletteEl,
      h('div', { class: 'challenge__actions' }, this.clearBtn, this.runBtn),
      this.feedbackLayer);
    this.tabs = challenge.maps.length > 1
      ? h('div', { class: 'maptabs', role: 'tablist', 'aria-label': 'Mapas' }, challenge.maps.map((_, i) =>
        h('button', { class: 'maptab', type: 'button', role: 'tab', 'aria-selected': String(i === 0), onClick: () => this.showMap(i) }, `Mapa ${i + 1}`)))
      : null;

    this.root.append(
      h('header', { class: 'topbar' },
        h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Voltar ao mapa', onClick: () => this.ctx.nav.go('map') }, icon('back')),
        h('div', { class: 'topbar__title' }, h('span', { class: 'fase__number' }, `Fase ${fase.number} · ${index + 1}/3`), h('h1', {}, challenge.title)),
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
    this.energySlot.replaceChildren(energyMeter(this.ctx.game.playerSummary.execute().energy));
  }

  showMap(index) {
    if (this.state === 'running') return;
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
    if (outcome.status === 'no_energy') return this.noEnergy(outcome);

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
        this.showMap(run.mapIndex);
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
    this.feedbackLayer.replaceChildren(h('div', { class: 'banner', role: 'status' }, 'Conseguiu!'));
    this.later(() => this.ctx.nav.go('result', { challengeId: this.challenge.id, outcome }), 1100);
  }

  showFailure(evaluation, energyLost) {
    const { failure } = evaluation;
    const copy = FAILURES[failure.code] ?? { title: 'Algo deu errado.', hint: 'Tente outro caminho.' };
    const multiMap = this.challenge.maps.length > 1;
    const where = failure.stepIndex >= 0 ? `No passo ${failure.stepIndex + 1}${multiMap ? ` do mapa ${failure.mapIndex + 1}` : ''}.` : null;
    this.hintBtn.classList.toggle('is-pulsing', this.session.failures >= 2);

    const card = h('div', { class: 'feedback panel', role: 'alert' },
      h('div', { class: 'feedback__head' }, icon(energyLost ? 'bug' : 'hint', 'feedback__icon'), h('strong', {}, copy.title)),
      h('p', { class: 'feedback__hint' }, where ? h('b', {}, `${where} `) : null, copy.hint),
      energyLost ? h('p', { class: 'feedback__note' }, icon('energy'), ` −1 energia. ${pick(ENCOURAGEMENTS)}`) : null,
      h('div', { class: 'feedback__actions' },
        h('button', { class: 'pbtn', type: 'button', onClick: () => this.showHint() }, icon('hint'), 'Dica'),
        h('button', { class: 'pbtn pbtn--primary', type: 'button', onClick: () => this.retry() }, energyLost ? 'Tentar de novo' : 'Ok')));
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
      title: 'Dica',
      body: h('div', { class: 'hint' }, mentorPortrait(this.mentor.id, this.ctx.theme.colors, { scale: 3 }),
        h('div', {}, h('strong', {}, this.mentor.name), h('p', {}, this.session.nextHint()))),
      actions: [{ label: 'Entendi', value: true, primary: true }],
    });
  }

  async noEnergy(outcome) {
    const { game, sfx, toast } = this.ctx;
    const price = game.content.economy.energyRefillPrice;
    const { coins } = game.playerSummary.execute();
    this.ctx.sfx('wrong');
    const choice = await this.ask({
      title: 'Sem energia!',
      iconName: 'energy',
      body: h('p', {}, `O Bit precisa descansar. A próxima energia chega em ${formatCountdown(outcome.msUntilNext)}.`),
      actions: [
        coins >= price ? { label: `Recarregar: ${price} moedas`, value: 'refill', primary: true, icon: 'coin' } : null,
        { label: 'Voltar ao mapa', value: 'map', primary: coins < price },
      ].filter(Boolean),
    });
    if (choice === 'refill' && game.refillEnergy.execute().ok) {
      sfx('coin');
      toast.show({ title: 'Energia cheia!', iconName: 'energy' });
      this.renderEnergy();
    } else if (choice === 'map') {
      this.ctx.nav.go('map');
    }
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
