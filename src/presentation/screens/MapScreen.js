import { NodeStatus } from '../../domain/ProgressionRules.js';
import { Screen } from '../Screen.js';
import { openEnergyDialog } from '../components/energyDialog.js';
import { starRow, topBar } from '../components/hud.js';
import { mentorPortrait } from '../components/mentorViews.js';
import { spriteCanvas } from '../pixel/draw.js';
import { icon } from '../pixel/icons.js';
import { t } from '../i18n/index.js';
import { ROBOT } from '../pixel/sprites.js';
import { formatCountdown, h } from '../ui/dom.js';

export class MapScreen extends Screen {
  render() {
    const { game, theme } = this.ctx;
    const summary = game.playerSummary.execute();
    const { fases, next } = game.mapOverview.execute();
    const mentors = game.content.mentors;
    this.nextKey = next ? next.challengeId ?? `lesson-${next.faseId}` : null;

    const sections = fases.map((fase) => {
      const reward = mentors.find((m) => m.id === game.curriculum.fase(fase.id).reward.mentorId);
      const nodes = [
        this.node({ key: `lesson-${fase.id}`, kind: 'lesson', label: t('map.lesson'), status: fase.lesson.status, onOpen: () => this.ctx.nav.go('lesson', { faseId: fase.id }) }),
        ...fase.challenges.map((c) => this.node({
          key: c.id,
          kind: 'challenge',
          number: c.number,
          label: c.title,
          status: c.status,
          stars: c.stars,
          onOpen: () => this.ctx.nav.go('challenge', { challengeId: c.id }),
        })),
      ];
      const rewardUnlocked = summary.unlockedMentors.includes(reward.id);

      return h('section', { class: `fase fase--${fase.scenery} ${fase.unlocked ? '' : 'is-locked'} ${fase.completed ? 'is-complete' : ''}`, 'aria-label': t('map.faseAria', { n: fase.number, title: fase.title }) },
        h('header', { class: 'fase__banner' },
          h('span', { class: 'fase__lock', 'aria-hidden': 'true' }, fase.unlocked ? h('b', { class: 'fase__num' }, fase.number) : icon('lock')),
          h('div', {},
            h('span', { class: 'fase__number' }, t('map.fase', { n: fase.number })),
            h('h2', { class: 'fase__title' }, fase.title),
            !fase.unlocked && fase.previousTitle ? h('p', { class: 'fase__hint' }, t('map.lockedHint', { title: fase.previousTitle })) : null)),
        h('ol', { class: 'trail' }, nodes),
        h('div', { class: `fase__reward ${rewardUnlocked ? 'is-open' : ''}` },
          mentorPortrait(reward.id, theme.colors, { scale: 2, locked: !rewardUnlocked }),
          h('span', {}, rewardUnlocked ? t('map.rewardOpen', { name: reward.name }) : t('map.rewardLocked'))));
    });

    this.root.append(
      topBar({ title: t('map.title'), onBack: () => this.onBack(), summary, backIcon: 'home', onEnergy: () => this.showEnergy() }),
      h('div', { class: 'map', tabindex: '-1' }, sections),
    );
    this.every(() => this.updateTimer(), 1000);
    requestAnimationFrame(() => this.root.querySelector('.node.is-next')?.scrollIntoView({ block: 'center' }));
  }

  async showEnergy() {
    if (await openEnergyDialog(this) === 'refilled') this.ctx.nav.refresh();
  }

  node({ key, kind, number, label, status, stars = 0, onOpen }) {
    const isNext = key === this.nextKey;
    const badge = kind === 'lesson' ? icon('book') : status === NodeStatus.LOCKED ? icon('lock') : h('span', { class: 'node__num' }, number);
    const marker = isNext ? spriteCanvas(ROBOT.S[0], this.ctx.theme.colors, 2) : null;
    marker?.classList.add('node__marker');
    return h('li', { class: `node node--${kind} is-${status} ${isNext ? 'is-next' : ''}` },
      marker,
      h('button', {
        class: 'node__btn',
        type: 'button',
        'aria-label': `${label}, ${t(`status.${status}`)}`,
        'data-autofocus': isNext ? '' : null,
        onClick: () => (status === NodeStatus.LOCKED ? this.explainLocked(kind) : onOpen()),
      }, badge),
      h('span', { class: 'node__label' }, label),
      kind === 'challenge' && status === NodeStatus.COMPLETED ? starRow(stars, 3, 'stars--small') : null);
  }

  explainLocked(kind) {
    this.ctx.sfx('wrong');
    this.ctx.toast.show({
      title: t('map.locked'),
      text: kind === 'lesson' ? t('map.lockedLesson') : t('map.lockedChallenge'),
      iconName: 'lock',
    });
  }

  updateTimer() {
    const el = this.root.querySelector('[data-energy-timer]');
    if (!el) return;
    const { energy } = this.ctx.game.playerSummary.execute();
    if (energy.value >= energy.max) this.ctx.nav.refresh();
    else el.textContent = t('energy.timer', { time: formatCountdown(energy.msUntilNext) });
  }

  onBack() {
    this.ctx.nav.go('home');
  }
}
