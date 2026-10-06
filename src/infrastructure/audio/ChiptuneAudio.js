import { noteToFreq } from './notes.js';

/**
 * Web Audio synthesiser. Implements the audio port used by the presentation:
 *   unlock(), play(id), playSong(id), stopMusic(), setSfxEnabled(b), setMusicEnabled(b)
 * Silently becomes a no-op where Web Audio is unavailable.
 */
export class ChiptuneAudio {
  constructor({ sfx, songs, AudioContextImpl = globalThis.AudioContext || globalThis.webkitAudioContext }) {
    this.sfx = sfx;
    this.songs = songs;
    this.AudioContextImpl = AudioContextImpl;
    this.ctx = null;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.music = { id: null, voices: [], timer: null };
    this.wantedSong = null;
  }

  unlock() {
    if (!this.AudioContextImpl) return;
    if (!this.ctx) {
      this.ctx = new this.AudioContextImpl();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.wantedSong && !this.music.id) this.playSong(this.wantedSong);
  }

  get ready() {
    return Boolean(this.ctx && this.ctx.state !== 'closed');
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) this.stopLoop();
    else if (this.wantedSong) this.playSong(this.wantedSong);
  }

  play(id) {
    const sound = this.sfx[id];
    if (!sound || !this.sfxEnabled || !this.ready) return;
    let t = this.ctx.currentTime + 0.005;
    for (const [note, duration] of sound.notes) {
      this.tone({ freq: noteToFreq(note), start: t, duration, wave: sound.wave, gain: sound.gain, slideTo: sound.slideTo });
      t += duration;
    }
  }

  /** Looping songs become the background track; one-shot songs (jingles) play over it. */
  playSong(id) {
    const song = this.songs[id];
    if (!song) return;
    if (song.loop) {
      this.wantedSong = id;
      if (!this.musicEnabled || !this.ready || this.music.id === id) return;
      this.stopLoop();
      this.music.id = id;
      this.scheduleLoop(song, this.ctx.currentTime + 0.05);
    } else if (this.sfxEnabled && this.ready) {
      this.scheduleSong(song, this.ctx.currentTime + 0.02, []);
    }
  }

  stopMusic() {
    this.wantedSong = null;
    this.stopLoop();
  }

  stopLoop() {
    clearTimeout(this.music.timer);
    this.music.voices.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        /* already stopped */
      }
    });
    this.music = { id: null, voices: [], timer: null };
  }

  scheduleLoop(song, startAt) {
    const length = this.scheduleSong(song, startAt, this.music.voices);
    const delayMs = (startAt + length - this.ctx.currentTime - 0.25) * 1000;
    this.music.timer = setTimeout(() => {
      this.music.voices = [];
      if (this.music.id) this.scheduleLoop(song, startAt + length);
    }, Math.max(0, delayMs));
  }

  /** Returns the song length in seconds. */
  scheduleSong(song, startAt, collector) {
    const beat = 60 / song.bpm;
    let length = 0;
    for (const voice of song.voices) {
      let t = startAt;
      for (const [note, beats] of voice.notes) {
        const freq = noteToFreq(note);
        const duration = beats * beat;
        if (freq > 0) {
          const osc = this.tone({ freq, start: t, duration: duration * 0.92, wave: voice.wave, gain: song.gain * (voice.gain ?? 1) });
          collector.push(osc);
        }
        t += duration;
      }
      length = Math.max(length, t - startAt);
    }
    return length;
  }

  tone({ freq, start, duration, wave, gain, slideTo }) {
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    amp.gain.setValueAtTime(0, start);
    amp.gain.linearRampToValueAtTime(gain, start + 0.006);
    amp.gain.setValueAtTime(gain, start + Math.max(0.006, duration - 0.02));
    amp.gain.linearRampToValueAtTime(0, start + duration);
    osc.connect(amp).connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
    return osc;
  }
}
