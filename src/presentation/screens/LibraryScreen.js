import { Screen } from '../Screen.js';
import { programStrip } from '../components/blocks.js';
import { mentorPortrait } from '../components/mentorViews.js';
import { icon } from '../pixel/icons.js';
import { t } from '../i18n/index.js';
import { h } from '../ui/dom.js';
import { mentorCard } from './mentorCard.js';

const TABS = [
  { id: 'mentors', icon: 'person' },
  { id: 'concepts', icon: 'book' },
  { id: 'medals', icon: 'trophy' },
];

/** "Aprender": mentors, concepts already learned and medals. */
export class LibraryScreen extends Screen {
  render() {
    this.tab = this.params.tab ?? 'mentors';
    this.detail = null;
    this.body = h('div', { class: 'library__body', role: 'tabpanel' });
    this.tabBar = h('div', { class: 'tabs', role: 'tablist', 'aria-label': t('library.sections') }, TABS.map((tab) =>
      h('button', { class: 'tab', type: 'button', role: 'tab', dataset: { tab: tab.id }, onClick: () => this.select(tab.id) }, icon(tab.icon), t(`library.${tab.id}`))));
    this.root.append(
      h('header', { class: 'topbar' },
        h('button', { class: 'iconbtn', type: 'button', 'aria-label': t('common.back'), onClick: () => this.handleBack() }, icon('back')),
        h('h1', { class: 'topbar__title' }, t('library.title'))),
      this.tabBar,
      this.body,
    );
    this.select(this.tab);
    // Opened from the map's mentor portrait: straight to that mentor's page.
    const mentor = this.ctx.game.content.mentors.find((m) => m.id === this.params.mentorId);
    if (mentor && this.ctx.game.playerSummary.execute().unlockedMentors.includes(mentor.id)) this.openMentor(mentor);
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
        'aria-label': unlocked ? m.name : t('mentor.lockedAria', { text: m.unlockText }),
        onClick: () => (unlocked ? this.openMentor(m) : this.ctx.toast.show({ title: t('mentor.locked'), text: m.unlockText, iconName: 'lock' })),
      },
      mentorPortrait(m.id, theme.colors, { scale: 3, locked: !unlocked }),
      h('strong', {}, unlocked ? m.name : '???'),
      h('small', {}, unlocked ? (s.mentor.id === m.id ? t('mentor.yourGuide') : m.area) : m.unlockText));
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
          this.ctx.toast.show({ title: t('mentor.nowGuide', { name: mentor.name }), iconName: 'person' });
          if (this.params.from === 'map') this.ctx.nav.go('map');
          else this.select('mentors');
        },
      }, isCurrent ? t('mentor.alreadyGuide') : t('mentor.choose'))));
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
            h('button', { class: 'pbtn', type: 'button', onClick: () => this.ctx.nav.go('lesson', { faseId: fase.id }) }, icon('book'), t('library.review'))]
          : h('p', {}, icon('lock'), ` ${t('library.lockedConcept', { title: fase.title })}`));
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
    if (this.params.from === 'map') return this.ctx.nav.go('map');
    if (this.detail) return this.select('mentors');
    this.ctx.nav.go('home');
  }
}
