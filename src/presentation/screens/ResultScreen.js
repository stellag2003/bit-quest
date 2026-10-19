import { REWARDS } from '../../domain/scoring.js';
import { Screen } from '../Screen.js';
import { finaleDue } from './FinaleScreen.js';
import { starRow } from '../components/hud.js';
import { mentorPortrait } from '../components/mentorViews.js';
import { icon } from '../pixel/icons.js';
import { t } from '../i18n/index.js';
import { h, pick, reducedMotion, tween } from '../ui/dom.js';

export class ResultScreen extends Screen {
  get music() {
    return null;
  }

  get legend() {
    return [['A', t('legend.continue')], ['B', t('legend.map')]];
  }

  render() {
    const { outcome, challengeId } = this.params;
    if (!outcome) return this.later(() => this.ctx.nav.go('map'), 0);
    const { game, theme } = this.ctx;
    const { fase, challenge } = game.curriculum.findChallenge(challengeId);
    const mentor = game.playerSummary.execute().mentor; // the guide the player chose
    this.outcome = outcome;

    this.stars = starRow(0, 3, 'stars--big');
    this.xpEl = h('span', { class: 'reward__value' }, '+0');
    this.coinEl = h('span', { class: 'reward__value' }, '+0');

    this.root.append(
      h('div', { class: `result ${outcome.faseCompleted ? 'result--fase' : ''}` },
        h('p', { class: 'result__kicker' }, outcome.faseCompleted ? t('result.faseKicker', { n: fase.number, title: fase.title }) : challenge.title),
        h('h1', { class: 'result__title' }, outcome.faseCompleted ? t('result.faseDone') : t('result.challengeDone')),
        this.stars,
        h('p', { class: 'result__praise' }, outcome.stars === 3 ? pick(game.content.feedback.praise) : this.starTip(challenge)),
        h('div', { class: 'rewards' },
          h('div', { class: 'reward' }, h('span', { class: 'reward__label' }, 'XP'), this.xpEl),
          h('div', { class: 'reward' }, icon('coin'), this.coinEl)),
        outcome.reward.faseBonus ? h('p', { class: 'result__note' }, t('result.faseBonus', { xp: REWARDS.faseBonusXp, coins: REWARDS.faseBonusCoins })) : null,
        outcome.levelUp ? h('p', { class: 'result__note result__note--level' }, icon('trophy'), ` ${t('result.levelUp', { n: outcome.level })}`) : null,
        this.loopSavings(challenge),
        challenge.successMessage ? h('div', { class: 'result__message panel' }, mentorPortrait(mentor.id, theme.colors, { scale: 2 }), h('p', {}, challenge.successMessage)) : null,
        outcome.achievements.length ? h('ul', { class: 'medals-earned' }, outcome.achievements.map((a) =>
          h('li', {}, icon(a.icon), h('span', {}, h('strong', {}, t('result.newMedal')), a.title)))) : null,
        outcome.mentorUnlocked ? h('p', { class: 'result__note result__note--mentor' }, icon('person'), ` ${t('result.newMentor')}`) : null,
        h('div', { class: 'result__actions' },
          h('button', { class: 'pbtn', type: 'button', onClick: () => this.ctx.nav.go('challenge', { challengeId }) }, t('result.again')),
          h('button', { class: 'pbtn pbtn--primary', type: 'button', 'data-autofocus': '', onClick: () => this.continue() }, outcome.mentorUnlocked ? t('result.meetMentor') : t('result.continue')))),
    );

    this.ctx.bus.emit('song', outcome.faseCompleted ? 'victory' : 'win');
    this.animate();
  }

  starTip(challenge) {
    const { evaluation } = this.outcome;
    if (challenge.optimalBlocks && evaluation.blocksUsed > challenge.optimalBlocks) return t('result.fewerBlocks');
    return t('result.firstTry');
  }

  /** SPEC-004: show how many commands the loop saved. */
  loopSavings(challenge) {
    const uses = challenge.palette?.includes('repeat');
    if (!uses) return null;
    const { blocksUsed, commandsExecuted } = this.outcome.evaluation;
    if (commandsExecuted <= blocksUsed) return null;
    const pct = Math.max(8, Math.round((blocksUsed / commandsExecuted) * 100));
    return h('div', { class: 'savings panel', 'aria-label': t('result.savingsAria', { commands: commandsExecuted, blocks: blocksUsed }) },
      h('div', { class: 'savings__row' }, h('span', {}, t('result.withoutLoop')), h('span', { class: 'savings__bar' }, h('i', { style: { '--w': '100%' } })), h('b', {}, commandsExecuted)),
      h('div', { class: 'savings__row' }, h('span', {}, t('result.withLoop')), h('span', { class: 'savings__bar' }, h('i', { style: { '--w': `${pct}%` } })), h('b', {}, blocksUsed)),
      h('p', {}, t('result.saved', { n: commandsExecuted - blocksUsed })));
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
    this.stars.setAttribute('aria-label', t('stars.aria', { n: stars, max: 3 }));
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
    else this.ctx.nav.go(finaleDue(this.ctx.game) ? 'finale' : 'map');
  }

  onStart() {
    this.continue();
  }

  onBack() {
    this.ctx.nav.go('map');
  }
}
