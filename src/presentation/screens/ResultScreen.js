import { PRAISE } from '../../content/feedback.js';
import { REWARDS } from '../../domain/scoring.js';
import { Screen } from '../Screen.js';
import { starRow } from '../components/hud.js';
import { mentorPortrait } from '../components/mentorViews.js';
import { icon } from '../pixel/icons.js';
import { h, pick, reducedMotion, tween } from '../ui/dom.js';

export class ResultScreen extends Screen {
  get music() {
    return null;
  }

  get legend() {
    return [['A', 'continuar'], ['B', 'mapa']];
  }

  render() {
    const { outcome, challengeId } = this.params;
    if (!outcome) return this.later(() => this.ctx.nav.go('map'), 0);
    const { game, theme } = this.ctx;
    const { fase, challenge } = game.curriculum.findChallenge(challengeId);
    const mentor = game.content.mentors.find((m) => m.id === fase.mentorId);
    this.outcome = outcome;

    this.stars = starRow(0, 3, 'stars--big');
    this.xpEl = h('span', { class: 'reward__value' }, '+0');
    this.coinEl = h('span', { class: 'reward__value' }, '+0');

    this.root.append(
      h('div', { class: `result ${outcome.faseCompleted ? 'result--fase' : ''}` },
        h('p', { class: 'result__kicker' }, outcome.faseCompleted ? `Fase ${fase.number}: ${fase.title}` : challenge.title),
        h('h1', { class: 'result__title' }, outcome.faseCompleted ? 'Fase completa!' : 'Desafio completo!'),
        this.stars,
        h('p', { class: 'result__praise' }, outcome.stars === 3 ? pick(PRAISE) : this.starTip(challenge)),
        h('div', { class: 'rewards' },
          h('div', { class: 'reward' }, h('span', { class: 'reward__label' }, 'XP'), this.xpEl),
          h('div', { class: 'reward' }, icon('coin'), this.coinEl)),
        outcome.reward.faseBonus ? h('p', { class: 'result__note' }, `Bônus de fase incluído: +${REWARDS.faseBonusXp} XP e +${REWARDS.faseBonusCoins} moedas`) : null,
        outcome.levelUp ? h('p', { class: 'result__note result__note--level' }, icon('trophy'), ` Você subiu para o nível ${outcome.level}!`) : null,
        this.loopSavings(challenge),
        challenge.successMessage ? h('div', { class: 'result__message panel' }, mentorPortrait(mentor.id, theme.colors, { scale: 2 }), h('p', {}, challenge.successMessage)) : null,
        outcome.achievements.length ? h('ul', { class: 'medals-earned' }, outcome.achievements.map((a) =>
          h('li', {}, icon(a.icon), h('span', {}, h('strong', {}, 'Nova medalha: '), a.title)))) : null,
        outcome.mentorUnlocked ? h('p', { class: 'result__note result__note--mentor' }, icon('person'), ' Um novo mentor quer conhecer você!') : null,
        h('div', { class: 'result__actions' },
          h('button', { class: 'pbtn', type: 'button', onClick: () => this.ctx.nav.go('challenge', { challengeId }) }, 'Jogar de novo'),
          h('button', { class: 'pbtn pbtn--primary', type: 'button', 'data-autofocus': '', onClick: () => this.continue() }, outcome.mentorUnlocked ? 'Conhecer mentor' : 'Continuar'))),
    );

    if (outcome.faseCompleted) this.ctx.bus.emit('song', 'victory');
    this.animate();
  }

  starTip(challenge) {
    const { evaluation } = this.outcome;
    if (challenge.optimalBlocks && evaluation.blocksUsed > challenge.optimalBlocks) return 'Funcionou! Dá para fazer com menos blocos.';
    return 'Funcionou! Acerte de primeira para ganhar 3 estrelas.';
  }

  /** SPEC-004: show how many commands the loop saved. */
  loopSavings(challenge) {
    const uses = challenge.palette?.includes('repeat');
    if (!uses) return null;
    const { blocksUsed, commandsExecuted } = this.outcome.evaluation;
    if (commandsExecuted <= blocksUsed) return null;
    const pct = Math.max(8, Math.round((blocksUsed / commandsExecuted) * 100));
    return h('div', { class: 'savings panel', 'aria-label': `Sem loop: ${commandsExecuted} comandos. Com loop: ${blocksUsed} blocos.` },
      h('div', { class: 'savings__row' }, h('span', {}, 'Sem loop'), h('span', { class: 'savings__bar' }, h('i', { style: { '--w': '100%' } })), h('b', {}, commandsExecuted)),
      h('div', { class: 'savings__row' }, h('span', {}, 'Com loop'), h('span', { class: 'savings__bar' }, h('i', { style: { '--w': `${pct}%` } })), h('b', {}, blocksUsed)),
      h('p', {}, `Você economizou ${commandsExecuted - blocksUsed} blocos!`));
  }

  async animate() {
    const { stars, reward } = this.outcome;
    const fast = reducedMotion();
    const starEls = [...this.stars.querySelectorAll('.star')];
    for (let i = 0; i < stars; i += 1) {
      await new Promise((resolve) => this.later(resolve, fast ? 0 : 380));
      starEls[i].classList.add('is-on', 'is-pop');
      this.ctx.sfx('star');
    }
    this.stars.setAttribute('aria-label', `${stars} de 3 estrelas`);
    await this.countUp(this.xpEl, reward.xp, 'xp', fast);
    await this.countUp(this.coinEl, reward.coins, 'coin', fast);
  }

  async countUp(el, value, sound, fast) {
    if (!this.root.isConnected) return;
    if (fast || value === 0) {
      el.textContent = `+${value}`;
      return;
    }
    let last = -1;
    await tween(Math.min(900, 80 * value), (t) => {
      const shown = Math.round(value * t);
      if (shown !== last && shown % 5 === 0) this.ctx.sfx(sound);
      last = shown;
      el.textContent = `+${shown}`;
    });
  }

  continue() {
    if (this.outcome.mentorUnlocked) this.ctx.nav.go('mentor', { mentorId: this.outcome.mentorUnlocked });
    else this.ctx.nav.go('map');
  }

  onStart() {
    this.continue();
  }

  onBack() {
    this.ctx.nav.go('map');
  }
}
