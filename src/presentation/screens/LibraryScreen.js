import { Screen } from '../Screen.js';
import { programStrip } from '../components/blocks.js';
import { mentorPortrait } from '../components/mentorViews.js';
import { icon } from '../pixel/icons.js';
import { h } from '../ui/dom.js';
import { mentorCard } from './mentorCard.js';

const TABS = [
  { id: 'mentors', label: 'Mentores', icon: 'person' },
  { id: 'concepts', label: 'Conceitos', icon: 'book' },
  { id: 'medals', label: 'Medalhas', icon: 'trophy' },
];

/** "Aprender": mentors, concepts already learned and medals. */
export class LibraryScreen extends Screen {
  render() {
    this.tab = this.params.tab ?? 'mentors';
    this.detail = null;
    this.body = h('div', { class: 'library__body', role: 'tabpanel' });
    this.tabBar = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Seções' }, TABS.map((t) =>
      h('button', { class: 'tab', type: 'button', role: 'tab', dataset: { tab: t.id }, onClick: () => this.select(t.id) }, icon(t.icon), t.label)));
    this.root.append(
      h('header', { class: 'topbar' },
        h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Voltar', onClick: () => this.handleBack() }, icon('back')),
        h('h1', { class: 'topbar__title' }, 'Aprender')),
      this.tabBar,
      this.body,
    );
    this.select(this.tab);
  }

  select(tabId) {
    this.tab = tabId;
    this.detail = null;
    this.tabBar.querySelectorAll('.tab').forEach((el) => el.setAttribute('aria-selected', String(el.dataset.tab === tabId)));
    const views = { mentors: () => this.mentors(), concepts: () => this.concepts(), medals: () => this.medals() };
    this.body.replaceChildren(views[tabId]());
    this.body.scrollTop = 0;
  }

  mentors() {
    const { game, theme } = this.ctx;
    const s = game.playerSummary.execute();
    return h('div', { class: 'mentor-grid' }, game.content.mentors.map((m) => {
      const unlocked = s.unlockedMentors.includes(m.id);
      return h('button', {
        class: `mentor-tile ${unlocked ? '' : 'is-locked'} ${s.mentor.id === m.id ? 'is-current' : ''}`,
        type: 'button',
        'aria-label': unlocked ? m.name : `Mentor bloqueado. ${m.unlockText}`,
        onClick: () => (unlocked ? this.openMentor(m) : this.ctx.toast.show({ title: 'Mentor bloqueado', text: m.unlockText, iconName: 'lock' })),
      },
      mentorPortrait(m.id, theme.colors, { scale: 3, locked: !unlocked }),
      h('strong', {}, unlocked ? m.name : '???'),
      h('small', {}, unlocked ? (s.mentor.id === m.id ? 'Seu guia' : m.area) : m.unlockText));
    }));
  }

  openMentor(mentor) {
    const { game, theme } = this.ctx;
    const isCurrent = game.playerSummary.execute().mentor.id === mentor.id;
    this.detail = mentor.id;
    this.body.replaceChildren(h('div', { class: 'mentor-detail' },
      mentorPortrait(mentor.id, theme.colors, { scale: 4 }),
      mentorCard(mentor),
      h('button', {
        class: 'pbtn pbtn--primary',
        type: 'button',
        disabled: isCurrent,
        onClick: () => {
          game.selectMentor.execute(mentor.id);
          this.ctx.toast.show({ title: `${mentor.name} agora é seu guia`, iconName: 'person' });
          this.select('mentors');
        },
      }, isCurrent ? 'Já é seu guia' : 'Escolher como guia')));
    this.body.scrollTop = 0;
    this.body.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
  }

  concepts() {
    const { game } = this.ctx;
    const done = game.playerSummary.execute().lessonsDone;
    return h('div', { class: 'concepts' }, game.curriculum.fases.map((fase) => {
      const open = done.includes(fase.id);
      return h('article', { class: `concept panel ${open ? '' : 'is-locked'}` },
        h('h2', {}, open ? fase.concept.title : '???'),
        open
          ? [h('p', {}, fase.concept.summary), programStrip(fase.concept.example, { compact: true }),
            h('button', { class: 'pbtn', type: 'button', onClick: () => this.ctx.nav.go('lesson', { faseId: fase.id }) }, icon('book'), 'Rever lição')]
          : h('p', {}, icon('lock'), ` Faça a lição da fase ${fase.title}.`));
    }));
  }

  medals() {
    const { game } = this.ctx;
    const earned = game.playerSummary.execute().achievements;
    return h('ul', { class: 'medals' }, game.content.achievements.map((a) => {
      const has = earned.includes(a.id);
      return h('li', { class: `medal ${has ? 'is-earned' : ''}` },
        h('span', { class: 'medal__badge' }, icon(has ? a.icon : 'lock')),
        h('div', {}, h('strong', {}, a.title), h('small', {}, a.description)));
    }));
  }

  onBack() {
    if (this.detail) return this.select('mentors');
    this.ctx.nav.go('home');
  }
}
