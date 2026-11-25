// TuTienGioi VFX library (Phaser 4) — implements VISUAL_SPEC_v0.1 §8, GAME_FLOW_v0.1 §8, CONCEPT_ART_REVIEW_BRIEF §3C.
//
//   Tầng 1 Tiểu Cảnh   minor()       0.5–1.5 s  ring + sparkles + "+Tu Vi" number
//   Tầng 2 Đại Cảnh    major()       3–5 s      runes expand, qi vortex, light pillar, costume/aura swap
//   Tầng 3 Thiên Kiếp  tribulation() 5–8 s      clouds gather, directed lightning, protective formation, light shake
//   Tầng 4 Thiên Phạt  ascension()   ~10 s      two lightning waves, clouds part, immortal light, petals
//   Support: aura (idle), tide (Linh Khí Triều), heartDemon (Tâm Ma), assist (Trợ Chiến), fortune (Cơ duyên)
//
// Rules from the spec enforced here:
//   - only ONE full-screen effect at a time; big events are queued (Director)
//   - no full-screen white flash; flashes are local and at most one per ~1 s (no strobe)
//   - effects never sit on the face for long and keep the header/name area readable
//
// Everything is procedural (textures.ts / lightning.ts), so the library works with any art and costs 0 VND.
import Phaser from 'phaser';
import { makeGhostTexture, makeVfxTextures } from './textures';
import { strike } from './lightning';

export const FONT = 'NotoSansVI, sans-serif';

/** What an effect needs to know about a character. The game supplies it. */
export interface FxTarget {
  x: number;              // feet x
  y: number;              // feet y
  height: number;         // on-screen height in px
  name: string;
  /** optional hooks */
  swapCostume?: (tier: number) => void;
  setGlow?: (color: number, strength: number) => void;
  celebrate?: () => void;
}

export const REALM_COLORS = [0xf4ecd8, 0x4fd6a0, 0xf2c24e, 0x5aa9ff, 0xb57bff, 0xe6ecf5, 0x7f9bff, 0xfff1c4, 0x8f6bff, 0xfffaf0];
export const REALM_NAMES = ['Luyện Khí', 'Trúc Cơ', 'Kim Đan', 'Nguyên Anh', 'Hóa Thần', 'Luyện Hư', 'Hợp Thể', 'Đại Thừa', 'Độ Kiếp', 'Chân Tiên'];

type Spiral = { s: Phaser.GameObjects.Image; cx: number; cy: number; a: number; r: number; dr: number; da: number; life: number };

export class Vfx {
  scene: Phaser.Scene;
  main: Phaser.Cameras.Scene2D.Camera;
  fx: Phaser.Cameras.Scene2D.Camera;
  spirals: Spiral[] = [];
  bannerY = 300; // header zone (VISUAL_SPEC §2.1: 100–230 header, keep a little lower for TikTok top bar)
  W: number;
  H: number;
  private tideOn: { stop: () => void } | null = null;
  private lastFlashAt = 0;

  constructor(scene: Phaser.Scene, opts: { bloom?: boolean } = {}) {
    this.scene = scene;
    makeVfxTextures(scene);
    makeGhostTexture(scene);
    this.W = scene.scale.width;
    this.H = scene.scale.height;
    this.main = scene.cameras.main;
    // a second camera renders only the "over" effects, with an optional bloom (threshold + blur, added back)
    this.fx = scene.cameras.add(0, 0, this.W, this.H).setName('fx');
    this.fx.transparent = true;
    if (opts.bloom !== false) {
      const p = this.fx.filters.internal.addParallelFilters();
      p.top.addThreshold(0.55, 1);
      p.top.addBlur(1, 2, 2, 1.2, 0xffffff, 6);
      p.blend.blendMode = Phaser.BlendModes.ADD;
      p.blend.amount = 1;
    }
  }

