import { Screen } from '../Screen.js';
import { openEnergyDialog } from '../components/energyDialog.js';
import { energyMeter, statChip, xpBar } from '../components/hud.js';
import { MentorSpeech } from '../components/mentorViews.js';
import { spriteCanvas } from '../pixel/draw.js';
import { icon } from '../pixel/icons.js';
import { t, tn } from '../i18n/index.js';
import { portraitCanvas } from '../pixel/portrait.js';
import { ROBOT } from '../pixel/sprites.js';
import { h } from '../ui/dom.js';

export class HomeScreen extends Screen {
  get legend() {
    return [['A', t('legend.choose')]];
  }

  render() {
    const { game, theme, sfx } = this.ctx;
    const s = game.playerSummary.execute();
    const soundOn = s.settings.sfx || s.settings.music;

    const robot = spriteCanvas(ROBOT.S[0], theme.colors, 4);
    robot.classList.add('home__robot');
    robot.setAttribute('aria-hidden', 'true');
    const heroArt = portraitCanvas('hero', { scale: 2 });
    heroArt.classList.add('home__hero-art');
    heroArt.setAttribute('aria-hidden', 'true');
    const hero = h('figure', { class: 'home__mary' }, heroArt, h('figcaption', {}, game.content.hero.name));

    const speech = new MentorSpeech({ mentor: s.mentor, colors: theme.colors, sfx, compact: true });
    this.track(() => speech.stop());

    this.root.append(
      h('div', { class: 'home__top' },
        h('div', { class: 'home__tools' },
          h('button', { class: 'iconbtn', type: 'button', 'aria-label': t('home.settings'), onClick: () => this.ctx.nav.go('settings') }, icon('gear')),
          h('button', { class: 'iconbtn', type: 'button', 'aria-label': t('home.howToPlay'), onClick: () => this.ctx.nav.go('guide') }, icon('hint'))),
        h('div', { class: 'home__chips' },
          h('span', { class: 'stat stat--streak', 'aria-label': t('home.streakAria', { n: s.streak }) }, icon('flame'), h('span', { class: 'stat__value' }, s.streak), h('small', {}, tn('home.day', s.streak))),
          statChip('coin', s.coins, t('common.coins')),
          energyMeter(s.energy, { onClick: () => this.showEnergy() })),
        h('button', {
          class: 'iconbtn',
          type: 'button',
          'aria-label': soundOn ? t('home.soundOff') : t('home.soundOn'),
          'aria-pressed': String(soundOn),
          onClick: () => {
            game.updateSettings.execute({ sfx: !soundOn, music: !soundOn });
            this.ctx.nav.refresh();
          },
        }, icon(soundOn ? 'soundOn' : 'soundOff'))),
      h('div', { class: 'home__hero' },
        h('h1', { class: 'logo' }, h('span', { class: 'logo__bit' }, 'Bit'), h('span', { class: 'logo__quest' }, 'Quest')),
        h('div', { class: 'home__duo' }, hero, robot)),
      speech.el,
      xpBar(s),
      h('div', { class: 'home__actions' },
        h('button', { class: 'pbtn pbtn--primary pbtn--big', type: 'button', 'data-autofocus': '', onClick: () => this.ctx.nav.go('map') }, icon('play'), t('home.play')),
        h('div', { class: 'home__row' },
          h('button', { class: 'pbtn', type: 'button', onClick: () => this.ctx.nav.go('library') }, icon('book'), t('home.learn')),
          this.colorsButton(s))),
      s.gameCompleted ? h('button', { class: 'pbtn home__certificate', type: 'button', onClick: () => this.ctx.nav.go('finale') }, icon('trophy'), t('finale.viewCertificate')) : null,
      h('p', { class: 'home__progress' },
        h('span', {}, icon('flag'), ` ${t('home.challenges', { done: s.completedChallenges, total: s.totalChallenges })}`),
        h('span', {}, icon('star'), ` ${s.stars}/${s.maxStars}`),
        h('button', { class: 'home__level', type: 'button', onClick: () => this.ctx.nav.go('difficulty', { from: 'settings' }) },
          icon(game.currentDifficulty.execute().icon), ` ${t(`difficulty.${game.currentDifficulty.execute().id}`)}`)),
    );

    this.later(() => speech.say(this.greeting(s)), 250);
  }

  /** Shortcut to the palettes, previewing the current one so colors (and their songs) are easy to find. */
  colorsButton(summary) {
    const { palettes } = this.ctx.game.content;
    const current = palettes.find((p) => p.id === summary.palettes.current) ?? palettes[0];
    const forSale = palettes.length - summary.palettes.owned.length;
    return h('button', {
      class: 'pbtn home__colors',
      type: 'button',
      'aria-label': `${t('home.colorsAria', { name: current.name })}${forSale ? ` ${t('home.colorsForSale', { n: forSale })}` : ''}`,
      onClick: () => this.ctx.nav.go('settings', { focus: 'colors' }),
    },
    h('span', { class: 'home__swatch', 'aria-hidden': 'true' }, current.colors.map((c) => h('i', { style: { background: c } }))),
    t('home.colors'),
    forSale ? h('b', { class: 'home__badge', 'aria-hidden': 'true' }, forSale) : null);
  }

  async showEnergy() {
    if (await openEnergyDialog(this) === 'refilled') this.ctx.nav.refresh();
  }

  greeting(summary) {
    const { game } = this.ctx;
    const next = game.mapOverview.execute().next;
    if (!next) return t('home.greet.done');
    const fase = game.curriculum.fase(next.faseId);
    if (next.type === 'lesson') {
      return summary.completedChallenges === 0
        ? t('home.greet.first')
        : t('home.greet.newFase', { title: fase.title });
    }
    const { challenge } = game.curriculum.findChallenge(next.challengeId);
    return t('home.greet.next', { title: challenge.title });
  }

  onStart() {
    this.ctx.nav.go('map');
  }

  onBack() {}
}
