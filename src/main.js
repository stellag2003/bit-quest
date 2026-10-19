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
// The language is fixed for the page's lifetime: switching saves it and reloads.
const RESUME_KEY = 'bitquest:resume';
const lang = setLanguage(resolveLanguage(repository.load()?.settings?.lang, navigator.languages ?? [navigator.language]));
const game = createGame({ content: localizeContent(CONTENT, lang), repository, clock: SystemClock, bus });
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

const app = new App({
  screenLayer: $('#screen'),
  legendEl: $('#legend'),
  bus,
  input,
  screens: {
    boot: BootScreen,
    home: HomeScreen,
    guide: GuideScreen,
    map: MapScreen,
    lesson: LessonScreen,
    challenge: ChallengeScreen,
    result: ResultScreen,
    mentor: MentorUnlockScreen,
    library: LibraryScreen,
    settings: SettingsScreen,
  },
});
const changeLanguage = (id) => {
  game.updateSettings.execute({ lang: id });
  try { sessionStorage.setItem(RESUME_KEY, app.currentName); } catch { /* storage blocked: restart at boot */ }
  location.reload();
};
app.setContext({ game, bus, theme, sfx, nav: app, toast: new Toaster($('#overlay')), changeLanguage });
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

if (new URLSearchParams(location.search).has('debug')) window.bitQuest = { game, app, bus, audio };

/** Static text in index.html (console labels, ARIA) follows the chosen language. */
function translateShell() {
  document.documentElement.lang = currentLanguage().htmlLang;
  document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  document.querySelectorAll('[data-i18n-title]').forEach((el) => el.setAttribute('title', t(el.dataset.i18nTitle)));
  document.querySelectorAll('[data-i18n-content]').forEach((el) => el.setAttribute('content', t(el.dataset.i18nContent)));
}

let resume = null;
try {
  resume = sessionStorage.getItem(RESUME_KEY);
  sessionStorage.removeItem(RESUME_KEY);
} catch { /* storage blocked */ }
if (resume === 'settings' || resume === 'home' || resume === 'guide') {
  document.body.classList.add('is-powered');
  app.go(resume);
} else {
  app.go('boot');
}
