// C-002 PoC-3 — ingest + game core. Throwaway PoC code, not product code.
//
// Pipeline per event: dedup -> presence -> like batching / gift units -> (tick boundary) -> one DB transaction.
// Every award has a unique ledger ref, so re-processing the same input never adds tu vi twice.
import { Store } from './store.ts';
import type { CoreConfig, LedgerEntry, LiveEvent } from './types.ts';
import { DEFAULT_CONFIG } from './types.ts';

export interface CoreStats {
  events: number;
  duplicatesDropped: number;
  ticks: number;
  ledgerInserted: number;
  ledgerDuplicateRefs: number;
  linhKhiCapped: number;       // linh khi refused by the per-minute cap
  timeTuViCapped: number;      // time tu vi refused by the session cap
  breakthroughs: number;
}

export class GameCore {
  cfg: CoreConfig;
  store: Store;
  tick: number;            // last committed tick
  offset: number;          // next source event index to read
  seen = new Set<string>();
  names = new Map<string, string>();
  lastActive = new Map<string, number>();
  timeTuVi = new Map<string, number>();
  tuVi = new Map<string, number>();
  realm = new Map<string, number>();
  likeMinute = new Map<string, { minute: number; used: number }>();
  // open-tick buffers (lost on crash: that is the "at most one tick" bound)
  bufLikes = new Map<string, number>();
  bufLedger: LedgerEntry[] = [];
  bufSeen: { id: string; ts: number }[] = [];
  bufPlayers = new Set<string>();
  giftHint = new Map<string, number>();
  stats: CoreStats = {
    events: 0, duplicatesDropped: 0, ticks: 0, ledgerInserted: 0, ledgerDuplicateRefs: 0,
    linhKhiCapped: 0, timeTuViCapped: 0, breakthroughs: 0,
  };

  constructor(store: Store, cfg: Partial<CoreConfig> = {}) {
    this.cfg = { ...DEFAULT_CONFIG, ...cfg };
    this.store = store;
    const s = store.loadState();
    this.tick = s.tick;
    this.offset = s.offset;
    for (const p of s.players) {
      this.names.set(p.id, p.name);
      this.lastActive.set(p.id, p.lastActive);
    }
    for (const p of s.progression) {
      this.tuVi.set(p.id, p.tu_vi);
      this.timeTuVi.set(p.id, p.time_tu_vi);
      this.realm.set(p.id, p.realm);
    }
    for (const id of s.seen) this.seen.add(id);
    // rebuild the per-minute like cap usage for the minute we resume in
    if (this.tick >= 0) {
      const minute = Math.floor(((this.tick + 1) * this.cfg.tickMs) / 60_000);
      const ticksPerMin = 60_000 / this.cfg.tickMs;
      const rows = store.db.prepare(
        "SELECT player_id AS id, SUM(amount) AS used FROM ledger WHERE source = 'like' AND tick >= ? AND tick < ? GROUP BY player_id",
      ).all(minute * ticksPerMin, (minute + 1) * ticksPerMin) as { id: string; used: number }[];
      for (const r of rows) this.likeMinute.set(r.id, { minute, used: r.used });
    }
  }

  private tickOf(ts: number) {
    return Math.floor(ts / this.cfg.tickMs);
  }

  /** Feed one event (index = its position in the replayable source, used for crash-resume). */
  process(ev: LiveEvent, index: number) {
    const evTick = this.tickOf(ev.ts);
    while (this.tick + 1 < evTick) this.closeTick(this.tick + 1, index);
    this.stats.events++;
    if (this.seen.has(ev.id)) {
      this.stats.duplicatesDropped++;
      return;
    }
    this.seen.add(ev.id);
    this.bufSeen.push({ id: ev.id, ts: ev.ts });
    this.names.set(ev.userId, ev.name);
    this.lastActive.set(ev.userId, ev.ts);
    this.bufPlayers.add(ev.userId);
    if (ev.type === 'like') {
      this.bufLikes.set(ev.userId, (this.bufLikes.get(ev.userId) ?? 0) + (ev.count ?? 1));
    } else if (ev.type === 'gift' && ev.streakId && ev.repeatCount) {
      // TikTok-style streaks report a cumulative repeatCount. Award each unit once, keyed by streak + unit.
      const from = (this.giftHint.get(ev.streakId) ?? 0) + 1;
      for (let k = from; k <= ev.repeatCount; k++) {
        this.bufLedger.push({
          playerId: ev.userId, resource: 'tu_vi', amount: (ev.diamonds ?? 1) * this.cfg.tuViPerDiamond,
          source: 'gift', ref: `gift:${ev.streakId}:${k}`,
        });
      }
      this.giftHint.set(ev.streakId, Math.max(from - 1, ev.repeatCount));
    }
  }

