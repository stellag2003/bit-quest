import { EN } from './en.js';
import { ES } from './es.js';

/**
 * Translations of the game content, keyed by the same ids as the Portuguese
 * source. Only text is translated: maps, solutions, prices and rules stay
 * in the source, so every language plays exactly the same game.
 */
export const CONTENT_LOCALES = { en: EN, es: ES };

const pickText = (base, overlay = {}, fields) =>
  Object.fromEntries(fields.map((f) => [f, overlay[f] ?? base[f]]));

function localizeFase(fase, t = {}) {
  return {
    ...fase,
    title: t.title ?? fase.title,
    concept: { ...fase.concept, ...pickText(fase.concept, t.concept, ['title', 'summary']) },
    lesson: fase.lesson.map((slide, i) => ({ ...slide, text: t.lesson?.[i] ?? slide.text })),
    challenges: fase.challenges.map((c) => {
      const ct = t.challenges?.[c.id] ?? {};
      return { ...c, ...pickText(c, ct, ['title', 'goal', 'hints', 'successMessage']) };
    }),
  };
}

function localizeGuide(slide, t = {}) {
  return {
    ...slide,
    title: t.title ?? slide.title,
    text: t.text ?? slide.text,
    items: slide.items.map(([iconName, label, detail], i) => {
      const [tLabel, tDetail] = t.items?.[i] ?? [];
      return [iconName, tLabel ?? label, tDetail ?? detail];
    }),
  };
}

/** Returns the content in `lang` (Portuguese is the source and comes back unchanged). */
export function localizeContent(content, lang) {
  const t = CONTENT_LOCALES[lang];
  if (!t) return content;
  const byId = (list, map, fields) => list.map((item) => ({ ...item, ...pickText(item, map?.[item.id], fields) }));
  const { feedback } = content;
  return Object.freeze({
    ...content,
    fases: content.fases.map((f) => localizeFase(f, t.fases?.[f.id])),
    mentors: byId(content.mentors, t.mentors, ['area', 'intro', 'fact', 'message', 'unlockText']),
    achievements: byId(content.achievements, t.achievements, ['title', 'description']),
    palettes: byId(content.palettes, t.palettes, ['name', 'songName']),
    guide: content.guide.map((s) => localizeGuide(s, t.guide?.[s.id])),
    feedback: {
      failures: Object.fromEntries(Object.entries(feedback.failures).map(([code, copy]) => [code, { ...copy, ...t.feedback?.failures?.[code] }])),
      encouragements: t.feedback?.encouragements ?? feedback.encouragements,
      praise: t.feedback?.praise ?? feedback.praise,
    },
  });
}
