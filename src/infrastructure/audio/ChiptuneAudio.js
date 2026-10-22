import { noteToFreq } from './notes.js';

/**
 * Web Audio synthesiser. Implements the audio port used by the presentation:
 *   unlock(), play(id), playSong(id), stopJingles(), stopMusic(), setSfxEnabled(b), setMusicEnabled(b)
 * Silently becomes a no-op where Web Audio is unavailable.
 *
 * Phones and tablets suspend (or "interrupt") the audio context when the screen
 * sleeps, the tab hides or the device sits idle, and only resume it inside a
 * touch. So every touch calls unlock(): it wakes the context, or builds a new
 * one when the old one refuses to come back. The background loop only runs
 * while the context is running and restarts fresh when it wakes up.
 *
 * After the player leaves for another app (WhatsApp…) and comes back, phones
 * often hand back a "zombie" context: it says it is running but makes no sound.
 * So leaving the page marks the context for rebuilding, and the first touch
 * back builds a brand-new one. Every touch also checks that the audio clock
 * is really moving; a frozen clock gets the same treatment.
 */
export class ChiptuneAudio {
  constructor({ sfx, songs, AudioContextImpl = globalThis.AudioContext || globalThis.webkitAudioContext }) {
    this.sfx = sfx;
    this.songs = songs;
    this.AudioContextImpl = AudioContextImpl;
    this.ctx = null;
    this.stale = false; // refused to resume: replace on the next touch
    this.rebuild = false; // came back from the background or frozen clock: replace on the next touch
    this.probing = false;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.music = { id: null, voices: [], timer: null };
    this.jingle = [];
    this.lastPlayed = {};
    this.wantedSong = null;
  }

  /** Call from inside every user gesture: creates, wakes or rebuilds the context. */
  unlock() {
    if (!this.AudioContextImpl) return;
    if (!this.ctx || this.stale || this.rebuild || this.ctx.state === 'closed') this.createContext();
    const ctx = this.ctx;
    if (ctx.state !== 'running') {
      ctx.resume?.().catch(() => {});
      // A context that is still not running after a touch is stuck (seen on tablets after
      // a long idle): the next touch replaces it with a new one.
      setTimeout(() => {
        if (this.ctx === ctx && ctx.state !== 'running') this.stale = true;
      }, 400);
    }
    this.primeSpeaker();
    if (ctx.state === 'running') this.ensureMusic();
    this.probeClock(ctx);
  }

  /** A context that claims to run but whose clock stands still is dead: rebuild it on the next touch. */
  probeClock(ctx) {
    if (this.probing || ctx.state !== 'running') return;
    this.probing = true;
    const start = ctx.currentTime;
    setTimeout(() => {
      this.probing = false;
      if (this.ctx === ctx && ctx.state === 'running' && ctx.currentTime - start < 0.05) this.rebuild = true;
    }, 300);
  }

  /** The page went to the background (another app, locked screen): go quiet and rebuild on return. */
  sleep() {
    if (!this.ctx) return;
    this.rebuild = true;
    this.stopLoop();
    this.stopJingles();
    this.ctx.suspend?.().catch(() => {});
  }

  createContext() {
    const old = this.ctx;
    this.stopLoop();
    this.stopJingles();
    this.stale = false;
    this.rebuild = false;
    this.ctx = new this.AudioContextImpl();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;
    this.master.connect(this.ctx.destination);
    this.ctx.onstatechange = () => this.onStateChange(this.ctx);
    if (old && old.state !== 'closed') old.close?.().catch(() => {});
  }

  /** iOS/iPadOS only open the speaker after a sound starts inside a touch: play one silent sample. */
  primeSpeaker() {
    try {
      const source = this.ctx.createBufferSource();
      source.buffer = this.ctx.createBuffer(1, 1, 22050);
      source.connect(this.ctx.destination);
      source.start(0);
    } catch {
      /* not needed on this browser */
    }
  }

  onStateChange(ctx) {
    if (ctx !== this.ctx) return;
    if (ctx.state === 'running') {
      this.stale = false;
      this.ensureMusic();
    } else {
      // Frozen clock: drop the scheduled loop so it does not pile up; it restarts on resume.
      this.stopLoop();
    }
  }

  /** Starts the wanted background song if it should be playing and is not. */
  ensureMusic() {
    if (this.wantedSong && this.musicEnabled && !this.music.id) this.playSong(this.wantedSong);
  }

  get ready() {
    return Boolean(this.ctx && this.ctx.state === 'running');
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
    if (!enabled) this.stopJingles();
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) this.stopLoop();
    else this.ensureMusic();
  }

  play(id) {
    const sound = this.sfx[id];
    if (!sound || !this.sfxEnabled) return;
    if (!this.ready) {
      this.ctx?.resume?.().catch(() => {});
      return;
    }
    // The same effect fired again within a few ms only stacks volume: play it once.
    const now = this.ctx.currentTime;
    if (now - (this.lastPlayed[id] ?? -1) < 0.06) return;
    this.lastPlayed[id] = now;
    let t = now + 0.005;
    for (const [note, duration] of sound.notes) {
      this.tone({ freq: noteToFreq(note), start: t, duration, wave: sound.wave, gain: sound.gain, slideTo: sound.slideTo });
      t += duration;
    }
  }

  /**
   * Looping songs become the background track; one-shot songs (jingles) play over it.
   * A new jingle replaces the one still playing. Returns the jingle length in seconds (0 if silent).
   */
  playSong(id) {
    const song = this.songs[id];
    if (!song) return 0;
    if (song.loop) {
      this.wantedSong = id;
      if (!this.musicEnabled || !this.ready || this.music.id === id) return 0;
      this.stopLoop();
      this.music.id = id;
      this.scheduleLoop(song, this.ctx.currentTime + 0.05);
      return 0;
    }
    if (!this.sfxEnabled || !this.ready) return 0;
    this.stopJingles();
    return this.scheduleSong(song, this.ctx.currentTime + 0.02, this.jingle);
  }

  /** Cuts the jingle still playing (leaving a screen must not carry its fanfare along). */
  stopJingles() {
    this.jingle.splice(0).forEach(stopOsc);
  }

  stopMusic() {
    this.wantedSong = null;
    this.stopLoop();
  }

  stopLoop() {
    clearTimeout(this.music.timer);
    this.music.voices.forEach(stopOsc);
    this.music = { id: null, voices: [], timer: null };
  }

  scheduleLoop(song, startAt) {
    const length = this.scheduleSong(song, startAt, this.music.voices);
    const delayMs = (startAt + length - this.ctx.currentTime - 0.25) * 1000;
    this.music.timer = setTimeout(() => {
      if (!this.music.id) return;
      if (!this.ready) return this.stopLoop(); // restarted by onStateChange/unlock
      this.music.voices = [];
      // A late timer (busy or throttled tab) must not schedule notes in the past, which would play all at once.
      this.scheduleLoop(song, Math.max(startAt + length, this.ctx.currentTime + 0.05));
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

function stopOsc(osc) {
  try {
    osc.stop();
  } catch {
    /* already stopped */
  }
}
