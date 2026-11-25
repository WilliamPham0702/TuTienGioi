import { seededRng } from './rng.ts';
import type { GameEvent } from './types.ts';

export interface ScenarioOptions {
  seed?: number;
  players?: number;
  minutes?: number;
  /** Xác suất mỗi người đang hiện diện tặng quà trong 1 phút. */
  giftChancePerMin?: number;
  /** Số tim tối đa mỗi người/phút. */
  maxLikesPerMin?: number;
}

const NAMES = ['Minh', 'Lan', 'Tuấn', 'Hương', 'Khoa', 'Ngọc', 'Phúc', 'Thảo', 'Dũng', 'Vy'];

/**
 * Nguồn sự kiện MÔ PHỎNG (Local Simulation). Toàn bộ dữ liệu là giả lập, các tỉ lệ là giả định,
 * KHÔNG phản ánh hành vi thật của TikTok. Cùng seed → cùng chuỗi sự kiện.
 */
export function scenario(o: ScenarioOptions = {}): GameEvent[] {
  const seed = o.seed ?? 1;
  const players = o.players ?? 200;
  const minutes = o.minutes ?? 30;
  const giftP = o.giftChancePerMin ?? 0.02;
  const maxLikes = o.maxLikesPerMin ?? 40;
  const r = seededRng(seed * 7919 + 13);
  const total = minutes * 60_000;
  const ev: GameEvent[] = [];
  let n = 0;
  const id = () => `s${seed}-${n++}`;

  for (let u = 0; u < players; u++) {
    const pid = `u${u}`;
    const name = `${NAMES[u % NAMES.length]} ${u}`;
    const joinAt = Math.floor(r.next() * total * 0.8);
    const stay = Math.floor((0.2 + r.next() * 0.8) * (total - joinAt));
    ev.push({ id: id(), type: 'join', playerId: pid, name, at: joinAt });
    for (let t = joinAt + 10_000; t < joinAt + stay; t += 10_000)
      ev.push({ id: id(), type: 'heartbeat', playerId: pid, at: t });
    for (let t = Math.ceil((joinAt + 1) / 60_000) * 60_000; t < joinAt + stay; t += 60_000) {
      const likes = Math.floor(r.next() * maxLikes);
      if (likes > 0) ev.push({ id: id(), type: 'like', playerId: pid, count: likes, at: t + Math.floor(r.next() * 1000) });
      if (r.next() < giftP) ev.push({ id: id(), type: 'gift', playerId: pid, diamonds: 1 + Math.floor(r.next() * 50), at: t + 500 });
    }
    ev.push({ id: id(), type: 'leave', playerId: pid, at: joinAt + stay });
  }
  return ev.sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : 1));
}

/** Đợt sự kiện dồn dập: `perSecond` sự kiện/giây trong `seconds` giây (tim và quà). */
export function burst(playerCount: number, perSecond: number, seconds: number, seed = 5): GameEvent[] {
  const r = seededRng(seed);
  const ev: GameEvent[] = [];
  for (let u = 0; u < playerCount; u++) ev.push({ id: `b${seed}-j${u}`, type: 'join', playerId: `u${u}`, name: `B${u}`, at: 0 });
  for (let s = 0; s < seconds; s++)
    for (let k = 0; k < perSecond; k++) {
      const pid = `u${Math.floor(r.next() * playerCount)}`;
      const at = 1000 + s * 1000 + Math.floor((k * 1000) / perSecond);
      ev.push(
        r.next() < 0.9
          ? { id: `b${seed}-${s}-${k}`, type: 'like', playerId: pid, count: 1 + Math.floor(r.next() * 5), at }
          : { id: `b${seed}-${s}-${k}`, type: 'gift', playerId: pid, diamonds: 1 + Math.floor(r.next() * 10), at },
      );
    }
  return ev;
}
