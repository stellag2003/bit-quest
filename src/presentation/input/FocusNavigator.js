const FOCUSABLE = 'button:not([disabled]), [data-focus]';
const VECTORS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/** Spatial navigation for the D-pad: jumps to the nearest control in a direction. */
export class FocusNavigator {
  candidates(root) {
    const scope = root.querySelector('.modal') ?? root;
    return [...scope.querySelectorAll(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
  }

  move(direction, root) {
    const items = this.candidates(root);
    if (!items.length) return;
    const current = items.find((el) => el.classList.contains('is-cursor')) ?? document.activeElement;
    if (!current || !items.includes(current)) return this.focus(items.find((el) => el.matches('[data-autofocus]')) ?? items[0]);

    const [vx, vy] = VECTORS[direction];
    const from = center(current.getBoundingClientRect());
    let best = null;
    let bestScore = Infinity;
    for (const el of items) {
      if (el === current) continue;
      const to = center(el.getBoundingClientRect());
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const along = dx * vx + dy * vy;
      if (along <= 4) continue;
      const across = Math.abs(dx * vy) + Math.abs(dy * vx);
      const score = along + across * 2.5;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }
    if (best) this.focus(best);
  }

  activate(root) {
    const current = root.querySelector('.is-cursor') ?? document.activeElement;
    if (current && root.contains(current) && current.matches(FOCUSABLE)) current.click();
    else this.move('down', root);
  }

  /** `.is-cursor` mirrors focus so the cursor shows even when the window itself is not focused. */
  focus(el) {
    document.body.classList.add('using-dpad');
    document.querySelectorAll('.is-cursor').forEach((other) => other.classList.remove('is-cursor'));
    el.classList.add('is-cursor');
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

const center = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
