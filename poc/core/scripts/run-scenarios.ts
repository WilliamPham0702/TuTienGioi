// C-002 PoC-3 — runs scenarios S1–S5 and writes evidence JSON. ALL INPUT IS SIMULATED.
// Usage: node scripts/run-scenarios.ts [outDir]
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { cpus, totalmem, platform, release, tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Store } from '../src/store.ts';
import { GameCore } from '../src/core.ts';
import { BoundedQueue } from '../src/queue.ts';
import { rng, scenarioNormal, scenarioSpam, withDuplicates } from '../src/sim.ts';
import type { LiveEvent } from '../src/types.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.argv[2] ?? join(here, '..', '..', 'evidence', 'poc3');
mkdirSync(outDir, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'ttg-poc3-'));
const db = (name: string) => join(work, `${name}.sqlite`);

const pct = (arr: number[], p: number) => {
  const s = [...arr].sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))] : 0;
};

function runAll(events: LiveEvent[], path: string, endTs = events[events.length - 1].ts) {
  const store = new Store(path);
  const core = new GameCore(store);
  const t0 = performance.now();
  const c0 = process.cpuUsage();
  events.forEach((e, i) => core.process(e, i));
  core.flushUntil(endTs, events.length);
  const wallMs = performance.now() - t0;
  const cpu = process.cpuUsage(c0);
  return { store, core, wallMs, cpuMs: (cpu.user + cpu.system) / 1000 };
}

const result: Record<string, unknown> = {
  label: 'SIMULATION — not TikTok LIVE data',
  generatedAt: new Date().toISOString(),
  machine: { platform: platform(), release: release(), cpu: cpus()[0]?.model, cores: cpus().length, ramGB: +(totalmem() / 2 ** 30).toFixed(1), node: process.version },
};

// ---------------------------------------------------------------- S1 normal
{
  const ev = scenarioNormal();
  const { store, core, wallMs, cpuMs } = runAll(ev, db('s1'));
  const audit = store.audit();
  // independent check for gifts: units = max repeatCount per streak
  const streaks = new Map<string, { reps: number; diamonds: number }>();
  for (const e of ev) if (e.type === 'gift' && e.streakId) {
    const s = streaks.get(e.streakId) ?? { reps: 0, diamonds: e.diamonds ?? 1 };
    s.reps = Math.max(s.reps, e.repeatCount ?? 0);
    streaks.set(e.streakId, s);
  }
  let expectedGiftTuVi = 0;
  for (const s of streaks.values()) expectedGiftTuVi += s.reps * s.diamonds * core.cfg.tuViPerDiamond;
  const ledgerGift = (store.db.prepare("SELECT COALESCE(SUM(amount),0) AS s FROM ledger WHERE source='gift'").get() as { s: number }).s;
  result.S1_normal = {
    params: { players: 1000, concurrent: 300, minutesSimulated: 30, commentsPerMin: '1-3', likesPerMin: '0-20', giftChancePerMin: 0.01 },
    events: ev.length, wallMs: Math.round(wallMs), cpuMs: Math.round(cpuMs), eventsPerSecond: Math.round(ev.length / (wallMs / 1000)),
    stats: core.stats, audit, giftCheck: { expectedGiftTuVi, ledgerGift, match: expectedGiftTuVi === ledgerGift },
    playersInDb: Object.keys(store.totals()).length,
    pass: audit.mismatches === 0 && audit.duplicateRefs === 0 && expectedGiftTuVi === ledgerGift,
  };
  store.close();
}

// ---------------------------------------------------------------- S2 spam
{
  const ev = scenarioSpam(5);
  const { store, core } = runAll(ev, db('s2'));
  const perMinute = store.db.prepare(
    `SELECT player_id, (tick * ${core.cfg.tickMs}) / 60000 AS minute, SUM(amount) AS lk FROM ledger WHERE source='like' GROUP BY player_id, minute`,
  ).all() as { lk: number }[];
  const maxPerMin = Math.max(...perMinute.map((r) => r.lk));
  result.S2_spam = {
    params: { spammers: 20, commentsPerMin: 60, likeBatchPerSecond: 15, minutes: 5 },
    events: ev.length, linhKhiCapPerMinute: core.cfg.linhKhiCapPerMinute, maxLinhKhiPerPlayerPerMinute: maxPerMin,
    linhKhiRefused: core.stats.linhKhiCapped, pass: maxPerMin <= core.cfg.linhKhiCapPerMinute,
  };
  store.close();
}

