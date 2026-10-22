import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONTENT } from '../src/content/index.js';
import { CONTENT_LOCALES, localizeContent } from '../src/content/locales/index.js';
import { DICTIONARIES, resolveLanguage } from '../src/presentation/i18n/index.js';

// Words spelled the same in Portuguese and Spanish.
const SAME_IN_SPANISH = new Set(['Recarga rápida', 'Física teórica']);
const placeholders = (text) => (text.match(/\{\w+\}/g) ?? []).sort().join();

describe('i18n: interface copy', () => {
  for (const [lang, dict] of Object.entries(DICTIONARIES)) {
    it(`${lang} has every key, with the same placeholders`, () => {
      assert.deepEqual(Object.keys(dict).sort(), Object.keys(DICTIONARIES.pt).sort());
      for (const [key, text] of Object.entries(DICTIONARIES.pt)) {
        assert.equal(typeof dict[key], 'string', key);
        assert.ok(dict[key].trim(), key);
        assert.equal(placeholders(dict[key]), placeholders(text), key);
      }
    });
  }

  it('picks the saved language, then the browser language, then Portuguese', () => {
    assert.equal(resolveLanguage('es', ['en-US']), 'es');
    assert.equal(resolveLanguage(null, ['fr-FR', 'en-GB']), 'en');
    assert.equal(resolveLanguage(undefined, ['de']), 'pt');
  });
});

describe('i18n: game content', () => {
  const texts = (content) => JSON.stringify({
    fases: content.fases.map((f) => [f.title, f.concept.title, f.concept.summary, f.lesson.map((s) => s.text),
      f.challenges.map((c) => [c.title, c.goal, c.hints, c.nudges, c.successMessage ?? null])]),
    mentors: content.mentors.map((m) => [m.area, m.intro, m.fact, m.message, m.unlockText]),
    achievements: content.achievements.map((a) => [a.title, a.description]),
    palettes: content.palettes.map((p) => [p.name, p.songName]),
    guide: content.guide.map((s) => [s.title, s.text, s.items.map(([, label, detail]) => [label, detail])]),
    feedback: content.feedback,
  });

  for (const lang of Object.keys(CONTENT_LOCALES)) {
    it(`${lang} translates every text and keeps the game identical`, () => {
      const localized = localizeContent(CONTENT, lang);
      const source = JSON.parse(texts(CONTENT));
      const target = JSON.parse(texts(localized));

      // Same shape (array lengths, hint counts, guide items)…
      const shape = (value) => (Array.isArray(value) ? value.map(shape) : value && typeof value === 'object'
        ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)])) : typeof value);
      assert.deepEqual(shape(target), shape(source));

      // …and no string left in Portuguese (names and short shared words aside).
      const flat = (value) => (Array.isArray(value) ? value.flatMap(flat) : value && typeof value === 'object' ? Object.values(value).flatMap(flat) : [value]);
      const untranslated = flat(source).map((text, i) => [text, flat(target)[i]])
        .filter(([pt, other]) => typeof pt === 'string' && pt.length > 12 && pt === other && !SAME_IN_SPANISH.has(pt));
      assert.deepEqual(untranslated, []);

      // Rules, maps and solutions are untouched.
      localized.fases.forEach((f, i) => f.challenges.forEach((c, j) => {
        const original = CONTENT.fases[i].challenges[j];
        assert.deepEqual([c.id, c.maps, c.solution, c.maxBlocks, c.optimalBlocks], [original.id, original.maps, original.solution, original.maxBlocks, original.optimalBlocks]);
      }));
    });
  }
});
