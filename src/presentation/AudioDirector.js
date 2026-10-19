/**
 * Connects presentation events to the audio port and keeps it in sync with
 * the player's settings. Screens never call the synthesiser directly.
 * `resolveSong` turns a screen's music role (e.g. 'theme') into a song id.
 */
export class AudioDirector {
  constructor({ bus, audio, store, resolveSong = (id) => id }) {
    Object.assign(this, { bus, audio, store, resolveSong });
  }

  start() {
    this.bus.on('sfx', (id) => id && this.audio.play(id));
    this.bus.on('song', (id) => this.audio.playSong(id));
    this.bus.on('screen:changed', ({ music }) => (music ? this.audio.playSong(this.resolveSong(music)) : this.audio.stopMusic()));
    const sync = ({ settings }) => {
      this.audio.setSfxEnabled(settings.sfx);
      this.audio.setMusicEnabled(settings.music);
    };
    sync(this.store.get());
    this.store.subscribe(sync);
  }
}
