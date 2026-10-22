import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ChiptuneAudio } from '../src/infrastructure/audio/ChiptuneAudio.js';
import { SFX, SONGS } from '../src/infrastructure/audio/soundBank.js';

/** Minimal Web Audio stand-in: counts the oscillators each context starts. */
function fakeAudioContext() {
  const contexts = [];
  class FakeContext {
    constructor() {
      this.state = 'running';
      this.currentTime = 0; // a new context's clock always starts at 0
      this.started = 0;
      this.destination = {};
      contexts.push(this);
    }
    createGain() {
      const param = { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {} };
      return { gain: param, connect: (node) => node };
    }
    createOscillator() {
      const ctx = this;
      return {
        frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect: (node) => node,
        start() { ctx.started += 1; },
        stop() {},
      };
    }
    createBuffer() { return {}; }
    createBufferSource() { return { connect() {}, start() {} }; }
    resume() { this.state = 'running'; return Promise.resolve(); }
    suspend() { this.state = 'suspended'; return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
  }
  return { FakeContext, contexts };
}

describe('Audio after leaving for another app', () => {
  it('every effect plays again on the rebuilt context (its clock restarts at 0)', () => {
    const { FakeContext, contexts } = fakeAudioContext();
    const audio = new ChiptuneAudio({ sfx: SFX, songs: SONGS, AudioContextImpl: FakeContext });
    audio.unlock();
    contexts[0].currentTime = 120; // two minutes of play
    for (const id of ['press', 'place', 'step']) audio.play(id);

    audio.sleep(); // WhatsApp
    audio.unlock(); // first touch back
    assert.equal(contexts.length, 2, 'a new context is built on return');
    const fresh = contexts[1];
    const before = fresh.started;
    for (const id of ['press', 'place', 'step']) audio.play(id);
    assert.ok(fresh.started - before >= 3, 'the same effects play on the new context');
  });

  it('the same effect twice in the same instant still plays once', () => {
    const { FakeContext, contexts } = fakeAudioContext();
    const audio = new ChiptuneAudio({ sfx: SFX, songs: SONGS, AudioContextImpl: FakeContext });
    audio.unlock();
    const before = contexts[0].started;
    audio.play('press');
    audio.play('press');
    assert.equal(contexts[0].started - before, SFX.press.notes.length);
  });
});
