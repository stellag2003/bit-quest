import { Tile } from '../../domain/tiles.js';
import { World } from '../../domain/World.js';
import { drawSprite } from '../pixel/draw.js';
import { SCENERIES } from '../pixel/sceneries.js';
import { FLAG, ROBOT, ROCK } from '../pixel/sprites.js';
import { h, reducedMotion, sleep, tween } from '../ui/dom.js';

const T = 16;
const STEP_MS = { walk: 300, turn: 200, jump: 440, bump: 260 };
const MOTION_SOUND = { walk: 'step', turn: 'turn', jump: 'jump', bump: 'bump' };

/**
 * Canvas view of a World. Knows nothing about rules: it only replays the
 * trace (`steps`) produced by the domain runners.
 */
export class WorldView {
  constructor({ theme, sfx, scenery = 'meadow', label = 'Mapa' }) {
    this.theme = theme;
    this.sfx = sfx;
    this.scenery = SCENERIES[scenery] ?? SCENERIES.meadow;
    this.canvas = h('canvas', { class: 'world__canvas', role: 'img', 'aria-label': label });
    this.el = h('div', { class: 'world' }, this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.tick = 0;
    this.particles = [];
    this.playToken = null;
    this.idle = setInterval(() => {
      this.tick += 1;
      this.draw();
    }, 420);
    this.resizeObserver = new ResizeObserver(() => this.fit());
    this.resizeObserver.observe(this.el);
  }

  setWorld(rows) {
    this.world = new World(rows);
    this.canvas.width = this.world.width * T;
    this.canvas.height = this.world.height * T;
    this.reset();
    this.fit();
  }

  reset() {
    this.playToken = null;
    const { x, y, dir } = this.world.start;
    this.robot = { x, y, dir, hop: 0, step: 0, nudge: { x: 0, y: 0 } };
    this.trail = [{ x, y }];
    this.marker = null;
    this.particles = [];
    this.el.classList.remove('is-shaking');
    this.draw();
  }

  /** Integer device-pixel scaling keeps every art pixel crisp. */
  fit() {
    if (!this.world) return;
    const { width, height } = this.el.getBoundingClientRect();
    if (!width || !height) return;
    const dpr = window.devicePixelRatio || 1;
    const raw = Math.min(width / this.canvas.width, height / this.canvas.height);
    const scale = raw >= 1 ? Math.floor(raw * dpr) / dpr : raw;
    this.canvas.style.width = `${this.canvas.width * scale}px`;
    this.canvas.style.height = `${this.canvas.height * scale}px`;
  }

  async play(run, { onStep } = {}) {
    const token = {};
    this.playToken = token;
    for (const [index, step] of run.steps.entries()) {
      if (this.playToken !== token) return false;
      onStep?.(step, index);
      await this.animateStep(step);
    }
    if (this.playToken !== token) return false;
    if (run.success) await this.celebrate();
    return true;
  }

  async animateStep(step) {
    this.sfx(MOTION_SOUND[step.motion]);
    const robot = this.robot;
    if (step.motion === 'turn') {
      await tween(STEP_MS.turn / 2, () => {});
      robot.dir = step.to.dir;
      this.draw();
      await tween(STEP_MS.turn / 2, () => {});
      return;
    }
    if (step.motion === 'bump') return this.bump(step);

    const { x: fx, y: fy } = step.from;
    const { x: tx, y: ty } = step.to;
    const jumping = step.motion === 'jump';
    await tween(STEP_MS[step.motion], (t) => {
      robot.x = fx + (tx - fx) * t;
      robot.y = fy + (ty - fy) * t;
      robot.hop = jumping ? Math.sin(Math.PI * t) * 12 : 0;
      robot.step = Math.floor(t * 4) % 2;
      this.draw();
    });
    Object.assign(robot, { x: tx, y: ty, hop: 0, step: 0 });
    this.trail.push({ x: tx, y: ty });
    this.draw();
  }

  async bump(step) {
    const robot = this.robot;
    const dx = Math.sign(step.target.x - step.from.x);
    const dy = Math.sign(step.target.y - step.from.y);
    this.marker = step.target;
    if (!reducedMotion()) this.el.classList.add('is-shaking');
    await tween(STEP_MS.bump, (t) => {
      const push = Math.sin(Math.PI * t) * 5;
      robot.nudge = { x: dx * push, y: dy * push };
      this.draw();
    });
    robot.nudge = { x: 0, y: 0 };
    this.draw();
  }

  async celebrate() {
    const robot = this.robot;
    robot.dir = 'S';
    if (!reducedMotion()) this.burst(robot.x * T + 8, robot.y * T + 4);
    for (let i = 0; i < 2; i += 1) {
      await tween(260, (t) => {
        robot.hop = Math.sin(Math.PI * t) * 7;
        this.stepParticles();
        this.draw();
      });
    }
    await tween(400, () => {
      this.stepParticles();
      this.draw();
    });
    await sleep(80);
  }

  burst(x, y) {
    for (let i = 0; i < 18; i += 1) {
      const angle = (Math.PI * 2 * i) / 18;
      const speed = 0.9 + (i % 3) * 0.5;
      this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.2, life: 40 });
    }
  }

  stepParticles() {
    this.particles = this.particles
      .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.06, life: p.life - 1 }))
      .filter((p) => p.life > 0);
  }

  draw() {
    if (!this.world) return;
    const { ctx, world } = this;
    const c = this.theme.colors;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < world.height; y += 1) {
      for (let x = 0; x < world.width; x += 1) this.scenery.floor(ctx, x, y, c);
    }
    this.drawGrid(c);
    this.drawTrail(c);

    for (let y = 0; y < world.height; y += 1) {
      for (let x = 0; x < world.width; x += 1) {
        const tile = world.tileAt(x, y);
        if (tile === Tile.WALL) this.scenery.wall(ctx, x, y, c);
        else if (tile === Tile.ROCK) drawSprite(ctx, ROCK, x * T, y * T, c);
        else if (tile === Tile.GOAL) drawSprite(ctx, FLAG[this.tick % 2], x * T, y * T, c);
      }
    }
    this.drawMarker(c);
    this.drawRobot(c);
    this.particles.forEach((p) => {
      ctx.fillStyle = c[p.life % 8 < 4 ? 0 : 1];
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    });
  }

  /** Dots on cell corners help kids count squares. */
  drawGrid(c) {
    this.ctx.fillStyle = c[2];
    for (let y = 1; y < this.world.height; y += 1) {
      for (let x = 1; x < this.world.width; x += 1) this.ctx.fillRect(x * T, y * T, 1, 1);
    }
  }

  drawTrail(c) {
    this.ctx.fillStyle = c[2];
    this.trail.slice(0, -1).forEach(({ x, y }) => this.ctx.fillRect(x * T + 6, y * T + 7, 4, 2));
  }

  drawMarker(c) {
    if (!this.marker || this.tick % 2) return;
    const { x, y } = this.marker;
    if (!this.world.inside(x, y)) return;
    this.ctx.fillStyle = c[0];
    for (let i = 3; i < 13; i += 1) {
      this.ctx.fillRect(x * T + i, y * T + i, 2, 1);
      this.ctx.fillRect(x * T + 15 - i, y * T + i, 2, 1);
    }
  }

  drawRobot(c) {
    const r = this.robot;
    const bx = Math.round(r.x * T + r.nudge.x);
    const by = Math.round(r.y * T + r.nudge.y);
    if (r.hop > 1) {
      this.ctx.fillStyle = c[2];
      this.ctx.fillRect(bx + 4, by + 14, 8, 2);
    }
    const blinking = this.tick % 9 === 0 && r.hop === 0;
    let sprite = ROBOT[r.dir][r.step];
    if (blinking && r.dir === 'S') sprite = ROBOT.blinkS;
    if (blinking && (r.dir === 'E' || r.dir === 'W')) sprite = ROBOT.blinkE;
    drawSprite(this.ctx, sprite, bx, Math.round(by - r.hop), c, { flip: r.dir === 'W' });
  }

  destroy() {
    this.playToken = null;
    clearInterval(this.idle);
    this.resizeObserver.disconnect();
  }
}
