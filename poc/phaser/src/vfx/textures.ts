// Procedural VFX textures (drawn in code: no third-party art, 0 VND).
// Every texture is white/neutral where possible so it can be tinted per realm / linh căn.
import Phaser from 'phaser';

type Ctx = CanvasRenderingContext2D;

function canvas(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx, w: number, h: number) => void) {
  if (scene.textures.exists(key)) return;
  const t = scene.textures.createCanvas(key, w, h)!;
  draw(t.getContext(), w, h);
  t.refresh();
}

function radial(c: Ctx, x: number, y: number, r: number, stops: [number, string][]) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  for (const [o, col] of stops) g.addColorStop(o, col);
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}

/** Seeded random so textures are identical on every run. */
function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function makeVfxTextures(scene: Phaser.Scene) {
  // soft round glow
  canvas(scene, 'v_glow', 128, 128, (c, w) => radial(c, w / 2, w / 2, w / 2, [
    [0, 'rgba(255,255,255,1)'], [0.18, 'rgba(255,255,255,0.85)'], [0.45, 'rgba(255,255,255,0.25)'], [1, 'rgba(255,255,255,0)'],
  ]));
  // tiny hard dot (for dense motes)
  canvas(scene, 'v_dot', 16, 16, (c, w) => radial(c, w / 2, w / 2, w / 2, [[0, 'rgba(255,255,255,1)'], [0.5, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]));
  // 4-point star sparkle
  canvas(scene, 'v_star', 96, 96, (c, w) => {
    const m = w / 2;
    radial(c, m, m, m * 0.45, [[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']]);
    c.fillStyle = 'rgba(255,255,255,0.95)';
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      c.beginPath();
      c.moveTo(m - dx * m, m - dy * m);
      c.quadraticCurveTo(m + dy * 4, m + dx * 4, m + dx * m, m + dy * m);
      c.quadraticCurveTo(m - dy * 4, m - dx * 4, m - dx * m, m - dy * m);
      c.fill();
    }
  });
  // streak (motion trail / falling light)
  canvas(scene, 'v_streak', 32, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.75, 'rgba(255,255,255,0.7)');
    g.addColorStop(1, 'rgba(255,255,255,1)');
    const gx = c.createLinearGradient(0, 0, w, 0);
    gx.addColorStop(0, 'rgba(0,0,0,1)');
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    c.fill();
  });
  // vertical light pillar (soft edges both axes)
  canvas(scene, 'v_pillar', 256, 1024, (c, w, h) => {
    for (let x = 0; x < w; x++) {
      const k = 1 - Math.abs(x - w / 2) / (w / 2);
      const a = Math.pow(k, 2.2);
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, `rgba(255,255,255,0)`);
      g.addColorStop(0.25, `rgba(255,255,255,${a * 0.8})`);
      g.addColorStop(0.92, `rgba(255,255,255,${a})`);
      g.addColorStop(1, `rgba(255,255,255,0)`);
      c.fillStyle = g;
      c.fillRect(x, 0, 1, h);
    }
  });
  // thin ring (shockwave)
  canvas(scene, 'v_ring', 512, 512, (c, w) => {
    const m = w / 2;
    for (let i = 0; i < 14; i++) {
      c.strokeStyle = `rgba(255,255,255,${0.08 + (i === 7 ? 0.9 : 0.05)})`;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(m, m, m - 14 - i * 1.4, 0, Math.PI * 2);
      c.stroke();
    }
    c.strokeStyle = 'rgba(255,255,255,1)';
    c.lineWidth = 6;
    c.beginPath();
    c.arc(m, m, m - 24, 0, Math.PI * 2);
    c.stroke();
  });
  // rune circle (phù văn): concentric rings + abstract glyph strokes, deterministic
  canvas(scene, 'v_runes', 512, 512, (c, w) => {
    const m = w / 2;
    const r = rand(11);
    c.strokeStyle = 'rgba(255,255,255,1)';
    c.lineCap = 'round';
    const ring = (rad: number, lw: number, dash: number[] = []) => {
      c.setLineDash(dash);
      c.lineWidth = lw;
      c.beginPath();
      c.arc(m, m, rad, 0, Math.PI * 2);
      c.stroke();
    };
    ring(244, 5);
    ring(226, 2);
    ring(160, 3);
    ring(150, 1.5, [6, 8]);
    ring(70, 3);
    c.setLineDash([]);
    // glyph band between 160 and 226
    const glyphs = 24;
    for (let i = 0; i < glyphs; i++) {
      const a = (i / glyphs) * Math.PI * 2;
      c.save();
      c.translate(m + Math.cos(a) * 193, m + Math.sin(a) * 193);
      c.rotate(a + Math.PI / 2);
      c.lineWidth = 3;
      c.beginPath();
      const strokes = 2 + Math.floor(r() * 3);
      for (let s = 0; s < strokes; s++) {
        const x0 = (r() - 0.5) * 22, y0 = (r() - 0.5) * 24;
        const x1 = (r() - 0.5) * 22, y1 = (r() - 0.5) * 24;
        c.moveTo(x0, y0);
        c.quadraticCurveTo((x0 + x1) / 2 + (r() - 0.5) * 10, (y0 + y1) / 2 + (r() - 0.5) * 10, x1, y1);
      }
      c.stroke();
      c.restore();
    }
    // inner hexagram
    c.lineWidth = 2.5;
    for (const off of [0, Math.PI / 3]) {
      c.beginPath();
      for (let k = 0; k <= 3; k++) {
        const a = off + (k / 3) * Math.PI * 2 - Math.PI / 2;
        const x = m + Math.cos(a) * 150, y = m + Math.sin(a) * 150;
        k === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.stroke();
    }
    // radial ticks
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const l = i % 6 === 0 ? 14 : 6;
      c.lineWidth = i % 6 === 0 ? 3 : 1.5;
      c.beginPath();
      c.moveTo(m + Math.cos(a) * 226, m + Math.sin(a) * 226);
      c.lineTo(m + Math.cos(a) * (226 + l), m + Math.sin(a) * (226 + l));
      c.stroke();
    }
  });
  // protective formation (bát quái): octagon + trigram bars + yin-yang hint
  canvas(scene, 'v_formation', 512, 512, (c, w) => {
    const m = w / 2;
    c.strokeStyle = 'rgba(255,255,255,1)';
    c.fillStyle = 'rgba(255,255,255,1)';
    const oct = (rad: number, lw: number) => {
      c.lineWidth = lw;
      c.beginPath();
      for (let k = 0; k <= 8; k++) {
        const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
        const x = m + Math.cos(a) * rad, y = m + Math.sin(a) * rad;
        k === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.stroke();
    };
    oct(246, 5);
    oct(168, 3);
    // trigrams
    const tri = ['111', '110', '101', '100', '011', '010', '001', '000'];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      c.save();
      c.translate(m + Math.cos(a) * 207, m + Math.sin(a) * 207);
      c.rotate(a + Math.PI / 2);
      for (let b = 0; b < 3; b++) {
        const y = -14 + b * 12;
        if (tri[k][b] === '1') c.fillRect(-26, y, 52, 7);
        else { c.fillRect(-26, y, 22, 7); c.fillRect(4, y, 22, 7); }
      }
      c.restore();
    }
    // taiji outline
    c.lineWidth = 4;
    c.beginPath(); c.arc(m, m, 80, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(m, m - 40, 40, Math.PI / 2, Math.PI * 1.5, true); c.arc(m, m + 40, 40, Math.PI * 1.5, Math.PI / 2, true); c.stroke();
    c.beginPath(); c.arc(m, m - 40, 9, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(m, m + 40, 9, 0, Math.PI * 2); c.stroke();
  });
  // soft cloud puff (tinted dark for tribulation, light for heaven)
  canvas(scene, 'v_cloud', 256, 160, (c, w, h) => {
    const r = rand(5);
    for (let i = 0; i < 9; i++) {
      const x = w * (0.2 + r() * 0.6), y = h * (0.35 + r() * 0.35), rad = 40 + r() * 45;
      radial(c, x, y, rad, [[0, 'rgba(255,255,255,0.55)'], [0.6, 'rgba(255,255,255,0.3)'], [1, 'rgba(255,255,255,0)']]);
    }
  });
  // petal (falling flower petal for Chân Tiên)
  canvas(scene, 'v_petal', 32, 32, (c) => {
    c.fillStyle = 'rgba(255,255,255,1)';
    c.beginPath();
    c.moveTo(16, 2);
    c.bezierCurveTo(30, 8, 28, 26, 16, 30);
    c.bezierCurveTo(4, 26, 2, 8, 16, 2);
    c.fill();
  });
  // horizontal band (Linh Khí Triều wave)
  canvas(scene, 'v_band', 64, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
  // system card (Cơ duyên) — xianxia "hệ thống" panel, text is drawn at runtime
  canvas(scene, 'v_card', 520, 200, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(24,70,140,0.92)');
    g.addColorStop(1, 'rgba(10,30,80,0.92)');
    c.fillStyle = g;
    c.strokeStyle = 'rgba(150,220,255,1)';
    c.lineWidth = 4;
    const r = 18;
    c.beginPath();
    c.moveTo(r, 2); c.lineTo(w - r, 2); c.quadraticCurveTo(w - 2, 2, w - 2, r);
    c.lineTo(w - 2, h - r); c.quadraticCurveTo(w - 2, h - 2, w - r, h - 2);
    c.lineTo(r, h - 2); c.quadraticCurveTo(2, h - 2, 2, h - r);
    c.lineTo(2, r); c.quadraticCurveTo(2, 2, r, 2);
    c.fill();
    c.stroke();
    c.strokeStyle = 'rgba(150,220,255,0.5)';
    c.lineWidth = 2;
    c.strokeRect(14, 14, w - 28, h - 28);
  });
  // vignette (radial dark edges) used for tribulation / heart demon mood, tinted at runtime
  canvas(scene, 'v_vignette', 270, 480, (c, w, h) => {
    const g = c.createRadialGradient(w / 2, h * 0.55, h * 0.18, w / 2, h * 0.55, h * 0.7);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(255,255,255,1)');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  });
}

/** Hooded wispy silhouette for Tâm Ma (tinted dark purple at runtime). */
export function makeGhostTexture(scene: Phaser.Scene) {
  canvas(scene, 'v_ghost', 256, 384, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.7)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(w / 2, 10);
    c.bezierCurveTo(w * 0.86, 20, w * 0.92, h * 0.35, w * 0.95, h * 0.62);
    // tattered hem
    for (let i = 0; i <= 8; i++) {
      const x = w * 0.95 - (i / 8) * w * 0.9;
      const y = h * (i % 2 ? 0.98 : 0.84);
      c.lineTo(x, y);
    }
    c.bezierCurveTo(w * 0.08, h * 0.35, w * 0.14, 20, w / 2, 10);
    c.fill();
    // hood opening (darker) + eyes are added as separate sprites
    c.globalCompositeOperation = 'destination-out';
    c.beginPath();
    c.ellipse(w / 2, 92, 44, 52, 0, 0, Math.PI * 2);
    c.fill();
    c.globalCompositeOperation = 'source-over';
  });
}