  /** Close every tick up to the given simulated time (call at end of input). */
  flushUntil(ts: number, offset: number) {
    const t = this.tickOf(ts);
    while (this.tick < t) this.closeTick(this.tick + 1, offset);
  }

  private closeTick(tick: number, offset: number) {
    const cfg = this.cfg;
    const tickEnd = (tick + 1) * cfg.tickMs;
    const ledger = this.bufLedger;
    // time-based tu vi for players active within the presence window
    for (const [pid, last] of this.lastActive) {
      if (tickEnd - last > cfg.presenceWindowMs) continue;
      const used = this.timeTuVi.get(pid) ?? 0;
      if (used >= cfg.tuViCapPerSession) {
        this.stats.timeTuViCapped++;
        continue;
      }
      ledger.push({ playerId: pid, resource: 'tu_vi', amount: cfg.tuViPerTick, source: 'time', ref: `time:${tick}:${pid}` });
      this.timeTuVi.set(pid, used + cfg.tuViPerTick);
      this.bufPlayers.add(pid);
    }
    // likes -> linh khi, capped per player per minute
    const minute = Math.floor((tick * cfg.tickMs) / 60_000);
    for (const [pid, likes] of this.bufLikes) {
      let m = this.likeMinute.get(pid);
      if (!m || m.minute !== minute) m = { minute, used: 0 };
      const want = likes * cfg.linhKhiPerLike;
      const give = Math.max(0, Math.min(want, cfg.linhKhiCapPerMinute - m.used));
      this.stats.linhKhiCapped += want - give;
      m.used += give;
      this.likeMinute.set(pid, m);
      if (give > 0) ledger.push({ playerId: pid, resource: 'linh_khi', amount: give, source: 'like', ref: `like:${tick}:${pid}` });
    }
    const players = [...this.bufPlayers].map((id) => ({ id, name: this.names.get(id) ?? id, lastActive: this.lastActive.get(id) ?? 0 }));
    const r = this.store.commit({
      tick, offset, players, ledger, seen: this.bufSeen, pruneSeenBefore: tickEnd - cfg.dedupWindowMs,
    });
    this.stats.ledgerInserted += r.inserted;
    this.stats.ledgerDuplicateRefs += r.duplicates;
    this.stats.ticks++;
    // derived realm (placeholder balance) for touched players
    for (const p of players) {
      const row = this.store.db.prepare('SELECT tu_vi FROM progression WHERE player_id = ?').get(p.id) as { tu_vi: number } | undefined;
      if (!row) continue;
      this.tuVi.set(p.id, row.tu_vi);
      let realm = 0;
      while (realm < cfg.realmThresholds.length && row.tu_vi >= cfg.realmThresholds[realm]) realm++;
      if (realm > (this.realm.get(p.id) ?? 0)) {
        this.realm.set(p.id, realm);
        this.store.setRealm(p.id, realm);
        this.stats.breakthroughs++;
      }
    }
    // prune the in-memory dedup set with the same window as the table
    if (tick % 12 === 0) {
      const keep = new Set(
        (this.store.db.prepare('SELECT id FROM seen_events').all() as { id: string }[]).map((x) => x.id),
      );
      this.seen = keep;
    }
    this.tick = tick;
    this.offset = offset;
    this.bufLedger = [];
    this.bufLikes = new Map();
    this.bufSeen = [];
    this.bufPlayers = new Set();
  }
}
