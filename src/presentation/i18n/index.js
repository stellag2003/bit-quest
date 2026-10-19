import { EN } from './en.js';
import { ES } from './es.js';
import { PT } from './pt.js';

/**
 * Interface copy in pt / en / es. The language is chosen once at startup
 * (changing it saves the setting and reloads), so `t()` reads a module-level
 * dictionary instead of threading the locale through every component.
 */
export const LANGUAGES = [
  { id: 'pt', label: 'Português', short: 'PT', htmlLang: 'pt-BR' },
  { id: 'en', label: 'English', short: 'EN', htmlLang: 'en' },
  { id: 'es', label: 'Español', short: 'ES', htmlLang: 'es' },
];

export const DICTIONARIES = { pt: PT, en: EN, es: ES };

let current = 'pt';

/** Saved choice first, then the browser languages, then Portuguese. */
export function resolveLanguage(saved, preferred = []) {
  if (DICTIONARIES[saved]) return saved;
  const match = preferred.map((tag) => String(tag).slice(0, 2).toLowerCase()).find((id) => DICTIONARIES[id]);
  return match ?? 'pt';
}

export function setLanguage(id) {
  current = DICTIONARIES[id] ? id : 'pt';
  return current;
}

export const currentLanguage = () => LANGUAGES.find((l) => l.id === current);

/** t('home.play') or t('result.level', { level: 3 }). Falls back to Portuguese, then to `fallback`. */
export function t(key, params = {}, fallback = key) {
  const text = DICTIONARIES[current][key] ?? PT[key];
  if (text == null) return fallback;
  return text.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ''));
}

/** Plural-aware lookup: uses `${key}.one` when n === 1, `${key}.other` otherwise; `{n}` is filled in. */
export const tn = (key, n, params = {}) => t(`${key}.${n === 1 ? 'one' : 'other'}`, { n, ...params });
