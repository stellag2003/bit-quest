/**
 * Composition root: the only place that knows every layer. It picks the
 * infrastructure (storage, clock, audio), builds the game and starts the UI.
 */
import { createGame } from './application/createGame.js';
import { CONTENT } from './content/index.js';
import { EventBus } from './core/EventBus.js';
import { ChiptuneAudio } from './infrastructure/audio/ChiptuneAudio.js';
import { SFX, SONGS } from './infrastructure/audio/soundBank.js';
import { LocalStorageRepository } from './infrastructure/LocalStorageRepository.js';
import { MemoryRepository } from './infrastructure/MemoryRepository.js';
import { SystemClock } from './infrastructure/SystemClock.js';
import { App } from './presentation/App.js';
import { AudioDirector } from './presentation/AudioDirector.js';
import { Toaster } from './presentation/components/Toast.js';
import { FocusNavigator } from './presentation/input/FocusNavigator.js';
import { InputController } from './presentation/input/InputController.js';
import { BootScreen } from './presentation/screens/BootScreen.js';
import { ChallengeScreen } from './presentation/screens/ChallengeScreen.js';
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
const game = createGame({ content: CONTENT, repository, clock: SystemClock, bus });

const theme = new ThemeService({ palettes: CONTENT.palettes, store: game.store, bus });
theme.start();

const audio = new ChiptuneAudio({ sfx: SFX, songs: SONGS });
new AudioDirector({ bus, audio, store: game.store }).start();
const sfx = (id) => bus.emit('sfx', id);

const buttons = Object.fromEntries(
  ['up', 'down', 'left', 'right', 'a', 'b', 'start', 'select'].map((name) => [name, $(`[data-btn="${name}"]`)]),
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
    map: MapScreen,
    lesson: LessonScreen,
    challenge: ChallengeScreen,
    result: ResultScreen,
    mentor: MentorUnlockScreen,
    library: LibraryScreen,
    settings: SettingsScreen,
  },
});
app.setContext({ game, bus, theme, sfx, nav: app, toast: new Toaster($('#overlay')) });
bus.on('theme:changed', () => app.refresh());

// Every on-screen button clicks, unless it plays its own sound.
$('#screen').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button && !button.disabled && button.dataset.sound !== 'none') sfx('press');
});

// The power LED doubles as a sound indicator.
const syncLed = ({ settings }) => document.body.classList.toggle('is-muted', !settings.sfx && !settings.music);
syncLed(game.store.get());
game.store.subscribe(syncLed);

if (new URLSearchParams(location.search).has('debug')) window.bitQuest = { game, app, bus };

app.go('boot');
