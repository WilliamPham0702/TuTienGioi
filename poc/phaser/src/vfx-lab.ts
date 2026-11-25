// VFX lab — plays every effect of the VFX library on a stand-in scene.
// Placeholder art (outdoor plaza + chibi) will be replaced by the ChatGPT art set; the effects stay.
//
// URL parameters:
//   fx=minor|major|tribulation|ascension|tide|heartDemon|assist|fortune   loop one effect (default: all, in order)
//   ui=1      show buttons (to trigger effects by hand)
//   bloom=0   turn the bloom filter off (for slower PCs)
//   hud=1     FPS counter
import Phaser from 'phaser';
import { Director, FONT, REALM_COLORS, REALM_NAMES, Vfx, type FxTarget } from './vfx/effects';

const params = new URLSearchParams(location.search);
const W = 1080;
const H = 1920;
const ONLY = params.get('fx');
const UI = params.get('ui') === '1';
const INLINE = !!(window as unknown as { __ASSETS?: unknown }).__ASSETS; // single-file preview: buttons + autoplay
const BLOOM = params.get('bloom') !== '0';
const HUD = params.get('hud') === '1';
const SNAP = params.get('snap') ? Number(params.get('snap')) : null; // pause N ms after the first effect starts (screenshots)

type Rig = {
  base: { w: number; h: number; scale: number; root: [number, number] };
  layers: { name: string; pivot: [number, number] }[];
  kinds: Record<string, Record<string, string>>;
  tiers: string[];
};

class Chibi implements FxTarget {
  c: Phaser.GameObjects.Container;
  parts: Record<string, Phaser.GameObjects.Image> = {};
  height: number;
  phase = Math.random() * 10;
  hop = 0;
  constructor(private scene: Lab, public kind: string, public x: number, public y: number, scale: number, public name: string) {
    const rig = scene.rig;
    this.height = rig.base.h * scale;
    this.c = scene.add.container(x, y).setScale(scale / rig.base.scale).setDepth(y);
    scene.vfx.base(this.c);
    this.applyKind(kind);
  }
  applyKind(kind: string) {
    const rig = this.scene.rig;
    const s = rig.base.scale;
    const [rx, ry] = rig.base.root;
    const files = rig.kinds[kind];
    for (const L of rig.layers) {
      let img = this.parts[L.name];
      const f = files[L.name];
      if (!f) { img?.setVisible(false); continue; }
      if (!img) {
        img = this.scene.add.image((L.pivot[0] - rx) * s, (L.pivot[1] - ry) * s, f).setOrigin(L.pivot[0] / rig.base.w, L.pivot[1] / rig.base.h);
        this.parts[L.name] = img;
        this.c.add(img);
      } else img.setTexture(f).setVisible(true);
    }
    for (const L of rig.layers) if (this.parts[L.name]) this.c.bringToTop(this.parts[L.name]);
  }
  swapCostume = (realm: number) => {
    if (this.kind.startsWith('disciple')) this.applyKind(this.scene.rig.tiers[Math.min(2, Math.floor(realm / 3) + (realm > 0 ? 1 : 0)) % 3]);
  };
  // Character glow = additive aura behind the sprites (readable on small chibi, no per-character filter cost)
  aura: Phaser.GameObjects.Image | null = null;
  setGlow = (color: number, strength: number) => {
    if (!this.aura) {
      this.aura = this.scene.add.image(this.x, this.y - this.height * 0.5, 'v_glow').setBlendMode(Phaser.BlendModes.ADD)
        .setScale(this.height / 70).setDepth(this.y - 0.5).setAlpha(0);
      this.scene.vfx.base(this.aura);
    }
    if (strength < 0) {
      this.aura.setAlpha(0);
      return;
    }
    this.aura.setTint(color).setAlpha(Math.min(1, strength / 6) * 0.95);
  };
  celebrate = () => {
    this.hop = 1.2;
  };
  update(t: number, dt: number) {
    const k = Math.sin((t + this.phase) * 2.4);
    this.parts.body?.setScale(1, 1 + 0.018 * k);
    for (const l of ['head', 'face', 'hair_front', 'hat', 'beard']) this.parts[l]?.setAngle(2 * Math.sin((t + this.phase) * 2.4 + 0.8));
    this.parts.hair_back?.setAngle(3.5 * Math.sin((t + this.phase) * 2.4 + 1.6));
    this.parts.cape?.setAngle(2.5 * Math.sin((t + this.phase) * 2.4 + 2));
    let arm = 3 * k;
    let y = this.y;
    if (this.hop > 0) {
      this.hop = Math.max(0, this.hop - dt);
      const p = 1 - this.hop / 1.2;
      arm = p < 0.85 ? 125 : 125 * (1 - (p - 0.85) / 0.15);
      y -= Math.abs(Math.sin(p * Math.PI * 2)) * 22;
    }
    this.parts.arm_l?.setAngle(arm);
    this.parts.arm_r?.setAngle(-arm);
    this.c.y = y;
  }
}

