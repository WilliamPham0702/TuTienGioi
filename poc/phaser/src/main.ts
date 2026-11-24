// C-002 PoC-1A — Sect hall scene in Phaser 4.
// Throwaway proof-of-concept code. Not product code.
//
// URL parameters:
//   n=40|60|80        number of disciples (default 60)
//   scenario=normal|storm
//   hud=1             show FPS counter
//   log=<url>         POST frame times to the measurement server (e.g. http://localhost:8787)
//   run=<id>          run id stored with the log
import Phaser from 'phaser';

const params = new URLSearchParams(location.search);
const N = Math.max(1, Math.min(120, parseInt(params.get('n') ?? '60', 10)));
const SCENARIO = params.get('scenario') ?? 'normal';
const HUD = params.get('hud') === '1';
const LOG_URL = params.get('log');
const RUN_ID = params.get('run') ?? `phaser-${Date.now()}`;
const SEEK = parseFloat(params.get('seek') ?? '0'); // start the scenario at this time (s), for screenshots

const W = 1080;
const H = 1920;
const FONT = 'NotoSansVI, sans-serif';

type Rig = {
  base: { w: number; h: number; scale: number; root: [number, number] };
  layers: { name: string; pivot: [number, number]; optional?: boolean }[];
  kinds: Record<string, Record<string, string>>;
  tiers: string[];
  tier_names: string[];
};
type Wave = { period: number; channels: { layer: string; prop: string; amp: number; phase: number; offset?: number }[] };
type Clip = { duration: number; tracks: Record<string, [number, number][]> };
type Anims = { waves: Record<string, Wave>; clips: Record<string, Clip> };
type Row = { y: number; scale: number; cap: number; showName: boolean };
type Layout = {
  rows: Row[];
  rowWidth: number[];
  npcs: { kind: string; x: number; y: number; scale: number; name: string }[];
  backRowTint: number;
};
type Ev = { t: number; type: string; slot: number; slot2?: number; name?: string; duration?: number };
type Scenario = { length: number; events: Ev[] };

// Front-row nameplates must fit one slot (~105 px): keep the given name, cap at 9 chars.
function shortName(name: string): string {
  const parts = name.split(' ');
  const core = parts.length > 2 ? parts.slice(-2).join(' ') : name;
  return core.length > 9 ? core.slice(0, 8) + '…' : core;
}

const smooth = (x: number) => x * x * (3 - 2 * x);
function sampleTrack(keys: [number, number][], t: number): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) return v0 + (v1 - v0) * smooth((t - t0) / Math.max(1e-6, t1 - t0));
  }
  return keys[keys.length - 1][1];
}

// ------------------------------------------------------------------ Character
class Character {
  container: Phaser.GameObjects.Container;
  parts: Record<string, Phaser.GameObjects.Image> = {};
  kind: string;
  tier = 0;
  phase: number;
  mode: 'idle' | 'cultivate' = 'idle';
  cultivateUntil = 0;
  clip: { name: string; t: number } | null = null;
  move: { fx: number; fy: number; tx: number; ty: number; t: number; dur: number } | null = null;
  baseScale: number;
  homeX: number;
  homeY: number;
  label: Phaser.GameObjects.Text | null = null;
  name: string;
  glow: Phaser.Filters.Glow | null = null;

  constructor(
    private scene: MainScene,
    kind: string,
    x: number,
    y: number,
    scale: number,
    name: string,
    tint: number,
    showName: boolean,
    fullName = false,
  ) {
    const rig = scene.rig;
    this.kind = kind;
    this.name = name;
    this.baseScale = scale;
    this.homeX = x;
    this.homeY = y;
    this.phase = Math.random();
    this.container = scene.add.container(x, y);
    this.container.setScale(scale / rig.base.scale);
    this.applyKind(kind, tint);
    if (showName) {
      this.label = scene.add
        .text(x, y + 8, fullName ? name : shortName(name), {
          fontFamily: FONT,
          fontSize: '22px',
          color: '#FFF6DA',
          stroke: '#1A1030',
          strokeThickness: 6,
          align: 'center',
        })
        .setOrigin(0.5, 0);
    }
    this.updateDepth();
  }

