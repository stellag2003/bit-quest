/** Tiny hyperscript helper: h('button', { class, onClick, dataset }, ...children). */
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key === 'style' && typeof value === 'object') Object.entries(value).forEach(([k, v]) => el.style.setProperty(k, v));
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value === true) el.setAttribute(key, '');
    else el.setAttribute(key, value);
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

export const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** Resolves on the next animation frames until `ms` passed, calling `update(t)` with t ∈ [0, 1]. */
export function tween(ms, update) {
  return new Promise((resolve) => {
    const start = performance.now();
    const frame = (now) => {
      // rAF timestamps can be slightly older than `start`; clamp to [0, 1].
      const t = Math.max(0, Math.min(1, (now - start) / ms));
      update(t);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    };
    requestAnimationFrame(frame);
  });
}