  /** Object drawn by the main camera only (scene, characters, effects BEHIND characters). */
  base<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.fx.ignore(o);
    return o;
  }

  /** Object drawn by the FX camera only (on top of everything, with bloom). */
  over<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.main.ignore(o);
    return o;
  }

  update(dt: number) {
    for (let i = this.spirals.length - 1; i >= 0; i--) {
      const p = this.spirals[i];
      p.life -= dt;
      p.a += p.da * dt;
      p.r = Math.max(0, p.r + p.dr * dt);
      p.s.setPosition(p.cx + Math.cos(p.a) * p.r, p.cy + Math.sin(p.a) * p.r * 0.55);
      p.s.setAlpha(Math.min(1, p.life * 3));
      if (p.life <= 0 || p.r <= 2) {
        p.s.destroy();
        this.spirals.splice(i, 1);
      }
    }
  }

  // ------------------------------------------------------------------ helpers
  private img(x: number, y: number, key: string, color = 0xffffff, layer: 'over' | 'base' = 'over') {
    const s = this.scene.add.image(x, y, key).setTint(color).setBlendMode(Phaser.BlendModes.ADD);
    return layer === 'over' ? this.over(s) : this.base(s);
  }

  private text(x: number, y: number, str: string, size: number, color = '#FFF3CF', stroke = '#2A1440') {
    const t = this.scene.add.text(x, y, str, {
      fontFamily: FONT, fontSize: `${size}px`, color, stroke, strokeThickness: Math.round(size / 5), align: 'center',
    }).setOrigin(0.5).setDepth(9000);
    return this.over(t);
  }

  private burst(x: number, y: number, color: number, count: number, speed = [180, 520], key = 'v_star', scale = 0.45) {
    const e = this.scene.add.particles(x, y, key, {
      speed: { min: speed[0], max: speed[1] }, lifespan: { min: 500, max: 1100 }, angle: { min: 0, max: 360 },
      scale: { start: scale, end: 0 }, alpha: { start: 1, end: 0 }, tint: [color, 0xffffff], blendMode: 'ADD',
      gravityY: 160, emitting: false,
    }).setDepth(8000);
    this.over(e);
    e.explode(count);
    this.scene.time.delayedCall(1400, () => e.destroy());
  }

  private ring(x: number, y: number, color: number, from: number, to: number, ms: number, flat = 0.38) {
    const r = this.img(x, y, 'v_ring', color).setScale(from, from * flat).setAlpha(1);
    this.scene.tweens.add({ targets: r, scaleX: to, scaleY: to * flat, alpha: 0, duration: ms, ease: 'Cubic.Out', onComplete: () => r.destroy() });
  }

  /** Local flash (never full screen). Rate-limited to avoid strobing. */
  private flash(x: number, y: number, color: number, size = 3) {
    const now = this.scene.time.now;
    if (now - this.lastFlashAt < 900) return;
    this.lastFlashAt = now;
    const f = this.img(x, y, 'v_glow', color).setScale(size).setAlpha(0.9);
    this.scene.tweens.add({ targets: f, alpha: 0, scale: size * 1.6, duration: 450, ease: 'Quad.Out', onComplete: () => f.destroy() });
  }

  private spiralIn(cx: number, cy: number, color: number, n: number, radius: number, ms: number) {
    for (let i = 0; i < n; i++) {
      const s = this.img(cx, cy, i % 3 ? 'v_glow' : 'v_star', color).setScale(0.18 + Math.random() * 0.2);
      this.spirals.push({ s, cx, cy, a: Math.random() * Math.PI * 2, r: radius * (0.7 + Math.random() * 0.5), dr: -radius / (ms / 1000), da: 3.2 + Math.random() * 1.5, life: ms / 1000 + 0.2 });
    }
  }

  banner(title: string, sub: string, color = '#FFE7A3', ms = 2600) {
    const t = this.text(this.W / 2, this.bannerY, title, 64, color).setScale(0.4).setAlpha(0);
    const s = this.text(this.W / 2, this.bannerY + 70, sub, 34, '#FFFFFF').setAlpha(0);
    this.scene.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 380, ease: 'Back.Out' });
    this.scene.tweens.add({ targets: s, alpha: 1, duration: 300, delay: 200 });
    this.scene.tweens.add({ targets: [t, s], alpha: 0, delay: ms, duration: 450, onComplete: () => { t.destroy(); s.destroy(); } });
  }

  // ------------------------------------------------------------------ idle aura (per character, cheap)
  aura(t: FxTarget, realm: number) {
    const color = REALM_COLORS[realm];
    const a = this.img(t.x, t.y - t.height * 0.45, 'v_glow', color, 'base').setScale(t.height / 90).setAlpha(0.18).setDepth(t.y - 1);
    const r = this.img(t.x, t.y - 4, 'v_ring', color, 'base').setScale(t.height / 400, t.height / 1000).setAlpha(0.35).setDepth(t.y - 1);
    this.scene.tweens.add({ targets: a, alpha: 0.32, scale: (t.height / 90) * 1.08, yoyo: true, repeat: -1, duration: 1600, ease: 'Sine.InOut' });
    this.scene.tweens.add({ targets: r, alpha: 0.12, yoyo: true, repeat: -1, duration: 2200, ease: 'Sine.InOut' });
    return { destroy: () => { a.destroy(); r.destroy(); } };
  }

  // ------------------------------------------------------------------ Tầng 1: Tiểu Cảnh (1.2 s)
  minor(t: FxTarget, realm: number, gain: number, label: string) {
    const c = REALM_COLORS[realm];
    this.ring(t.x, t.y - 4, c, 0.05, t.height / 160, 700);
    this.burst(t.x, t.y - t.height * 0.5, c, 10, [80, 220], 'v_star', 0.3);
    const n = this.text(t.x, t.y - t.height - 10, `+${gain.toLocaleString('vi-VN')} Tu Vi`, 30, '#BFF7DA');
    this.scene.tweens.add({ targets: n, y: n.y - 90, alpha: 0, duration: 1300, ease: 'Cubic.Out', onComplete: () => n.destroy() });
    const l = this.text(t.x, t.y - t.height - 50, label, 24, '#FFFFFF').setAlpha(0);
    this.scene.tweens.add({ targets: l, alpha: 1, y: l.y - 20, duration: 300, yoyo: true, hold: 600, onComplete: () => l.destroy() });
    return 1300;
  }

  // ------------------------------------------------------------------ Tầng 2: Đại Cảnh (4.5 s)
  major(t: FxTarget, toRealm: number) {
    const c = REALM_COLORS[toRealm];
    const cx = t.x, cy = t.y - t.height * 0.5;
    const s = this.scene;
    // 1) runes open under the feet (flattened) and behind the body (upright)
    const floor = this.img(t.x, t.y - 4, 'v_runes', c, 'base').setDepth(t.y - 2).setScale(0).setAlpha(0.95);
    const back = this.img(cx, cy, 'v_runes', c, 'base').setDepth(t.y - 3).setScale(0).setAlpha(0.55);
    s.tweens.add({ targets: floor, scaleX: t.height / 260, scaleY: (t.height / 260) * 0.36, duration: 600, ease: 'Back.Out' });
    s.tweens.add({ targets: floor, angle: 180, duration: 4500 });
    s.tweens.add({ targets: back, scale: t.height / 330, duration: 800, ease: 'Cubic.Out', delay: 200 });
    s.tweens.add({ targets: back, angle: -120, duration: 4500 });
    // 2) qi vortex converging on the body
    this.spiralIn(cx, cy, c, 46, t.height * 1.6, 1300);
    t.setGlow?.(c, 0);
    s.tweens.addCounter({ from: 0, to: 6, duration: 1300, onUpdate: (tw) => t.setGlow?.(c, tw.getValue() ?? 0) });
    // 3) at 1.4 s: pillar, shockwave, burst, costume swap
    s.time.delayedCall(1400, () => {
      const p = this.img(t.x, t.y + 10, 'v_pillar', c).setOrigin(0.5, 1).setScale(t.height / 220, 0).setAlpha(1);
      s.tweens.add({ targets: p, scaleY: 1.25, duration: 220, ease: 'Expo.Out' });
      s.tweens.add({ targets: p, alpha: 0, scaleX: t.height / 600, delay: 600, duration: 900, onComplete: () => p.destroy() });
      this.flash(cx, cy, c, t.height / 70);
      this.ring(t.x, t.y - 4, c, 0.2, t.height / 70, 900);
      this.ring(t.x, t.y - 4, 0xffffff, 0.1, t.height / 100, 700);
      this.burst(cx, cy, c, 40);
      t.swapCostume?.(toRealm);
      t.celebrate?.();
      this.banner(`ĐỘT PHÁ ${REALM_NAMES[toRealm].toUpperCase()}`, t.name, '#FFE7A3');
      // aura flare after the break: rising motes in the realm colour
      const motes = s.add.particles(0, 0, 'v_glow', {
        x: { min: t.x - t.height * 0.4, max: t.x + t.height * 0.4 }, y: t.y - 10, lifespan: 1400,
        speedY: { min: -160, max: -60 }, scale: { start: 0.25, end: 0 }, alpha: { start: 0.9, end: 0 },
        tint: c, blendMode: 'ADD', frequency: 30, duration: 2200,
      }).setDepth(8000);
      this.over(motes);
      s.time.delayedCall(3800, () => motes.destroy());
    });
    // 4) wind down
    s.time.delayedCall(3600, () => {
      s.tweens.add({ targets: [floor, back], alpha: 0, duration: 700, onComplete: () => { floor.destroy(); back.destroy(); } });
      s.tweens.addCounter({ from: 6, to: 0, duration: 700, onUpdate: (tw) => t.setGlow?.(c, tw.getValue() ?? 0), onComplete: () => t.setGlow?.(c, -1) });
    });
    return 4500;
  }

  // ------------------------------------------------------------------ Tầng 3: Thiên Kiếp (7.5 s)
  private clouds(centerX: number, color: number, count: number) {
    const s = this.scene;
    const list: Phaser.GameObjects.Image[] = [];
    for (let i = 0; i < count; i++) {
      const side = i % 2 ? 1 : -1;
      const tx = centerX + (Math.random() - 0.5) * 760;
      const ty = 330 + Math.random() * 230;
      const c = s.add.image(tx + side * 700, ty - 120, 'v_cloud').setTint(i % 3 ? color : 0x5d5690).setAlpha(0)
        .setScale(2.2 + Math.random() * 1.6).setDepth(50);
      this.base(c);
      s.tweens.add({ targets: c, x: tx, y: ty, alpha: 0.95, duration: 1400 + Math.random() * 600, ease: 'Cubic.Out' });
      s.tweens.add({ targets: c, x: `+=${(Math.random() - 0.5) * 40}`, yoyo: true, repeat: -1, duration: 2000 + Math.random() * 1500, delay: 1800, ease: 'Sine.InOut' });
      list.push(c);
    }
    return list;
  }

  private dim(color: number, alpha: number, ms: number) {
    const v = this.base(this.scene.add.image(this.W / 2, this.H / 2, 'v_vignette').setDisplaySize(this.W, this.H).setTint(color).setAlpha(0).setDepth(40));
    this.scene.tweens.add({ targets: v, alpha, duration: ms });
    return v;
  }

  tribulation(t: FxTarget, toRealm: number, opts: { strikes?: number; final?: boolean } = {}) {
    const s = this.scene;
    const strikes = opts.strikes ?? 3;
    const c = 0x9fd0ff;
    const cx = t.x, cy = t.y - t.height * 0.5;
    const shade = this.dim(0x0a0820, 0.55, 1200);
    const clouds = this.clouds(t.x, 0x433d6a, 16);
    // cloud-internal flicker (dim, slow — no strobe)
    const flick = s.time.addEvent({ delay: 650, repeat: 8, callback: () => {
      const cl = clouds[Math.floor(Math.random() * clouds.length)];
      s.tweens.add({ targets: cl, tint: 0x6e6aa8, duration: 80, yoyo: true });
    } });
    this.banner('THIÊN KIẾP GIÁNG LÂM', `${t.name} · ${REALM_NAMES[toRealm - 1]} → ${REALM_NAMES[toRealm]}`, '#CFE6FF', 2400);
    // protective formation under the character
    const form = this.img(t.x, t.y - 4, 'v_formation', 0x8fd4ff, 'base').setDepth(t.y - 2).setScale(0).setAlpha(0.9);
    s.tweens.add({ targets: form, scaleX: t.height / 260, scaleY: (t.height / 260) * 0.38, duration: 700, delay: 600, ease: 'Back.Out' });
    s.tweens.add({ targets: form, angle: 360, duration: 8000 });
    const dome = this.img(cx, cy, 'v_glow', 0x8fd4ff, 'base').setDepth(t.y + 1).setScale(0).setAlpha(0.22);
    s.tweens.add({ targets: dome, scale: t.height / 75, duration: 700, delay: 900 });
    t.setGlow?.(0x8fd4ff, 3);
    // directed strikes from the cloud bank to the formation
    for (let i = 0; i < strikes; i++) {
      s.time.delayedCall(1700 + i * 1150, () => {
        const from = { x: t.x + (Math.random() - 0.5) * 260, y: 380 + Math.random() * 80 };
        const to = { x: t.x + (Math.random() - 0.5) * 24, y: cy - t.height * 0.1 };
        this.over(strike(s, from, to, { color: c, width: 7, branches: 5 }));
        // a faint pre-strike is skipped on purpose: one clear strike per hit reads better on a phone
        this.flash(to.x, to.y, c, t.height / 60);
        this.ring(t.x, t.y - 4, c, 0.3, t.height / 70, 650);
        this.burst(to.x, to.y, c, 22, [160, 420], 'v_dot', 1.2);
        this.main.shake(180, 0.004);
        s.tweens.add({ targets: form, alpha: 1, duration: 60, yoyo: true });
        s.tweens.add({ targets: dome, alpha: 0.45, duration: 80, yoyo: true });
      });
    }
    const endAt = 1700 + strikes * 1150 + 400;
    s.time.delayedCall(endAt, () => {
      // clouds part, a ray of heaven light, transformation
      for (const cl of clouds) s.tweens.add({ targets: cl, x: cl.x < t.x ? cl.x - 700 : cl.x + 700, alpha: 0, duration: 1400, ease: 'Cubic.In', onComplete: () => cl.destroy() });
      flick.remove();
      s.tweens.add({ targets: shade, alpha: 0, duration: 1200, onComplete: () => shade.destroy() });
      s.tweens.add({ targets: [form, dome], alpha: 0, duration: 900, delay: 300, onComplete: () => { form.destroy(); dome.destroy(); } });
      if (!opts.final) {
        const ray = this.img(t.x, t.y + 10, 'v_pillar', 0xfff3c4).setOrigin(0.5, 1).setScale(t.height / 160, 0).setAlpha(0.9);
        s.tweens.add({ targets: ray, scaleY: 1.9, duration: 500, ease: 'Expo.Out' });
        s.tweens.add({ targets: ray, alpha: 0, delay: 900, duration: 900, onComplete: () => ray.destroy() });
        this.burst(cx, cy, REALM_COLORS[toRealm], 40);
        t.swapCostume?.(toRealm);
        t.celebrate?.();
        t.setGlow?.(REALM_COLORS[toRealm], 4);
        s.time.delayedCall(1400, () => t.setGlow?.(0, -1));
        this.banner(`ĐỘ KIẾP THÀNH CÔNG`, `${t.name} bước vào ${REALM_NAMES[toRealm]}`, '#FFE7A3');
      }
    });
    return endAt + 1700;
  }

  // ------------------------------------------------------------------ Tầng 4: Thiên Phạt → Chân Tiên (~11 s)
  ascension(t: FxTarget) {
    const s = this.scene;
    const first = this.tribulation(t, 9, { strikes: 5, final: true }) - 1700; // two waves (5 strikes) then clear
    const cx = t.x, cy = t.y - t.height * 0.5;
    s.time.delayedCall(first, () => {
      // immortal light from the sky
      const beam = this.img(t.x, t.y + 10, 'v_pillar', 0xfff6dc).setOrigin(0.5, 1).setScale(t.height / 90, 0).setAlpha(0.95);
      s.tweens.add({ targets: beam, scaleY: 2.2, duration: 900, ease: 'Cubic.Out' });
      s.tweens.add({ targets: beam, alpha: 0.55, yoyo: true, repeat: 2, duration: 600, delay: 900 });
      const halo1 = this.img(cx, cy - t.height * 0.1, 'v_runes', 0xffe7a3).setScale(0).setAlpha(0.7);
      const halo2 = this.img(cx, cy - t.height * 0.1, 'v_ring', 0xffffff).setScale(0).setAlpha(0.8);
      s.tweens.add({ targets: [halo1, halo2], scale: t.height / 200, duration: 900, ease: 'Back.Out' });
      s.tweens.add({ targets: halo1, angle: 240, duration: 4500 });
      t.swapCostume?.(9);
      t.celebrate?.();
      t.setGlow?.(0xfff1c4, 6);
      this.flash(cx, cy, 0xfff1c4, t.height / 50);
      this.burst(cx, cy, 0xfff1c4, 60, [200, 600]);
      // petals drifting over the whole stage
      const petals = s.add.particles(0, 0, 'v_petal', {
        x: { min: 0, max: this.W }, y: -20, lifespan: 6000, speedY: { min: 90, max: 180 }, speedX: { min: -40, max: 40 },
        rotate: { min: 0, max: 360 }, scale: { min: 0.5, max: 0.9 }, alpha: { start: 0.95, end: 0.2 },
        tint: [0xffc7d9, 0xfff1c4, 0xffffff], frequency: 60, duration: 4500,
      }).setDepth(8500);
      this.over(petals);
      this.banner('CHÂN TIÊN GIÁNG THẾ', `${t.name} phi thăng!`, '#FFF1C4', 3600);
      s.time.delayedCall(4500, () => {
        s.tweens.add({ targets: [beam, halo1, halo2], alpha: 0, duration: 1000, onComplete: () => { beam.destroy(); halo1.destroy(); halo2.destroy(); } });
        t.setGlow?.(0, -1);
      });
      s.time.delayedCall(10500, () => petals.destroy());
    });
    return first + 5600;
  }

  // ------------------------------------------------------------------ Linh Khí Triều
  tide(rowsTop: number, rowsBottom: number, seconds: number) {
    const s = this.scene;
    this.tideOn?.stop();
    this.banner('LINH KHÍ TRIỀU', 'Tu Vi ×2 trong 3 phút', '#BFF7DA', 2200);
    const timer = this.text(this.W - 150, 230, '3:00', 34, '#BFF7DA');
    let left = seconds;
    const tick = s.time.addEvent({ delay: 1000, loop: true, callback: () => {
      left = Math.max(0, left - 1);
      timer.setText(`${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`);
    } });
    // light waves sweeping from the back rows to the front rows
    const wave = () => {
      const b = this.img(this.W / 2, rowsTop - 120, 'v_band', 0x7ff0c0).setDisplaySize(this.W * 1.2, 220).setAlpha(0.0);
      s.tweens.add({ targets: b, y: rowsBottom + 120, duration: 2200, ease: 'Sine.InOut' });
      s.tweens.add({ targets: b, alpha: 0.55, duration: 500, yoyo: true, hold: 1200, onComplete: () => b.destroy() });
    };
    wave();
    const waves = s.time.addEvent({ delay: 2600, loop: true, callback: wave });
    const motes = s.add.particles(0, 0, 'v_glow', {
      x: { min: 0, max: this.W }, y: { min: rowsTop, max: rowsBottom }, lifespan: 2400,
      speedY: { min: -70, max: -30 }, scale: { start: 0.22, end: 0 }, alpha: { start: 0.8, end: 0 },
      tint: [0x7ff0c0, 0xd9fff0], blendMode: 'ADD', frequency: 25,
    }).setDepth(8000);
    this.over(motes);
    const stop = () => {
      waves.remove(); tick.remove(); motes.stop();
      s.tweens.add({ targets: timer, alpha: 0, duration: 500, onComplete: () => timer.destroy() });
      s.time.delayedCall(2500, () => motes.destroy());
      this.tideOn = null;
    };
    this.tideOn = { stop };
    s.time.delayedCall(seconds * 1000, () => this.tideOn?.stop === stop && stop());
    return { stop };
  }

  // ------------------------------------------------------------------ Tâm Ma (after a failed breakthrough)
  heartDemon(t: FxTarget, ms = 6000) {
    const s = this.scene;
    const shade = this.dim(0x2a0a40, 0.45, 800);
    const ghost = this.base(s.add.image(t.x, t.y - t.height * 0.15, 'v_ghost').setTint(0x3b145c).setOrigin(0.5, 1)
      .setScale(t.height / 240).setAlpha(0).setDepth(t.y - 3));
    const eyes = [-1, 1].map((k) => this.img(t.x + k * t.height * 0.08, t.y - t.height * 1.42, 'v_glow', 0xff3d7a).setScale(0.18).setAlpha(0));
    s.tweens.add({ targets: ghost, alpha: 0.8, y: ghost.y - 20, duration: 900, ease: 'Cubic.Out' });
    s.tweens.add({ targets: ghost, scaleX: ghost.scaleX * 1.06, yoyo: true, repeat: -1, duration: 900, delay: 900, ease: 'Sine.InOut' });
    s.tweens.add({ targets: eyes, alpha: 1, duration: 400, delay: 700 });
    t.setGlow?.(0x8a3dff, 3);
    this.banner('TÂM MA XÂM NHẬP', `${t.name} cần Trợ Đạo!`, '#E2B8FF', ms - 1200);
    // Trợ Đạo bar (fills as the community helps; demo fills over time)
    const bw = 420, by = this.bannerY + 130;
    const bg = this.over(s.add.rectangle(this.W / 2, by, bw, 22, 0x1a0b2a, 0.85).setStrokeStyle(2, 0xc58bff).setDepth(9000));
    const fill = this.over(s.add.rectangle(this.W / 2 - bw / 2 + 2, by, 0, 16, 0xc58bff).setOrigin(0, 0.5).setDepth(9001));
    const label = this.text(this.W / 2, by + 34, 'Trợ Đạo 0%', 24, '#E2B8FF');
    s.tweens.addCounter({ from: 0, to: 100, duration: ms - 1500, onUpdate: (tw) => {
      const v = tw.getValue() ?? 0;
      fill.width = (bw - 4) * (v / 100);
      label.setText(`Trợ Đạo ${Math.round(v)}%`);
    } });
    s.time.delayedCall(ms - 1200, () => {
      this.flash(t.x, t.y - t.height * 0.5, 0xffffff, t.height / 70);
      this.burst(t.x, t.y - t.height * 0.5, 0xd9b8ff, 30);
      s.tweens.add({ targets: [ghost, ...eyes], alpha: 0, scaleY: 0.2, duration: 700, onComplete: () => { ghost.destroy(); eyes.forEach((e) => e.destroy()); } });
      s.tweens.add({ targets: shade, alpha: 0, duration: 900, onComplete: () => shade.destroy() });
      s.tweens.add({ targets: [bg, fill, label], alpha: 0, duration: 500, delay: 600, onComplete: () => { bg.destroy(); fill.destroy(); label.destroy(); } });
      t.setGlow?.(0, -1);
      const ok = this.text(t.x, t.y - t.height - 40, 'Đạo tâm kiên định', 30, '#FFFFFF');
      s.tweens.add({ targets: ok, y: ok.y - 40, alpha: 0, delay: 900, duration: 700, onComplete: () => ok.destroy() });
    });
    return ms;
  }

  // ------------------------------------------------------------------ Trợ Chiến (assist flies to one side)
  assist(t: FxTarget, side: 'left' | 'right', count = 5) {
    const s = this.scene;
    const color = side === 'left' ? 0x5bc0ff : 0xffa24a;
    for (let i = 0; i < count; i++) {
      s.time.delayedCall(i * 140, () => {
        const sx = side === 'left' ? 120 : this.W - 120;
        const sy = this.H - 360;
        const star = this.img(sx, sy, 'v_star', color).setScale(0.55);
        const trail = this.over(s.add.particles(0, 0, 'v_glow', {
          follow: star, lifespan: 380, scale: { start: 0.28, end: 0 }, alpha: { start: 0.8, end: 0 }, tint: color, blendMode: 'ADD', frequency: 16,
        }).setDepth(7900));
        const ctrl = { x: (sx + t.x) / 2 + (side === 'left' ? -160 : 160), y: Math.min(sy, t.y) - 260 };
        const curve = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(sx, sy), new Phaser.Math.Vector2(ctrl.x, ctrl.y), new Phaser.Math.Vector2(t.x, t.y - t.height * 0.55));
        s.tweens.addCounter({ from: 0, to: 1, duration: 700, ease: 'Sine.In', onUpdate: (tw) => {
          const p = curve.getPoint(tw.getValue() ?? 0);
          star.setPosition(p.x, p.y).setAngle((tw.getValue() ?? 0) * 360);
        }, onComplete: () => {
          star.destroy();
          trail.stop();
          s.time.delayedCall(400, () => trail.destroy());
          this.burst(t.x, t.y - t.height * 0.55, color, 8, [80, 200], 'v_star', 0.3);
        } });
      });
    }
    const lbl = this.text(t.x, t.y - t.height - 30, side === 'left' ? '◀ Trợ Chiến' : 'Trợ Chiến ▶', 28, side === 'left' ? '#BFE6FF' : '#FFD9A8');
    s.tweens.add({ targets: lbl, y: lbl.y - 40, alpha: 0, delay: 900, duration: 600, onComplete: () => lbl.destroy() });
    return 1500;
  }

  // ------------------------------------------------------------------ Cơ duyên (system card + light from above)
  fortune(t: FxTarget, item: string, grade = 'Linh phẩm') {
    const s = this.scene;
    const beam = this.img(t.x, t.y + 10, 'v_pillar', 0x9fe3ff).setOrigin(0.5, 1).setScale(t.height / 300, 0).setAlpha(0.8);
    s.tweens.add({ targets: beam, scaleY: 1.6, duration: 350, ease: 'Expo.Out' });
    s.tweens.add({ targets: beam, alpha: 0, delay: 900, duration: 700, onComplete: () => beam.destroy() });
    this.burst(t.x, t.y - t.height * 0.6, 0x9fe3ff, 16, [80, 240], 'v_star', 0.35);
    const cy = Math.max(this.bannerY + 220, t.y - t.height - 170);
    const cx = Phaser.Math.Clamp(t.x, 300, this.W - 300);
    const card = this.over(s.add.image(cx, cy, 'v_card').setScale(0.2, 0.05).setAlpha(0).setDepth(9000));
    const head = this.text(cx, cy - 46, '【 HỆ THỐNG 】', 26, '#9FE3FF', '#06142E');
    const body = this.text(cx, cy + 4, `${t.name} nhận cơ duyên`, 26, '#FFFFFF', '#06142E');
    const it = this.text(cx, cy + 48, `${item} · ${grade}`, 30, '#FFE7A3', '#06142E');
    const parts = [head, body, it];
    parts.forEach((p) => p.setAlpha(0));
    s.tweens.add({ targets: card, scaleX: 1, scaleY: 1, alpha: 1, duration: 300, ease: 'Back.Out' });
    s.tweens.add({ targets: parts, alpha: 1, duration: 250, delay: 200 });
    s.tweens.add({ targets: [card, ...parts], alpha: 0, delay: 2600, duration: 400, onComplete: () => { card.destroy(); parts.forEach((p) => p.destroy()); } });
    return 3000;
  }
}

/** Plays big effects one at a time (VISUAL_SPEC §4: only one high-priority full-screen effect). */
export class Director {
  private queue: { name: string; run: () => number; priority: number }[] = [];
  private busyUntil = 0;
  scene: Phaser.Scene;
  onStart?: (name: string) => void;
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  /** priority: 3 = Thiên Kiếp/Thiên Phạt, 2 = Đại Cảnh / Tâm Ma / Linh Khí Triều, 1 = other exclusive */
  enqueue(name: string, priority: number, run: () => number) {
    this.queue.push({ name, run, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
  }
  private clock = 0;
  /** dt in ms — the same delta the tweens use, so the queue never overlaps effects even when frames drop */
  update(dtMs: number) {
    this.clock += dtMs;
    const now = this.clock;
    if (now < this.busyUntil || this.queue.length === 0) return;
    const next = this.queue.shift()!;
    this.onStart?.(next.name);
    this.busyUntil = now + next.run() + 300;
  }
  get pending() {
    return this.queue.length;
  }
}