  applyKind(kind: string, tint = 0xffffff) {
    const rig = this.scene.rig;
    const s = rig.base.scale;
    const [rx, ry] = rig.base.root;
    const files = rig.kinds[kind];
    this.kind = kind;
    for (const layer of rig.layers) {
      const file = files[layer.name];
      let img = this.parts[layer.name];
      if (!file) {
        if (img) img.setVisible(false);
        continue;
      }
      if (!img) {
        img = this.scene.add.image(0, 0, file);
        img.setOrigin(layer.pivot[0] / rig.base.w, layer.pivot[1] / rig.base.h);
        img.setPosition((layer.pivot[0] - rx) * s, (layer.pivot[1] - ry) * s);
        this.parts[layer.name] = img;
        this.container.add(img);
      } else {
        img.setTexture(file).setVisible(true);
      }
      if (tint !== 0xffffff) img.setTint(tint);
    }
    // keep draw order identical to rig order
    for (const layer of rig.layers) {
      const img = this.parts[layer.name];
      if (img) this.container.bringToTop(img);
    }
  }

  setName(name: string) {
    this.name = name;
    this.label?.setText(shortName(name));
  }

  play(name: string) {
    this.clip = { name, t: 0 };
  }

  moveTo(tx: number, ty: number, dur: number) {
    this.move = { fx: this.container.x, fy: this.container.y, tx, ty, t: 0, dur };
  }

  updateDepth() {
    this.container.setDepth(this.container.y);
    this.label?.setDepth(this.container.y + 1);
  }

  update(time: number, dt: number) {
    const anims = this.scene.anims_;
    if (this.mode === 'cultivate' && time > this.cultivateUntil) this.mode = 'idle';
    const wave = anims.waves[this.mode];
    const rot: Record<string, number> = {};
    let rootY = 0;
    let bodySY = 1;
    for (const ch of wave.channels) {
      const v = (ch.offset ?? 0) + ch.amp * Math.sin(2 * Math.PI * (time / wave.period + this.phase + ch.phase));
      if (ch.layer === 'root' && ch.prop === 'y') rootY += v;
      else if (ch.prop === 'rot') rot[ch.layer] = (rot[ch.layer] ?? 0) + v;
      else if (ch.prop === 'scaleY') bodySY += v;
    }
    if (this.clip) {
      const clip = anims.clips[this.clip.name];
      this.clip.t += dt;
      const t = this.clip.t;
      for (const [track, keys] of Object.entries(clip.tracks)) {
        const v = sampleTrack(keys, t);
        if (track === 'root_y') rootY += v;
        else if (track === 'head_rot') {
          for (const l of ['head', 'face', 'hair_front', 'hat', 'beard']) rot[l] = (rot[l] ?? 0) + v;
        } else rot[track] = (rot[track] ?? 0) + v;
      }
      if (t >= clip.duration) this.clip = null;
    }
    if (this.move) {
      const m = this.move;
      m.t += dt;
      const k = Math.min(1, m.t / m.dur);
      const e = smooth(k);
      this.container.x = m.fx + (m.tx - m.fx) * e;
      this.homeY = m.fy + (m.ty - m.fy) * e;
      rootY += -Math.abs(Math.sin(k * Math.PI * 4)) * 16; // hopping walk
      if (k >= 1) {
        this.move = null;
        this.homeX = m.tx;
      }
    }
    const s = this.scene.rig.base.scale;
    for (const [layer, deg] of Object.entries(rot)) {
      const img = this.parts[layer];
      if (img) img.setAngle(deg);
    }
    this.parts.body?.setScale(1, bodySY);
    this.container.y = this.homeY + rootY * (this.baseScale);
    if (this.label) this.label.setPosition(this.container.x, this.homeY + 8);
    if (this.move) this.updateDepth();
    void s;
  }
}

// ------------------------------------------------------------------ Scene
class MainScene extends Phaser.Scene {
  rig!: Rig;
  anims_!: Anims;
  layout!: Layout;
  scenario!: Scenario;
  names!: string[];
  chars: Character[] = [];
  slots: { x: number; y: number; scale: number; showName: boolean; tint: number }[] = [];
  evIndex = 0;
  scTime = 0;
  qiEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  qiBusy: Map<Phaser.GameObjects.Particles.ParticleEmitter, Character> = new Map();
  layers: Record<string, Phaser.GameObjects.Image> = {};
  banner!: Phaser.GameObjects.Text;
  hudText: Phaser.GameObjects.Text | null = null;
  frameTimes: number[] = [];
  lastFlush = 0;
  startedAt = 0;

