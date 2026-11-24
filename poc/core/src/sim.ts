// C-002 PoC-3 — Local Simulation Adapter: deterministic synthetic LIVE events.
// ALL output is SIMULATED. Rates are assumptions, not measured TikTok behaviour.
import type { LiveEvent } from './types.ts';

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = ['Minh', 'Lan', 'Tuấn', 'Hương', 'Khoa', 'Ngọc', 'Phúc', 'Thảo', 'Dũng', 'Vy'];

export interface S1Options {
  seed?: number;
  players?: number;        // total distinct players over the session
  concurrent?: number;     // active at the same time
  minutes?: number;
  giftChancePerMin?: number;
}

/** S1 "normal": 1000 players, 300 active at a time, 1–3 comments/min, 0–20 likes/min, ~1%/min gifts. */
export function scenarioNormal(o: S1Options = {}): LiveEvent[] {
  const seed = o.seed ?? 1;
  const players = o.players ?? 1000;
  const concurrent = o.concurrent ?? 300;
  const minutes = o.minutes ?? 30;
  const giftP = o.giftChancePerMin ?? 0.01;
  const r = rng(seed);
  const ev: LiveEvent[] = [];
  let n = 0;
  const id = () => `e${seed}-${n++}`;
  const name = (u: number) => `${NAMES[u % NAMES.length]} ${u}`;
  const joined = new Set<number>();
  let streaks = 0;
  for (let m = 0; m < minutes; m++) {
    // a rotating window so that all players appear during the session
    const start = Math.floor((m * (players - concurrent)) / Math.max(1, minutes - 1));
    for (let k = 0; k < concurrent; k++) {
      const u = start + k;
      const uid = `u${u}`;
      const base = m * 60_000;
      if (!joined.has(u)) {
        joined.add(u);
        ev.push({ id: id(), type: 'join', userId: uid, name: name(u), ts: base + Math.floor(r() * 5000) });
      }
      const comments = 1 + Math.floor(r() * 3);
      for (let c = 0; c < comments; c++)
        ev.push({ id: id(), type: 'comment', userId: uid, name: name(u), ts: base + Math.floor(r() * 60_000) });
      let likes = Math.floor(r() * 21);
      while (likes > 0) {
        const b = Math.min(likes, 1 + Math.floor(r() * 15));
        likes -= b;
        ev.push({ id: id(), type: 'like', userId: uid, name: name(u), ts: base + Math.floor(r() * 60_000), count: b });
      }
      if (r() < giftP) {
        const streakId = `s${seed}-${streaks++}`;
        const reps = 1 + Math.floor(r() * 10);
        const diamonds = [1, 1, 5, 10][Math.floor(r() * 4)];
        const t0 = base + Math.floor(r() * 50_000);
        for (let k2 = 1; k2 <= reps; k2++)
          ev.push({ id: id(), type: 'gift', userId: uid, name: name(u), ts: t0 + k2 * 300, giftId: `g${diamonds}`, diamonds, streakId, repeatCount: k2 });
      }
    }
  }
  return ev.sort((a, b) => a.ts - b.ts);
}

/** S2 "spam": 20 players sending 60 comments/min and a like batch every second, for `minutes`. */
export function scenarioSpam(minutes = 5, seed = 2): LiveEvent[] {
  const r = rng(seed);
  const ev: LiveEvent[] = [];
  let n = 0;
  for (let s = 0; s < 20; s++) {
    const uid = `spam${s}`;
    for (let t = 0; t < minutes * 60; t++) {
      ev.push({ id: `sp${n++}`, type: 'comment', userId: uid, name: `Spam ${s}`, ts: t * 1000 + Math.floor(r() * 1000) });
      ev.push({ id: `sp${n++}`, type: 'like', userId: uid, name: `Spam ${s}`, ts: t * 1000 + Math.floor(r() * 1000), count: 15 });
    }
  }
  return ev.sort((a, b) => a.ts - b.ts);
}

/** S4 "duplicates": every event delivered 1–3 times, extra copies delayed 0–30 s (crossing tick boundaries). */
export function withDuplicates(src: LiveEvent[], seed = 4): LiveEvent[] {
  const r = rng(seed);
  const out: LiveEvent[] = [];
  for (const e of src) {
    out.push(e);
    const copies = Math.floor(r() * 3); // 0..2 extra copies
    for (let c = 0; c < copies; c++) out.push({ ...e, ts: e.ts + Math.floor(r() * 30_000) });
  }
  return out.sort((a, b) => a.ts - b.ts);
}
