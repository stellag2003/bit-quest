import { LANGUAGES, currentLanguage, t } from '../i18n/index.js';
import { h } from '../ui/dom.js';

/** PT / EN / ES switch. Choosing another language saves it and redraws the screen in that language. */
export function languagePicker(ctx, { compact = false } = {}) {
  const active = currentLanguage().id;
  return h('div', { class: `langs ${compact ? 'langs--compact' : ''}`, role: 'group', 'aria-label': t('settings.language') },
    LANGUAGES.map((lang) => h('button', {
      class: `langs__btn ${lang.id === active ? 'is-current' : ''}`,
      type: 'button',
      lang: lang.htmlLang,
      'aria-pressed': String(lang.id === active),
      'aria-label': lang.label,
      title: lang.label,
      onClick: () => lang.id !== active && ctx.changeLanguage(lang.id),
    }, compact ? lang.short : [h('b', {}, lang.short), h('span', {}, lang.label)])));
}
