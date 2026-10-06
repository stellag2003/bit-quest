import { NodeStatus } from '../../domain/ProgressionRules.js';
import { Screen } from '../Screen.js';
import { starRow, topBar } from '../components/hud.js';
import { mentorPortrait } from '../components/mentorViews.js';
import { spriteCanvas } from '../pixel/draw.js';
import { icon } from '../pixel/icons.js';
import { ROBOT } from '../pixel/sprites.js';
import { formatCountdown, h } from '../ui/dom.js';

const STATUS_TEXT = { locked: 'bloqueado', available: 'disponível', completed: 'concluído' };

export class MapScreen extends Screen {
  render() {
    const { game, theme } = this.ctx;
    const summary = game.playerSummary.execute();
    const { fases, next } = game.mapOverview.execute();
    const mentors = game.content.mentors;
    this.nextKey = next ? next.challengeId ?? `lesson-${next.faseId}` : null;

    const sections = fases.map((fase) => {
      const mentor = mentors.find((m) => m.id === fase.mentorId);
      const reward = mentors.find((m) => m.id === game.curriculum.fase(fase.id).reward.mentorId);
      const nodes = [
        this.node({ key: `lesson-${fase.id}`, kind: 'lesson', label: 'Lição', status: fase.lesson.status, onOpen: () => this.ctx.nav.go('lesson', { faseId: fase.id }) }),
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

      return h('section', { class: `fase fase--${fase.scenery} ${fase.unlocked ? '' : 'is-locked'} ${fase.completed ? 'is-complete' : ''}`, 'aria-label': `Fase ${fase.number}: ${fase.title}` },
        h('header', { class: 'fase__banner' },
          fase.unlocked ? mentorPortrait(mentor.id, theme.colors, { scale: 2 }) : h('span', { class: 'fase__lock' }, icon('lock')),
          h('div', {},
            h('span', { class: 'fase__number' }, `Fase ${fase.number}`),
            h('h2', { class: 'fase__title' }, fase.title),
            !fase.unlocked ? h('p', { class: 'fase__hint' }, fase.lockedHint) : null)),
        h('ol', { class: 'trail' }, nodes),
        h('div', { class: `fase__reward ${rewardUnlocked ? 'is-open' : ''}` },
          mentorPortrait(reward.id, theme.colors, { scale: 2, locked: !rewardUnlocked }),
          h('span', {}, rewardUnlocked ? `${reward.name} desbloqueado` : 'Complete a fase para conhecer um novo mentor')));
    });

    this.root.append(
      topBar({ title: 'Mapa', onBack: () => this.onBack(), summary, backIcon: 'home' }),
      h('div', { class: 'map', tabindex: '-1' }, sections),
    );
    this.every(() => this.updateTimer(), 1000);
    requestAnimationFrame(() => this.root.querySelector('.node.is-next')?.scrollIntoView({ block: 'center' }));
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
        'aria-label': `${label}, ${STATUS_TEXT[status]}`,
        'data-autofocus': isNext ? '' : null,
        onClick: () => (status === NodeStatus.LOCKED ? this.explainLocked(kind) : onOpen()),
      }, badge),
      h('span', { class: 'node__label' }, label),
      kind === 'challenge' && status === NodeStatus.COMPLETED ? starRow(stars, 3, 'stars--small') : null);
  }

  explainLocked(kind) {
    this.ctx.sfx('wrong');
    this.ctx.toast.show({
      title: 'Ainda bloqueado',
      text: kind === 'lesson' ? 'Complete a fase anterior primeiro.' : 'Faça a lição e o desafio anterior.',
      iconName: 'lock',
    });
  }

  updateTimer() {
    const el = this.root.querySelector('[data-energy-timer]');
    if (!el) return;
    const { energy } = this.ctx.game.playerSummary.execute();
    if (energy.value >= energy.max) this.ctx.nav.refresh();
    else el.textContent = `+1 em ${formatCountdown(energy.msUntilNext)}`;
  }

  onBack() {
    this.ctx.nav.go('home');
  }
}
