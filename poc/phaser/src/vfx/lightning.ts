// Procedural directional lightning (Thiên Kiếp). Each strike is a new random bolt with branches.
import Phaser from 'phaser';

type P = { x: number; y: number };

function displace(a: P, b: P, rough: number, depth: number, out: P[]) {
  if (depth === 0) {
    out.push(b);
    return;
  }
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  // offset perpendicular to the segment
  const nx = -(b.y - a.y) / (len || 1);
  const ny = (b.x - a.x) / (len || 1);
  const off = (Math.random() - 0.5) * len * rough;
  const m = { x: mx + nx * off, y: my + ny * off };
  displace(a, m, rough, depth - 1, out);
  displace(m, b, rough, depth - 1, out);
}

export function boltPath(from: P, to: P, rough = 0.55, depth = 6): P[] {
  const pts: P[] = [from];
  displace(from, to, rough, depth, pts);
  return pts;
}

function strokePath(g: Phaser.GameObjects.Graphics, pts: P[], width: number, color: number, alpha: number) {
  g.lineStyle(width, color, alpha);
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.strokePath();
}

/**
 * Draw one bolt (with branches) into a new additive Graphics object and fade it out.
 * Returns the graphics so the caller can put it on the right camera/layer.
 */
export function strike(
  scene: Phaser.Scene,
  from: P,
  to: P,
  opts: { color?: number; width?: number; branches?: number; life?: number; depth?: number } = {},
): Phaser.GameObjects.Graphics {
  const color = opts.color ?? 0x9fd8ff;
  const w = opts.width ?? 7;
  const g = scene.add.graphics().setBlendMode(Phaser.BlendModes.ADD).setDepth(opts.depth ?? 7000);
  const main = boltPath(from, to);
  const layers = (pts: P[], k: number) => {
    strokePath(g, pts, w * 4 * k, color, 0.12);
    strokePath(g, pts, w * 2 * k, color, 0.35);
    strokePath(g, pts, w * k, 0xffffff, 0.95);
  };
  layers(main, 1);
  const n = opts.branches ?? 4;
  for (let i = 0; i < n; i++) {
    const at = main[Math.floor(main.length * (0.2 + Math.random() * 0.6))];
    const ang = Math.atan2(to.y - from.y, to.x - from.x) + (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.6);
    const l = 80 + Math.random() * 160;
    const end = { x: at.x + Math.cos(ang) * l, y: at.y + Math.sin(ang) * l };
    layers(boltPath(at, end, 0.6, 4), 0.45);
  }
  // quick double-flicker then fade: real lightning blinks, but we keep it short (no strobe)
  g.setAlpha(1);
  scene.tweens.chain({
    targets: g,
    tweens: [
      { alpha: 0.35, duration: 50 },
      { alpha: 1, duration: 40 },
      { alpha: 0, duration: opts.life ?? 380, ease: 'Quad.In' },
    ],
    onComplete: () => g.destroy(),
  });
  return g;
}
