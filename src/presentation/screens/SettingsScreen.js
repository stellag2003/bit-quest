import { Screen } from '../Screen.js';
import { statChip } from '../components/hud.js';
import { languagePicker } from '../components/languagePicker.js';
import { icon } from '../pixel/icons.js';
import { t } from '../i18n/index.js';
import { h } from '../ui/dom.js';

const controls = () => [
  [t('controls.touch'), t('controls.touchDo')],
  [t('controls.dpad'), t('controls.dpadDo')],
  ['A / Z / Enter', t('controls.aDo')],
  ['B / X / Esc', t('controls.bDo')],
  [t('controls.space'), t('controls.spaceDo')],
  ['Shift', t('controls.shiftDo')],
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
    }, icon(iconName), h('span', {}, label), h('b', { class: 'toggle__state' }, s.settings[key] ? t('settings.on') : t('settings.off')));

    this.resetBtn = h('button', { class: 'pbtn pbtn--danger', type: 'button', onClick: () => this.reset() }, icon('trash'), t('settings.reset'));

    this.root.append(
      h('header', { class: 'topbar' },
        h('button', { class: 'iconbtn', type: 'button', 'aria-label': t('common.back'), onClick: () => this.onBack() }, icon('back')),
        h('h1', { class: 'topbar__title' }, t('settings.title')),
        h('div', { class: 'topbar__stats' }, statChip('coin', s.coins, t('common.coins')))),
      h('div', { class: 'settings' },
        h('section', {}, h('h2', {}, t('settings.language')), languagePicker(this.ctx)),
        h('section', { class: 'settings__colors' },
          h('h2', {}, t('settings.colors')),
          h('p', { class: 'settings__note' }, icon('music'), ` ${t('settings.colorsNote')}`),
          h('div', { class: 'swatches' }, game.content.palettes.map((p) => this.swatch(p, s)))),
        h('section', {}, h('h2', {}, t('settings.sound')), toggle('sfx', t('settings.sfx'), 'soundOn'), toggle('music', t('settings.music'), 'music')),
        h('section', {}, h('h2', {}, t('settings.a11y')),
          toggle('largeText', t('settings.largeText'), 'book'),
          toggle('plainFont', t('settings.plainFont'), 'hint'),
          toggle('calmMotion', t('settings.calmMotion'), 'flag')),
        h('section', {}, h('h2', {}, t('settings.controls')), h('dl', { class: 'controls-list' }, controls().map(([k, v]) => [h('dt', {}, k), h('dd', {}, v)])),
          h('button', { class: 'pbtn', type: 'button', onClick: () => this.ctx.nav.go('guide') }, icon('hint'), t('home.howToPlay'))),
        h('section', {}, h('h2', {}, t('settings.progress')), this.resetBtn)),
    );
  }

  swatch(palette, summary) {
    const owned = summary.palettes.owned.includes(palette.id);
    const current = summary.palettes.current === palette.id;
    const status = current ? t('settings.using') : owned ? t('settings.use') : t('settings.price', { price: palette.price });
    return h('button', {
      class: `swatch ${current ? 'is-current' : ''} ${owned ? '' : 'is-for-sale'}`,
      type: 'button',
      'aria-pressed': String(current),
      'data-autofocus': current && this.params.focus === 'colors' ? '' : null,
      'aria-label': t('settings.swatchAria', { name: palette.name, song: palette.songName, status }),
      onClick: () => this.choosePalette(palette, owned),
    },
    h('span', { class: 'swatch__colors' }, palette.colors.map((c) => h('i', { style: { background: c } }))),
    h('strong', {}, palette.name),
    h('small', { class: 'swatch__song' }, icon('music'), ` ${palette.songName}`),
    h('small', {}, owned ? status : [icon('coin'), ` ${palette.price}`]));
  }

  choosePalette(palette, owned) {
    const { game, toast, sfx } = this.ctx;
    if (owned) return game.selectPalette.execute(palette.id);
    const result = game.purchasePalette.execute(palette.id);
    if (result.ok) {
      sfx('coin');
      toast.show({ title: t('settings.bought', { name: palette.name }), text: t('settings.newSong', { song: palette.songName }), iconName: 'music' });
    } else {
      sfx('wrong');
      toast.show({ title: t('settings.noCoins'), text: t('settings.noCoinsText', { n: result.missing }), iconName: 'coin' });
    }
  }

  reset() {
    if (!this.confirming) {
      this.confirming = true;
      this.resetBtn.replaceChildren(icon('trash'), t('settings.resetArmed'));
      this.resetBtn.classList.add('is-armed');
      this.later(() => {
        this.confirming = false;
        this.resetBtn.classList.remove('is-armed');
        this.resetBtn.replaceChildren(icon('trash'), t('settings.reset'));
      }, 3500);
      return;
    }
    this.ctx.game.resetProgress.execute();
    this.ctx.toast.show({ title: t('settings.resetDone'), text: t('settings.resetDoneText'), iconName: 'check' });
    this.ctx.nav.go('home');
  }

  onBack() {
    this.ctx.nav.go('home');
  }
}