  constructor() {
    super('main');
  }

  preload() {
    this.load.json('rig', 'assets/rig.json');
    this.load.json('anims', 'shared/anims.json');
    this.load.json('layout', 'shared/layout.json');
    this.load.json('names', 'shared/names.json');
    this.load.json('scenario', `shared/scenario_${SCENARIO}.json`);
    this.load.once('filecomplete-json-rig', (_k: string, _t: string, rig: Rig) => {
      const files = new Set<string>();
      for (const kind of Object.values(rig.kinds)) for (const f of Object.values(kind)) files.add(f);
      for (const f of files) this.load.image(f, `assets/${f}`);
    });
    for (const f of ['bg_sky', 'bg_mountains', 'bg_hall', 'fg_mist', 'fx_glow', 'fx_seal', 'fx_pillar'])
      this.load.image(f, `assets/${f}.png`);
  }

  create() {
    this.rig = this.cache.json.get('rig');
    this.anims_ = this.cache.json.get('anims');
    this.layout = this.cache.json.get('layout');
    this.scenario = this.cache.json.get('scenario');
    this.names = this.cache.json.get('names').names;

    // background layers
    this.layers.sky = this.add.image(W / 2, H / 2, 'bg_sky').setDepth(-1000);
    this.layers.mountains = this.add.image(W / 2, H / 2, 'bg_mountains').setDepth(-999);
    this.layers.hall = this.add.image(W / 2, H / 2, 'bg_hall').setDepth(-998);
    this.layers.mist = this.add.image(W / 2, H / 2, 'fg_mist').setDepth(5000).setAlpha(0.85);

    // ambient qi motes across the hall
    this.add
      .particles(0, 0, 'fx_glow', {
        x: { min: 0, max: W },
        y: { min: 900, max: H },
        lifespan: 6000,
        speedY: { min: -40, max: -15 },
        speedX: { min: -8, max: 8 },
        scale: { start: 0.35, end: 0 },
        alpha: { start: 0.7, end: 0 },
        frequency: 120,
        blendMode: 'ADD',
      })
      .setDepth(4000);

    this.buildSlots();
    for (const npc of this.layout.npcs) {
      const c = new Character(this, npc.kind, npc.x, npc.y, npc.scale, npc.name, 0xffffff, true, true);
      this.chars.push(c); // NPCs are not addressed by scenario slots
    }
    this.npcCount = this.layout.npcs.length;
    for (let i = 0; i < N; i++) {
      const s = this.slots[i];
      const c = new Character(this, this.rig.tiers[0], s.x, s.y, s.scale, this.names[i % this.names.length], s.tint, s.showName);
      c.tier = 0;
      this.chars.push(c);
    }

    // pooled qi emitters for cultivating characters
    for (let i = 0; i < 12; i++) {
      const e = this.add.particles(0, 0, 'fx_glow', {
        lifespan: 1400,
        speedY: { min: -70, max: -30 },
        speedX: { min: -15, max: 15 },
        scale: { start: 0.45, end: 0 },
        alpha: { start: 0.9, end: 0 },
        frequency: 70,
        blendMode: 'ADD',
        emitting: false,
      });
      e.setDepth(4500);
      this.qiEmitters.push(e);
    }

    this.banner = this.add
      .text(W / 2, 700, '', {
        fontFamily: FONT,
        fontSize: '54px',
        color: '#FFE7A3',
        stroke: '#3A1A40',
        strokeThickness: 10,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(6000)
      .setAlpha(0);

    if (HUD) {
      this.hudText = this.add
        .text(16, 16, '', { fontFamily: 'monospace', fontSize: '28px', color: '#00FF88', backgroundColor: '#000000' })
        .setDepth(9999);
    }
    this.startedAt = performance.now();
    this.lastFlush = this.startedAt;
    if (SEEK > 0) {
      this.scTime = SEEK;
      while (this.evIndex < this.scenario.events.length && this.scenario.events[this.evIndex].t < SEEK) this.evIndex++;
    }
  }

  hudAt = 0;
  lastFrameAt = 0;

  npcCount = 0;

  disciple(slot: number): Character {
    return this.chars[this.npcCount + (slot % N)];
  }

  buildSlots() {
    const rows = this.layout.rows;
    let remaining = N;
    rows.forEach((row, ri) => {
      if (remaining <= 0) return;
      const count = Math.min(row.cap, remaining);
      remaining -= count;
      const width = this.layout.rowWidth[ri];
      const depthK = ri / (rows.length - 1);
      const shade = 1 - (1 - this.layout.backRowTint) * depthK;
      const c = Math.round(255 * shade);
      const tint = (c << 16) | (c << 8) | c;
      for (let i = 0; i < count; i++) {
        const x = W / 2 - width / 2 + (width / count) * (i + 0.5) + (ri % 2 ? 12 : -12);
        this.slots.push({ x, y: row.y, scale: row.scale, showName: row.showName, tint });
      }
    });
  }

  // ---------------------------------------------------------- scenario events
  runEvents(dt: number) {
    const sc = this.scenario;
    this.scTime += dt;
    if (this.scTime >= sc.length) {
      this.scTime -= sc.length;
      this.evIndex = 0;
    }
    while (this.evIndex < sc.events.length && sc.events[this.evIndex].t <= this.scTime) {
      this.handle(sc.events[this.evIndex]);
      this.evIndex++;
    }
  }

  handle(ev: Ev) {
    const c = this.disciple(ev.slot);
    const now = this.time.now / 1000;
    switch (ev.type) {
      case 'celebrate':
        if (!c.move) c.play('celebrate');
        break;
      case 'cultivate': {
        c.mode = 'cultivate';
        c.cultivateUntil = now + (ev.duration ?? 8);
        const e = this.qiEmitters.find((x) => !this.qiBusy.has(x));
        if (e) {
          this.qiBusy.set(e, c);
          e.start();
          this.time.delayedCall((ev.duration ?? 8) * 1000, () => {
            e.stop();
            this.qiBusy.delete(e);
          });
        }
        break;
      }
      case 'join': {
        const tx = c.homeX;
        const ty = c.homeY;
        c.setName(ev.name ?? c.name);
        c.tier = 0;
        c.applyKind(this.rig.tiers[0]);
        const fromLeft = tx < W / 2;
        c.container.x = fromLeft ? -80 : W + 80;
        c.moveTo(tx, ty, 1.6);
        break;
      }
      case 'swap': {
        const d = this.disciple(ev.slot2 ?? 0);
        if (c === d || c.move || d.move) break;
        const cx = c.homeX, cy = c.homeY, dx = d.homeX, dy = d.homeY;
        const cs = c.baseScale, ds = d.baseScale;
        c.moveTo(dx, dy, 1.1);
        d.moveTo(cx, cy, 1.1);
        c.baseScale = ds; d.baseScale = cs;
        c.container.setScale(ds / this.rig.base.scale);
        d.container.setScale(cs / this.rig.base.scale);
        break;
      }
      case 'breakthrough':
        this.breakthrough(c);
        break;
    }
  }

  breakthrough(c: Character) {
    const x = c.container.x;
    const y = c.homeY;
    const sc = c.baseScale;
    // 1) seal ring under the feet
    const seal = this.add.image(x, y - 4, 'fx_seal').setDepth(c.container.depth - 1).setBlendMode('ADD')
      .setScale(0).setAlpha(0.95);
    seal.scaleY = 0;
    this.tweens.add({ targets: seal, scaleX: sc * 0.9, scaleY: sc * 0.35, duration: 500, ease: 'Back.Out' });
    this.tweens.add({ targets: seal, angle: 360, duration: 2600 });
    // 2) qi gathering: particles converge to the character
    const gather = this.add.particles(x, y - 80 * sc, 'fx_glow', {
      emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 220 * sc), quantity: 24 },
      moveToX: 0,
      moveToY: 0,
      lifespan: 700,
      scale: { start: 0.6, end: 0.1 },
      alpha: { start: 0.2, end: 1 },
      frequency: 40,
      blendMode: 'ADD',
    }).setDepth(4600);
    gather.setPosition(x, y - 80 * sc);
    // 3) engine-native glow filter on the character
    c.container.enableFilters();
    const glow = c.container.filters!.internal.addGlow(0xffe7a3, 0, 0, 1, false, 10, 12);
    this.tweens.add({ targets: glow, outerStrength: 6, duration: 1300 });

    this.time.delayedCall(1400, () => {
      gather.stop();
      // 4) light pillar + burst
      const pillar = this.add.image(x, y, 'fx_pillar').setOrigin(0.5, 1).setBlendMode('ADD').setDepth(4700)
        .setScale(sc * 1.4, 1.2).setAlpha(0);
      this.tweens.add({ targets: pillar, alpha: 1, duration: 150, yoyo: true, hold: 250, onComplete: () => pillar.destroy() });
      const burst = this.add.particles(x, y - 80 * sc, 'fx_glow', {
        speed: { min: 150, max: 420 },
        lifespan: 900,
        scale: { start: 0.7, end: 0 },
        alpha: { start: 1, end: 0 },
        blendMode: 'ADD',
        emitting: false,
      }).setDepth(4700);
      burst.explode(36);
      this.time.delayedCall(1200, () => burst.destroy());
      // 5) tier change + celebrate
      c.tier = (c.tier + 1) % this.rig.tiers.length;
      c.applyKind(this.rig.tiers[c.tier]);
      c.play('celebrate');
      this.tweens.add({ targets: c.container, scaleX: c.container.scaleX * 1.15, scaleY: c.container.scaleY * 1.15, duration: 160, yoyo: true });
      // 6) banner
      this.banner.setText(`${c.name}\nđột phá ${this.rig.tier_names[c.tier]}!`).setScale(0.6).setAlpha(1);
      this.tweens.killTweensOf(this.banner);
      this.tweens.add({ targets: this.banner, scale: 1, duration: 300, ease: 'Back.Out' });
      this.tweens.add({ targets: this.banner, alpha: 0, delay: 1800, duration: 500 });
    });
    this.time.delayedCall(2600, () => {
      gather.destroy();
      this.tweens.add({
        targets: seal, alpha: 0, duration: 300, onComplete: () => seal.destroy(),
      });
      this.tweens.add({
        targets: glow, outerStrength: 0, duration: 300,
        onComplete: () => { c.container.filters?.internal.clear(); },
      });
    });
  }

