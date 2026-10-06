import { Screen } from '../Screen.js';
import { clearHighlights, highlightStep, programStrip } from '../components/blocks.js';
import { MentorSpeech } from '../components/mentorViews.js';
import { WorldView } from '../components/WorldView.js';
import { icon } from '../pixel/icons.js';
import { h, sleep } from '../ui/dom.js';

/** Fase intro: 3 short slides, one with a live demo of a program running. */
export class LessonScreen extends Screen {
  get legend() {
    return [['A', 'próximo'], ['B', 'mapa']];
  }

  render() {
    const { game, theme, sfx } = this.ctx;
    this.fase = game.curriculum.fase(this.params.faseId);
    this.mentor = game.content.mentors.find((m) => m.id === this.fase.mentorId);
    this.index = 0;
    this.speech = new MentorSpeech({ mentor: this.mentor, colors: theme.colors, sfx });
    this.track(() => this.speech.stop());
    this.track(() => this.stopDemo());

    this.stage = h('div', { class: 'lesson__stage' });
    this.dots = h('div', { class: 'lesson__dots', 'aria-hidden': 'true' });
    this.nextBtn = h('button', { class: 'pbtn pbtn--primary', type: 'button', 'data-autofocus': '', onClick: () => this.next() });

    this.root.append(
      h('header', { class: 'lesson__head' },
        h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Voltar ao mapa', onClick: () => this.onBack() }, icon('back')),
        h('div', {}, h('span', { class: 'fase__number' }, `Fase ${this.fase.number} · Lição`), h('h1', { class: 'lesson__title' }, this.fase.title))),
      this.speech.el,
      this.stage,
      h('footer', { class: 'lesson__foot' }, this.dots, this.nextBtn),
    );
    this.show();
  }

  show() {
    const slide = this.fase.lesson[this.index];
    const last = this.index === this.fase.lesson.length - 1;
    this.stopDemo();
    this.stage.replaceChildren();
    this.nextBtn.replaceChildren(...(last ? [icon('play'), 'Começar desafios'] : ['Próximo']));
    this.dots.replaceChildren(...this.fase.lesson.map((_, i) => h('span', { class: i === this.index ? 'is-on' : '' })));
    this.speech.say(slide.text);

    if (slide.demo) this.startDemo(slide.demo);
    else if (slide.strip) this.stage.append(programStrip(slide.strip));
    else this.stage.append(this.conceptCard());
  }

  conceptCard() {
    const { concept } = this.fase;
    return h('div', { class: 'lesson__concept panel' },
      h('h2', {}, concept.title),
      h('p', {}, concept.summary),
      programStrip(concept.example, { compact: true }));
  }

  async startDemo(demo) {
    const view = new WorldView({ theme: this.ctx.theme, sfx: () => {}, scenery: this.fase.scenery, label: 'Exemplo animado' });
    const strip = programStrip(demo.program, { compact: true });
    this.stage.append(h('div', { class: 'lesson__demo' }, view.el, strip));
    view.setWorld(demo.map);
    this.demo = view;
    const run = this.ctx.game.evaluator.evaluate({ kind: demo.kind, maps: [demo.map] }, demo.program).runs[0];

    while (this.demo === view) {
      await sleep(600);
      if (this.demo !== view) break;
      await view.play(run, { onStep: (step) => highlightStep(strip, step) });
      await sleep(1100);
      if (this.demo !== view) break;
      clearHighlights(strip);
      view.reset();
    }
  }

  stopDemo() {
    this.demo?.destroy();
    this.demo = null;
  }

  next() {
    if (this.index < this.fase.lesson.length - 1) {
      this.index += 1;
      this.ctx.sfx('lesson');
      return this.show();
    }
    const next = this.ctx.game.completeLesson.execute(this.fase.id);
    const firstChallenge = this.fase.challenges[0].id;
    const target = next?.faseId === this.fase.id && next.type === 'challenge' ? next.challengeId : firstChallenge;
    this.ctx.nav.go('challenge', { challengeId: target });
  }

  onStart() {
    this.next();
  }

  onBack() {
    this.ctx.nav.go('map');
  }
}
