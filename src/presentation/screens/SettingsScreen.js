import { Screen } from '../Screen.js';
import { statChip } from '../components/hud.js';
import { icon } from '../pixel/icons.js';
import { h } from '../ui/dom.js';

const CONTROLS = [
  ['Toque', 'escolher e montar blocos'],
  ['D-pad / setas', 'mover o cursor'],
  ['A / Z / Enter', 'confirmar'],
  ['B / X / Esc', 'voltar ou apagar bloco'],
  ['START / Espaço', 'executar programa'],
  ['SELECT / Shift', 'pedir dica'],
];

export class SettingsScreen extends Screen {
  render() {
    const { game } = this.ctx;
    const s = game.playerSummary.execute();
    const toggle = (key, label, iconName) => h('button', {
      class: `toggle ${s.settings[key] ? 'is-on' : ''}`,
      type: 'button',
      role: 'switch',
      'aria-checked': String(s.settings[key]),
      onClick: () => {
        game.updateSettings.execute({ [key]: !s.settings[key] });
        this.ctx.nav.refresh();
      },
    }, icon(iconName), h('span', {}, label), h('b', { class: 'toggle__state' }, s.settings[key] ? 'Ligado' : 'Desligado'));

    this.resetBtn = h('button', { class: 'pbtn pbtn--danger', type: 'button', onClick: () => this.reset() }, icon('trash'), 'Apagar progresso');

    this.root.append(
      h('header', { class: 'topbar' },
        h('button', { class: 'iconbtn', type: 'button', 'aria-label': 'Voltar', onClick: () => this.onBack() }, icon('back')),
        h('h1', { class: 'topbar__title' }, 'Ajustes'),
        h('div', { class: 'topbar__stats' }, statChip('coin', s.coins, 'Moedas'))),
      h('div', { class: 'settings' },
        h('section', {}, h('h2', {}, 'Som'), toggle('sfx', 'Efeitos', 'soundOn'), toggle('music', 'Música', 'music')),
        h('section', {}, h('h2', {}, 'Cor da tela'), h('div', { class: 'swatches' }, game.content.palettes.map((p) => this.swatch(p, s)))),
        h('section', {}, h('h2', {}, 'Controles'), h('dl', { class: 'controls-list' }, CONTROLS.map(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]))),
        h('section', {}, h('h2', {}, 'Progresso'), this.resetBtn)),
    );
  }

  swatch(palette, summary) {
    const owned = summary.palettes.owned.includes(palette.id);
    const current = summary.palettes.current === palette.id;
    const status = current ? 'Usando' : owned ? 'Usar' : `${palette.price} moedas`;
    return h('button', {
      class: `swatch ${current ? 'is-current' : ''} ${owned ? '' : 'is-for-sale'}`,
      type: 'button',
      'aria-pressed': String(current),
      'aria-label': `${palette.name}: ${status}`,
      onClick: () => this.choosePalette(palette, owned),
    },
    h('span', { class: 'swatch__colors' }, palette.colors.map((c) => h('i', { style: { background: c } }))),
    h('strong', {}, palette.name),
    h('small', {}, owned ? status : [icon('coin'), ` ${palette.price}`]));
  }

  choosePalette(palette, owned) {
    const { game, toast, sfx } = this.ctx;
    if (owned) return game.selectPalette.execute(palette.id);
    const result = game.purchasePalette.execute(palette.id);
    if (result.ok) {
      sfx('coin');
      toast.show({ title: `Tela ${palette.name} comprada!`, iconName: 'palette' });
    } else {
      sfx('wrong');
      toast.show({ title: 'Moedas insuficientes', text: `Faltam ${result.missing}. Complete desafios para ganhar mais.`, iconName: 'coin' });
    }
  }

  reset() {
    if (!this.confirming) {
      this.confirming = true;
      this.resetBtn.replaceChildren(icon('trash'), 'Toque de novo para apagar tudo');
      this.resetBtn.classList.add('is-armed');
      this.later(() => {
        this.confirming = false;
        this.resetBtn.classList.remove('is-armed');
        this.resetBtn.replaceChildren(icon('trash'), 'Apagar progresso');
      }, 3500);
      return;
    }
    this.ctx.game.resetProgress.execute();
    this.ctx.toast.show({ title: 'Progresso apagado', text: 'Uma nova aventura começa!', iconName: 'check' });
    this.ctx.nav.go('home');
  }

  onBack() {
    this.ctx.nav.go('home');
  }
}
