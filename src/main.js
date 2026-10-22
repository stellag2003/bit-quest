/**
 * Composition root: the only place that knows every layer. It picks the
 * infrastructure (storage, clock, audio), builds the game and starts the UI.
 */
import { createGame } from './application/createGame.js';
import { CONTENT } from './content/index.js';
import { localizeContent } from './content/locales/index.js';
import { EventBus } from './core/EventBus.js';
import { ChiptuneAudio } from './infrastructure/audio/ChiptuneAudio.js';
import { SFX, SONGS } from './infrastructure/audio/soundBank.js';
import { LocalStorageRepository } from './infrastructure/LocalStorageRepository.js';
import { MemoryRepository } from './infrastructure/MemoryRepository.js';
import { SystemClock } from './infrastructure/SystemClock.js';
import { App } from './presentation/App.js';
import { AudioDirector } from './presentation/AudioDirector.js';
import { Toaster } from './presentation/components/Toast.js';
import { currentLanguage, resolveLanguage, setLanguage, t } from './presentation/i18n/index.js';
import { FocusNavigator } from './presentation/input/FocusNavigator.js';
import { InputController } from './presentation/input/InputController.js';
import { BootScreen } from './presentation/screens/BootScreen.js';
import { ChallengeScreen } from './presentation/screens/ChallengeScreen.js';
import { DifficultyScreen } from './presentation/screens/DifficultyScreen.js';
import { FinaleScreen } from './presentation/screens/FinaleScreen.js';
import { GuideScreen } from './presentation/screens/GuideScreen.js';
import { HomeScreen } from './presentation/screens/HomeScreen.js';
import { LessonScreen } from './presentation/screens/LessonScreen.js';
import { LibraryScreen } from './presentation/screens/LibraryScreen.js';
import { MapScreen } from './presentation/screens/MapScreen.js';
import { MentorUnlockScreen } from './presentation/screens/MentorUnlockScreen.js';
import { ResultScreen } from './presentation/screens/ResultScreen.js';
import { SettingsScreen } from './presentation/screens/SettingsScreen.js';
import { ThemeService } from './presentation/ThemeService.js';

const $ = (selector) => document.querySelector(selector);

const bus = new EventBus();
const repository = LocalStorageRepository.isAvailable() ? new LocalStorageRepository() : new MemoryRepository();
const lang = setLanguage(resolveLanguage(repository.load()?.settings?.lang, navigator.languages ?? [navigator.language]));
let game = createGame({ content: localizeContent(CONTENT, lang), repository, clock: SystemClock, bus });
translateShell();

const theme = new ThemeService({ palettes: CONTENT.palettes, store: game.store, bus });
theme.start();

const audio = new ChiptuneAudio({ sfx: SFX, songs: SONGS });
// 'theme' = the background song that comes with the current screen palette.
new AudioDirector({ bus, audio, store: game.store, resolveSong: (id) => (id === 'theme' ? theme.song : id) }).start();
const sfx = (id) => bus.emit('sfx', id);

const buttons = Object.fromEntries(
  ['up', 'down', 'left', 'right', 'a', 'b'].map((name) => [name, $(`[data-btn="${name}"]`)]),
);
const input = new InputController({ buttons, navigator: new FocusNavigator(), sfx, onFirstInteraction: () => audio.unlock() });
input.attach();
// Tablets only let audio start (or come back after sleeping) inside a real touch, and
// some count only the end of the touch: wake the audio on every kind of gesture.
for (const type of ['pointerup', 'touchend', 'click', 'keydown']) {
  window.addEventListener(type, () => audio.unlock(), { capture: true, passive: true });
}
// Leaving for another app: silence now, and the first touch back rebuilds the audio
// (phones often return a context that claims to play but stays mute).
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') audio.sleep();
});
window.addEventListener('pagehide', () => audio.sleep());

const app = new App({
  screenLayer: $('#screen'),
  legendEl: $('#legend'),
  bus,
  input,
  screens: {
    boot: BootScreen,
    home: HomeScreen,
    guide: GuideScreen,
    difficulty: DifficultyScreen,
    finale: FinaleScreen,
    map: MapScreen,
    lesson: LessonScreen,
    challenge: ChallengeScreen,
    result: ResultScreen,
    mentor: MentorUnlockScreen,
    library: LibraryScreen,
    settings: SettingsScreen,
  },
});
// Switching language rebuilds the game around the same progress store and redraws the
// current screen in place: no reload, so the music and the audio unlock survive.
const ctx = { game, bus, theme, sfx, nav: app, toast: new Toaster($('#overlay')) };
ctx.changeLanguage = (id) => {
  game.updateSettings.execute({ lang: setLanguage(id) });
  game = createGame({ content: localizeContent(CONTENT, id), repository, clock: SystemClock, bus, store: game.store });
  ctx.game = game;
  translateShell();
  app.refresh();
};
app.setContext(ctx);
bus.on('theme:changed', () => app.refresh());

// Every on-screen button clicks, unless it plays its own sound.
$('#screen').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button && !button.disabled && button.dataset.sound !== 'none') sfx('press');
});

// The power LED doubles as a sound indicator; accessibility settings become body classes.
const syncBody = ({ settings }) => {
  document.body.classList.toggle('is-muted', !settings.sfx && !settings.music);
  document.body.classList.toggle('is-large-text', settings.largeText);
  document.body.classList.toggle('is-plain-font', settings.plainFont);
  document.body.classList.toggle('is-calm', settings.calmMotion);
};
syncBody(game.store.get());
game.store.subscribe(syncBody);

if (new URLSearchParams(location.search).has('debug')) window.bitQuest = { get game() { return game; }, app, bus, audio };

/** Static text in index.html (console labels, ARIA) follows the chosen language. */
function translateShell() {
  document.documentElement.lang = currentLanguage().htmlLang;
  document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-title]').forEach((el) => el.setAttribute('title', t(el.dataset.i18nTitle)));
  document.querySelectorAll('[data-i18n-content]').forEach((el) => el.setAttribute('content', t(el.dataset.i18nContent)));
}

app.go('boot');