  // ---------------------------------------------------------- frame loop
  update(time: number, delta: number) {
    const dt = Math.min(delta, 100) / 1000;
    const t = time / 1000;
    // Log the REAL interval between frames. Phaser's `delta` is smoothed, so it is not used for measurement.
    const nowMs = performance.now();
    if (this.lastFrameAt > 0) this.frameTimes.push(+(nowMs - this.lastFrameAt).toFixed(3));
    this.lastFrameAt = nowMs;
    this.runEvents(dt);
    (window as unknown as { __scTime: number }).__scTime = this.scTime;
    for (const c of this.chars) c.update(t, dt);
    for (const [e, c] of this.qiBusy) e.setPosition(c.container.x, c.container.y - 60 * c.baseScale);
    // slow parallax
    this.layers.mountains.x = W / 2 + Math.sin(t * 0.15) * 14;
    this.layers.mist.x = W / 2 + Math.sin(t * 0.22) * 40;
    if (this.hudText && time - this.hudAt > 500) {
      this.hudAt = time;
      const recent = this.frameTimes.slice(-30);
      const fps = recent.length ? 1000 / (recent.reduce((a, b) => a + b, 0) / recent.length) : 0;
      this.hudText.setText(`Phaser ${Phaser.VERSION} | n=${N} | ${fps.toFixed(1)} fps`);
    }
    const now = performance.now();
    if (now - this.lastFlush > 5000) this.flush(now);
  }

  flush(now: number) {
    const batch = this.frameTimes;
    this.frameTimes = [];
    this.lastFlush = now;
    if (!LOG_URL) return;
    const body = JSON.stringify({
      run: RUN_ID, engine: 'phaser', engineVersion: Phaser.VERSION, renderer: this.game.renderer.type === Phaser.WEBGL ? 'webgl' : 'canvas',
      n: N, scenario: SCENARIO, tSinceStartMs: Math.round(now - this.startedAt), frameMs: batch,
      memory: (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? null,
      userAgent: navigator.userAgent,
    });
    fetch(`${LOG_URL}/frames`, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true })
      .catch(() => { /* measurement server not running: ignore */ });
  }
}

async function start() {
  try {
    await document.fonts.load(`700 24px NotoSansVI`, 'Đạo hữu');
  } catch {
    /* fall back to system font */
  }
  const game = new Phaser.Game({
    type: Phaser.WEBGL,
    parent: 'game',
    width: W,
    height: H,
    backgroundColor: '#000000',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    fps: { target: 60 },
    scene: [MainScene],
  });
  (window as unknown as { __game: Phaser.Game }).__game = game; // for automated checks
}
start();
