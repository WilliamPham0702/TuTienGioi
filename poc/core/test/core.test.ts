// C-002 PoC-3 unit tests. All inputs are SIMULATED.
import { describe, expect, it } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../src/store.ts';
import { GameCore } from '../src/core.ts';
import { BoundedQueue } from '../src/queue.ts';
import { scenarioNormal, scenarioSpam, withDuplicates } from '../src/sim.ts';
import type { LiveEvent } from '../src/types.ts';

const tmp = () => join(mkdtempSync(join(tmpdir(), 'ttg-')), 'db.sqlite');

// endTs: close ticks up to the same simulated time when comparing two streams
function run(events: LiveEvent[], path = tmp(), endTs = events[events.length - 1].ts) {
  const store = new Store(path);
  const core = new GameCore(store);
  events.forEach((e, i) => core.process(e, i));
  core.flushUntil(endTs, events.length);
  return { store, core };
}

describe('dedup', () => {
  it('same event id delivered twice is counted once', () => {
    const e: LiveEvent = { id: 'x1', type: 'like', userId: 'u1', name: 'A', ts: 1000, count: 5 };
    const { store, core } = run([e, { ...e }, { ...e, ts: 2000 }]);
    expect(core.stats.duplicatesDropped).toBe(2);
    expect(store.totals().u1.linh_khi).toBe(5);
  });

  it('duplicated stream (S4) gives exactly the same totals as the clean stream (S1)', () => {
    const clean = scenarioNormal({ minutes: 6, players: 200, concurrent: 80 });
    const dup = withDuplicates(clean);
    const end = dup[dup.length - 1].ts;
    const a = run(clean, tmp(), end).store.totals();
    const b = run(dup, tmp(), end).store.totals();
    expect(b).toEqual(a);
  });
});

describe('gift streaks (cumulative repeatCount)', () => {
  it('a 1..5 streak awards 5 units, not 1+2+3+4+5', () => {
    const ev: LiveEvent[] = [1, 2, 3, 4, 5].map((k) => ({
      id: `g${k}`, type: 'gift', userId: 'u1', name: 'A', ts: 1000 + k * 100, diamonds: 1, streakId: 's1', repeatCount: k,
    }));
    const { store } = run(ev);
    // 5 units * 1 diamond * 10 tu vi/diamond + 1 time tick
    expect(store.totals().u1.tu_vi).toBe(5 * 10 + 1);
  });
});

describe('rate limits', () => {
  it('a spammer cannot exceed the linh khi cap per minute', () => {
    const { store, core } = run(scenarioSpam(3));
    for (const t of Object.values(store.totals())) expect(t.linh_khi).toBeLessThanOrEqual(60 * 3);
    expect(core.stats.linhKhiCapped).toBeGreaterThan(0);
  });

  it('bounded queue drops likes first and keeps gifts/comments', () => {
    const q = new BoundedQueue(3);
    const like = (i: number): LiveEvent => ({ id: `l${i}`, type: 'like', userId: 'u', name: 'u', ts: i, count: 1 });
    q.push(like(1), 0); q.push(like(2), 0); q.push(like(3), 0);
    q.push({ id: 'c', type: 'comment', userId: 'u', name: 'u', ts: 4 }, 0);
    q.push(like(5), 0);
    const kept = [] as string[];
    for (let x = q.shift(); x; x = q.shift()) kept.push(x.ev.id);
    expect(kept).toContain('c');
    expect(q.dropped.like).toBe(2);
    expect(q.dropped.other).toBe(0);
  });
});

describe('persistence & recovery', () => {
  it('restart in the middle resumes from the committed offset without double counting', () => {
    const events = withDuplicates(scenarioNormal({ minutes: 6, players: 200, concurrent: 80 }));
    const reference = run(events).store.totals();
    const path = tmp();
    // first process: stop after 40% of events without flushing (simulates a crash)
    let store = new Store(path);
    let core = new GameCore(store);
    const cut = Math.floor(events.length * 0.4);
    for (let i = 0; i < cut; i++) core.process(events[i], i);
    store.close();
    // second process: resume
    store = new Store(path);
    core = new GameCore(store);
    expect(core.offset).toBeGreaterThan(0);
    expect(core.offset).toBeLessThanOrEqual(cut);
    for (let i = core.offset; i < events.length; i++) core.process(events[i], i);
    core.flushUntil(events[events.length - 1].ts, events.length);
    expect(store.totals()).toEqual(reference);
    const audit = store.audit();
    expect(audit.mismatches).toBe(0);
    expect(audit.duplicateRefs).toBe(0);
  });

  it('presence: no time tu vi after the presence window', () => {
    const ev: LiveEvent[] = [
      { id: 'c1', type: 'comment', userId: 'u1', name: 'A', ts: 0 },
      { id: 'c2', type: 'comment', userId: 'u2', name: 'B', ts: 20 * 60_000 },
    ];
    const { store } = run(ev);
    // u1 active for 5 min window -> 60 ticks of 5 s (+1 boundary tick), then "nhập định"
    expect(store.totals().u1.tu_vi).toBeLessThanOrEqual(61);
    expect(store.totals().u1.tu_vi).toBeGreaterThanOrEqual(60);
  });

  it('backup can be restored and matches', () => {
    const { store } = run(scenarioNormal({ minutes: 3, players: 100, concurrent: 50 }));
    const bak = tmp();
    store.backupTo(bak);
    const restored = new Store(bak);
    expect(restored.totals()).toEqual(store.totals());
  });
});