class Lab extends Phaser.Scene {
  rig!: Rig;
  vfx!: Vfx;
  director!: Director;
  chars: Chibi[] = [];
  label!: Phaser.GameObjects.Text;
  hud: Phaser.GameObjects.Text | null = null;
  frames: number[] = [];
  step = 0;
  constructor() { super('lab'); }

  preload() {
    // single-file preview build: assets are embedded as data URIs in window.__ASSETS
    const inline = (window as unknown as { __ASSETS?: Record<string, string> }).__ASSETS;
    const url = (p: string) => inline?.[p] ?? p;
    const loadImages = (rig: Rig) => {
      const files = new Set<string>();
      for (const kind of Object.values(rig.kinds)) for (const f of Object.values(kind)) files.add(f);
      for (const f of files) this.load.image(f, url(`assets/${f}`));
    };
    if (inline) {
      const rig = JSON.parse(inline['assets/rig.json']) as Rig;
      this.cache.json.add('rig', rig);
      loadImages(rig);
    } else {
      this.load.json('rig', 'assets/rig.json');
      this.load.once('filecomplete-json-rig', (_k: string, _t: string, rig: Rig) => loadImages(rig));
    }
    this.load.image('bg_sky', url('assets/bg_sky.png'));
    this.load.image('bg_mountains', url('assets/bg_mountains.png'));
  }

  /** Stand-in outdoor plaza (code-drawn) — to be replaced by the approved art. */
  makePlaza() {
    if (this.textures.exists('plaza')) return;
    const t = this.textures.createCanvas('plaza', W, H)!;
    const c = t.getContext();
    // distant hall silhouette
    c.fillStyle = '#2a2350';
    c.beginPath();
    c.moveTo(250, 640); c.lineTo(830, 640); c.lineTo(800, 520); c.quadraticCurveTo(540, 470, 280, 520); c.closePath(); c.fill();
    c.fillStyle = '#3a3168';
    c.fillRect(300, 640, 480, 150);
    c.fillStyle = '#e8c35a';
    c.fillRect(280, 636, 520, 8);
    // dais + steps
    c.fillStyle = '#d9cdb4'; c.fillRect(330, 760, 420, 40);
    c.fillStyle = '#c7b897'; c.fillRect(290, 800, 500, 40);
    c.fillStyle = '#b5a481'; c.fillRect(250, 840, 580, 40);
    // stone plaza with perspective
    const g = c.createLinearGradient(0, 880, 0, H);
    g.addColorStop(0, '#a99f93'); g.addColorStop(1, '#6f6658');
    c.fillStyle = g;
    c.fillRect(0, 880, W, H - 880);
    c.strokeStyle = 'rgba(60,50,40,0.35)';
    c.lineWidth = 2;
    for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(540 + i * 30, 880); c.lineTo(540 + i * 160, H); c.stroke(); }
    for (let k = 0; k < 14; k++) { const y = 880 + k * k * 5.6; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    t.refresh();
  }

  create() {
    this.rig = this.cache.json.get('rig');
    this.vfx = new Vfx(this, { bloom: BLOOM });
    this.director = new Director(this);
    this.makePlaza();
    this.vfx.base(this.add.image(W / 2, H / 2, 'bg_sky').setDepth(-1000));
    this.vfx.base(this.add.image(W / 2, H / 2 - 120, 'bg_mountains').setDepth(-999));
    this.vfx.base(this.add.image(W / 2, H / 2, 'plaza').setDepth(-998));
    // ambient motes
    this.vfx.base(this.add.particles(0, 0, 'v_glow', {
      x: { min: 0, max: W }, y: { min: 700, max: 1700 }, lifespan: 6000, speedY: { min: -35, max: -12 },
      scale: { start: 0.12, end: 0 }, alpha: { start: 0.6, end: 0 }, blendMode: 'ADD', frequency: 140,
    }).setDepth(2000));

    this.chars.push(new Chibi(this, 'master', 540, 800, 0.8, 'Tông Chủ Vân Thiên'));
    this.chars.push(new Chibi(this, 'elder', 330, 880, 0.62, 'Đại Trưởng Lão'));
    this.chars.push(new Chibi(this, 'elder', 750, 880, 0.62, 'Nhị Trưởng Lão'));
    const rows = [{ y: 1500, n: 6, s: 0.62 }, { y: 1350, n: 7, s: 0.54 }, { y: 1220, n: 8, s: 0.47 }, { y: 1110, n: 9, s: 0.41 }];
    const names = ['Minh', 'Lan', 'Tuấn', 'Hương', 'Khoa', 'Ngọc', 'Phúc', 'Thảo', 'Dũng', 'Vy'];
    let i = 0;
    for (const r of rows) for (let k = 0; k < r.n; k++) {
      const x = 90 + ((W - 180) / (r.n - 1)) * k + (r.n % 2 ? 0 : 20);
      this.chars.push(new Chibi(this, 'disciple_t1', x, r.y, r.s, `Đạo hữu ${names[i++ % names.length]}`));
    }
    // idle auras on the NPCs only (cheap; disciples get theirs from the game when cultivating)
    this.vfx.aura(this.chars[0], 7);
    this.vfx.aura(this.chars[1], 4);
    this.vfx.aura(this.chars[2], 4);

    this.label = this.vfx.over(this.add.text(24, 120, '', { fontFamily: FONT, fontSize: '26px', color: '#FFFFFF', stroke: '#000000', strokeThickness: 5 }).setDepth(9500));
    if (HUD) this.hud = this.vfx.over(this.add.text(24, 70, '', { fontFamily: 'monospace', fontSize: '26px', color: '#00FF88', backgroundColor: '#000000' }).setDepth(9500));
    this.director.onStart = (n) => {
      this.label.setText(`▶ ${n}`);
      if (this.firstAt < 0) this.firstAt = this.time.now;
    };
    if (UI || INLINE) this.buildButtons();
    this.queueDemo();
  }