// ---------------------------------------------------------------- S3 like storm (real time)
const s3 = await new Promise<Record<string, unknown>>((resolve) => {
  const store = new Store(db('s3'));
  const core = new GameCore(store);
  const q = new BoundedQueue(core.cfg.queueCap);
  const r = rng(3);
  const lat: number[] = [];
  let produced = 0;
  let index = 0;
  const seconds = 60;
  const perSecond = 1000;
  const t0 = performance.now();
  const c0 = process.cpuUsage();
  const producer = setInterval(() => {
    const now = performance.now();
    const elapsed = now - t0;
    const due = Math.min(seconds * perSecond, Math.floor((elapsed / 1000) * perSecond));
    while (produced < due) {
      const u = Math.floor(r() * 300);
      q.push({ id: `s3-${produced}`, type: 'like', userId: `u${u}`, name: `U${u}`, ts: Math.floor(elapsed), count: 1 }, now);
      produced++;
    }
  }, 10);
  const consume = () => {
    const now = performance.now();
    for (let k = 0; k < 2000; k++) {
      const x = q.shift();
      if (!x) break;
      core.process(x.ev, index++);
      lat.push(performance.now() - x.at);
    }
    if (produced >= seconds * perSecond && q.length === 0) {
      clearInterval(producer);
      core.flushUntil(seconds * 1000, index);
      const wall = performance.now() - t0;
      const cpu = process.cpuUsage(c0);
      const cpuPct = ((cpu.user + cpu.system) / 1000 / wall) * 100;
      store.close();
      resolve({
        params: { likesPerSecond: perSecond, seconds, queueCap: core.cfg.queueCap, mode: 'real time, single Node process' },
        produced, processed: index, droppedLikes: q.dropped.like, droppedOther: q.dropped.other, maxQueue: q.maxLen,
        latencyMs: { p50: +pct(lat, 50).toFixed(2), p95: +pct(lat, 95).toFixed(2), p99: +pct(lat, 99).toFixed(2), max: +pct(lat, 100).toFixed(2) },
        cpuPercentOfOneCore: +cpuPct.toFixed(1), wallMs: Math.round(wall),
        pass: pct(lat, 95) <= 1000 && q.maxLen <= core.cfg.queueCap,
      });
      return;
    }
    void now;
    // yield to the producer; sleep 1 ms when idle instead of busy-waiting (busy-waiting would inflate CPU %)
    if (q.length > 0) setImmediate(consume);
    else setTimeout(consume, 1);
  };
  consume();
});
result.S3_like_storm = s3;

// ---------------------------------------------------------------- S4 duplicates
{
  const clean = scenarioNormal({ seed: 4 });
  const dup = withDuplicates(clean);
  const end = dup[dup.length - 1].ts;
  const a = runAll(clean, db('s4a'), end);
  const b = runAll(dup, db('s4b'), end);
  const ta = JSON.stringify(a.store.totals());
  const tb = JSON.stringify(b.store.totals());
  const audit = b.store.audit();
  result.S4_duplicates = {
    params: { extraCopiesPerEvent: '0-2', delayUpToMs: 30_000 },
    cleanEvents: clean.length, deliveredEvents: dup.length, duplicatesDropped: b.core.stats.duplicatesDropped,
    expectedDuplicates: dup.length - clean.length, totalsIdenticalToClean: ta === tb, audit,
    pass: ta === tb && b.core.stats.duplicatesDropped === dup.length - clean.length && audit.duplicateRefs === 0,
  };
  a.store.close(); b.store.close();
}

// ---------------------------------------------------------------- S5 crash / restart
{
  const ev = withDuplicates(scenarioNormal({ seed: 5 }));
  const file = join(work, 's5-events.json');
  writeFileSync(file, JSON.stringify(ev));
  const ref = runAll(ev, db('s5ref'));
  const refTotals = JSON.stringify(ref.store.totals());
  ref.store.close();
  const path = db('s5');
  const worker = join(here, 'worker.ts');
  const r = rng(55);
  const kills: { afterMs: number; offsetAfter: number; tickAfter: number }[] = [];
  const runWorker = (killAfter: number | null) => new Promise<boolean>((res) => {
    const p = spawn(process.execPath, ['--no-warnings', worker, path, file], { stdio: ['ignore', 'pipe', 'inherit'] });
    let out = '';
    p.stdout.on('data', (d) => (out += d));
    const timer = killAfter === null ? null : setTimeout(() => p.kill('SIGKILL'), killAfter);
    p.on('exit', () => { if (timer) clearTimeout(timer); res(out.includes('done')); });
  });
  let finished = false;
  for (let k = 0; k < 10 && !finished; k++) {
    const afterMs = 300 + Math.floor(r() * 700);
    finished = await runWorker(afterMs);
    const s = new Store(path);
    kills.push({ afterMs, offsetAfter: Number(s.meta('offset') ?? 0), tickAfter: Number(s.meta('tick') ?? -1) });
    s.close();
  }
  if (!finished) finished = await runWorker(null);
  const store = new Store(path);
  const audit = store.audit();
  const same = JSON.stringify(store.totals()) === refTotals;
  const backup = join(work, 's5-backup.sqlite');
  store.backupTo(backup);
  const restored = new Store(backup);
  const restoredSame = JSON.stringify(restored.totals()) === refTotals;
  restored.close(); store.close();
  const killedMidRun = kills.filter((k) => k.offsetAfter < ev.length).length;
  result.S5_crash = {
    params: { killSignal: 'SIGKILL', attempts: kills.length, killDelayMs: '300-1000 after start' },
    events: ev.length, kills, killedMidRun, finished, totalsIdenticalToUninterruptedRun: same, audit,
    backupRestoreIdentical: restoredSame,
    note: 'Simulation can replay events from the last committed offset, so nothing is lost here. With real TikTok events (no replay), at most the events of the open tick (<= 5 s) would be lost.',
    pass: finished && same && audit.mismatches === 0 && audit.duplicateRefs === 0 && restoredSame && killedMidRun > 0,
  };
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outFile = join(outDir, `poc3-${platform()}-${stamp}.json`);
writeFileSync(outFile, JSON.stringify(result, null, 2));
const summary = Object.entries(result).filter(([k]) => k.startsWith('S')).map(([k, v]) => `${k}: ${(v as { pass: boolean }).pass ? 'PASS' : 'FAIL'}`);
console.log(summary.join('\n'));
console.log('evidence:', outFile);
