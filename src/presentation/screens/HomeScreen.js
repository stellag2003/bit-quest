import { Screen } from '../Screen.js';
import { energyMeter, statChip, xpBar } from '../components/hud.js';
import { MentorSpeech } from '../components/mentorViews.js';
import { spriteCanvas } from '../pixel/draw.js';
import { icon } from '../pixel/icons.js';
import { ROBOT } from '../pixel/sprites.js';
import { h } from '../ui/dom.js';

export class HomeScreen extends Screen {
  get legend() {
    return [['A', 'escolher'], ['START', 'jogar']];
  }

  render() {
    const { game, theme, sfx } = this.ctx;
    const s = game.playerSummary.execute();
    const soundOn = s.settings.sfx || s.settings.music;

    const robot = spriteCanvas(ROBOT.S[0], theme.colors, 4);
    robot.classList.add('home__robot');
    robot.setAttribute('aria-hidden', 'true');

    const speech = new MentorSpeech({ mentor: s.mentor, colors: theme.colors, sfx, compact: true });
    this.track(() => speech.stop());

    this.root.append(
      h('div', { class: 'home__top' },
        h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Ajustes', onClick: () => this.ctx.nav.go('settings') }, icon('gear')),
        h('div', { class: 'home__chips' },
          h('span', { class: 'stat stat--streak', 'aria-label': `Sequência: ${s.streak} dias` }, icon('flame'), h('span', { class: 'stat__value' }, s.streak), h('small', {}, s.streak === 1 ? 'dia' : 'dias')),
          statChip('coin', s.coins, 'Moedas'),
          energyMeter(s.energy)),
        h('button', {
          class: 'iconbtn',
          type: 'button',
          'aria-label': soundOn ? 'Desligar som' : 'Ligar som',
          'aria-pressed': String(soundOn),
          onClick: () => {
            game.updateSettings.execute({ sfx: !soundOn, music: !soundOn });
            this.ctx.nav.refresh();
          },
        }, icon(soundOn ? 'soundOn' : 'soundOff'))),
      h('div', { class: 'home__hero' },
        h('h1', { class: 'logo' }, h('span', { class: 'logo__bit' }, 'Bit'), h('span', { class: 'logo__quest' }, 'Quest')),
        robot),
      speech.el,
      xpBar(s),
      h('div', { class: 'home__actions' },
        h('button', { class: 'pbtn pbtn--primary pbtn--big', type: 'button', 'data-autofocus': '', onClick: () => this.ctx.nav.go('map') }, icon('play'), 'Jogar'),
        h('button', { class: 'pbtn', type: 'button', onClick: () => this.ctx.nav.go('library') }, icon('book'), 'Aprender')),
      h('p', { class: 'home__progress' },
        h('span', {}, icon('flag'), ` ${s.completedChallenges}/${s.totalChallenges} desafios`),
        h('span', {}, icon('star'), ` ${s.stars}/${s.maxStars}`)),
    );

    this.later(() => speech.say(this.greeting(s)), 250);
  }

  greeting(summary) {
    const { game } = this.ctx;
    const next = game.mapOverview.execute().next;
    if (!next) return 'Você completou todas as fases! Que tal buscar 3 estrelas em tudo?';
    const fase = game.curriculum.fase(next.faseId);
    if (next.type === 'lesson') {
      return summary.completedChallenges === 0
        ? 'Oi! Eu ajudo você a ensinar o Bit. Toque em Jogar!'
        : `Nova fase liberada: ${fase.title}. Vamos lá?`;
    }
    const { challenge } = game.curriculum.findChallenge(next.challengeId);
    return `Próximo desafio: ${challenge.title}.`;
  }

  onStart() {
    this.ctx.nav.go('map');
  }

  onBack() {}
}