  pick(front = true) {
    const list = this.chars.slice(3, front ? 16 : this.chars.length);
    return list[Math.floor(Math.random() * list.length)];
  }

  demos: Record<string, [string, number, () => number]> = {
    minor: ['Tầng 1 · Tiểu Cảnh', 1, () => { const c = this.pick(); return this.vfx.minor(c, 0, 1200, 'Luyện Khí tầng 4'); }],
    major: ['Tầng 2 · Đại Cảnh (Luyện Khí → Trúc Cơ)', 2, () => this.vfx.major(this.pick(), 1)],
    tribulation: ['Tầng 3 · Thiên Kiếp (Kim Đan → Nguyên Anh)', 3, () => this.vfx.tribulation(this.pick(), 3)],
    ascension: ['Tầng 4 · Thiên Phạt → Chân Tiên', 3, () => this.vfx.ascension(this.pick())],
    tide: ['Linh Khí Triều', 2, () => { this.vfx.tide(1050, 1560, 8); return 8500; }],
    heartDemon: ['Tâm Ma (đột phá thất bại)', 2, () => this.vfx.heartDemon(this.pick())],
    assist: ['Trợ Chiến', 1, () => { this.vfx.assist(this.chars[1], 'left'); this.vfx.assist(this.chars[2], 'right'); return 1800; }],
    fortune: ['Cơ duyên', 1, () => this.vfx.fortune(this.pick(), 'Trúc Cơ Đan ×1', 'Linh phẩm')],
  };

  queueDemo() {
    const order = ONLY && this.demos[ONLY] ? [ONLY] : ['minor', 'major', 'fortune', 'assist', 'tide', 'heartDemon', 'tribulation', 'ascension'];
    for (const k of order) {
      const [name, pr, run] = this.demos[k];
      this.director.enqueue(name, pr, run);
    }
    // keep FIFO for the demo: re-sort by order instead of priority
    (this.director as unknown as { queue: { name: string }[] }).queue.sort((a, b) =>
      order.indexOf(Object.keys(this.demos).find((k) => this.demos[k][0] === a.name)!) -
      order.indexOf(Object.keys(this.demos).find((k) => this.demos[k][0] === b.name)!));
  }

  buildButtons() {
    const ui = document.getElementById('ui')!;
    ui.style.display = 'flex';
    for (const [k, [name, pr, run]] of Object.entries(this.demos)) {
      const b = document.createElement('button');
      b.textContent = name.split('(')[0].trim();
      b.onclick = () => this.director.enqueue(name, pr, run);
      ui.appendChild(b);
      void k;
    }
  }

  last = 0;
  firstAt = -1;
  fxClock = 0;
  update(time: number, delta: number) {
    if (this.firstAt >= 0) this.fxClock += delta; // same delta the tweens use
    if (SNAP !== null && this.firstAt >= 0 && this.fxClock >= SNAP) {
      (window as unknown as { __snap: boolean }).__snap = true;
      this.scene.pause();
      return;
    }
    const dt = Math.min(delta, 100) / 1000;
    const now = performance.now();
    if (this.last) this.frames.push(now - this.last);
    this.last = now;
    for (const c of this.chars) c.update(time / 1000, dt);
    this.vfx.update(dt);
    this.director.update(delta);
    if (this.director.pending === 0 && !UI) this.queueDemo();
    if (this.hud && this.frames.length >= 30) {
      const avg = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
      this.hud.setText(`${(1000 / avg).toFixed(1)} fps${BLOOM ? '' : ' (no bloom)'}`);
      this.frames = [];
    }
    (window as unknown as { __labTime: number }).__labTime = time;
  }
}

async function start() {
  try { await document.fonts.load('700 24px NotoSansVI', 'Đạo hữu'); } catch { /* ignore */ }
  const game = new Phaser.Game({
    type: Phaser.WEBGL, parent: 'game', width: W, height: H, backgroundColor: '#000000',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [Lab],
  });
  (window as unknown as { __game: Phaser.Game }).__game = game;
}
start();
void REALM_COLORS; void REALM_NAMES;
