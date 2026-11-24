// C-002 PoC-3 — SQLite persistence (node:sqlite, WAL). Throwaway PoC code.
import { DatabaseSync } from 'node:sqlite';
import type { LedgerEntry } from './types.ts';

export interface TickCommit {
  tick: number;
  offset: number;                 // index of the next source event to read after this commit
  players: { id: string; name: string; lastActive: number }[];
  ledger: LedgerEntry[];
  seen: { id: string; ts: number }[];
  pruneSeenBefore: number;        // forget seen ids older than this (sim ms)
}

export class Store {
  db: DatabaseSync;

  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, last_active INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS ledger (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id TEXT NOT NULL, resource TEXT NOT NULL, amount INTEGER NOT NULL,
        source TEXT NOT NULL, ref TEXT NOT NULL UNIQUE, tick INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS progression (
        player_id TEXT PRIMARY KEY, tu_vi INTEGER NOT NULL DEFAULT 0,
        linh_khi INTEGER NOT NULL DEFAULT 0, time_tu_vi INTEGER NOT NULL DEFAULT 0,
        realm INTEGER NOT NULL DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS seen_events (id TEXT PRIMARY KEY, ts INTEGER NOT NULL);
    `);
  }

  meta(k: string): string | undefined {
    const r = this.db.prepare('SELECT v FROM meta WHERE k = ?').get(k) as { v: string } | undefined;
    return r?.v;
  }

  loadState() {
    return {
      tick: Number(this.meta('tick') ?? -1),
      offset: Number(this.meta('offset') ?? 0),
      players: this.db.prepare('SELECT id, name, last_active AS lastActive FROM players').all() as {
        id: string; name: string; lastActive: number;
      }[],
      progression: this.db.prepare('SELECT player_id AS id, tu_vi, linh_khi, time_tu_vi, realm FROM progression').all() as {
        id: string; tu_vi: number; linh_khi: number; time_tu_vi: number; realm: number;
      }[],
      seen: (this.db.prepare('SELECT id FROM seen_events').all() as { id: string }[]).map((r) => r.id),
    };
  }

  /** Everything for one tick is written in ONE transaction: a crash loses at most the open tick. */
  commit(c: TickCommit): { inserted: number; duplicates: number } {
    const insLedger = this.db.prepare(
      'INSERT OR IGNORE INTO ledger (player_id, resource, amount, source, ref, tick) VALUES (?, ?, ?, ?, ?, ?)',
    );
    const upPlayer = this.db.prepare(
      'INSERT INTO players (id, name, last_active) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, last_active = MAX(last_active, excluded.last_active)',
    );
    const upProg = this.db.prepare(
      `INSERT INTO progression (player_id, tu_vi, linh_khi, time_tu_vi) VALUES (?, ?, ?, ?)
       ON CONFLICT(player_id) DO UPDATE SET tu_vi = tu_vi + excluded.tu_vi, linh_khi = linh_khi + excluded.linh_khi,
       time_tu_vi = time_tu_vi + excluded.time_tu_vi`,
    );
    const insSeen = this.db.prepare('INSERT OR IGNORE INTO seen_events (id, ts) VALUES (?, ?)');
    const setMeta = this.db.prepare('INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v');
    let inserted = 0;
    let duplicates = 0;
    this.db.exec('BEGIN IMMEDIATE');
    try {
      for (const p of c.players) upPlayer.run(p.id, p.name, p.lastActive);
      for (const e of c.ledger) {
        const r = insLedger.run(e.playerId, e.resource, e.amount, e.source, e.ref, c.tick);
        if (Number(r.changes) === 1) {
          inserted++;
          // progression only moves when the ledger row is new -> idempotent
          upProg.run(
            e.playerId,
            e.resource === 'tu_vi' ? e.amount : 0,
            e.resource === 'linh_khi' ? e.amount : 0,
            e.resource === 'tu_vi' && e.source === 'time' ? e.amount : 0,
          );
        } else duplicates++;
      }
      for (const s of c.seen) insSeen.run(s.id, s.ts);
      this.db.prepare('DELETE FROM seen_events WHERE ts < ?').run(c.pruneSeenBefore);
      setMeta.run('tick', String(c.tick));
      setMeta.run('offset', String(c.offset));
      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
    return { inserted, duplicates };
  }

  setRealm(playerId: string, realm: number) {
    this.db.prepare('UPDATE progression SET realm = ? WHERE player_id = ?').run(realm, playerId);
  }

  /** Recompute totals from the ledger (source of truth) and compare with the progression table. */
  audit(): { players: number; mismatches: number; duplicateRefs: number; ledgerRows: number } {
    const rows = this.db.prepare(
      `SELECT p.player_id AS id, p.tu_vi, p.linh_khi,
         COALESCE((SELECT SUM(amount) FROM ledger l WHERE l.player_id = p.player_id AND l.resource = 'tu_vi'), 0) AS lt,
         COALESCE((SELECT SUM(amount) FROM ledger l WHERE l.player_id = p.player_id AND l.resource = 'linh_khi'), 0) AS ll
       FROM progression p`,
    ).all() as { id: string; tu_vi: number; linh_khi: number; lt: number; ll: number }[];
    const dup = this.db.prepare('SELECT COUNT(*) AS c FROM (SELECT ref FROM ledger GROUP BY ref HAVING COUNT(*) > 1)').get() as { c: number };
    const n = this.db.prepare('SELECT COUNT(*) AS c FROM ledger').get() as { c: number };
    return {
      players: rows.length,
      mismatches: rows.filter((r) => r.tu_vi !== r.lt || r.linh_khi !== r.ll).length,
      duplicateRefs: dup.c,
      ledgerRows: n.c,
    };
  }

  totals(): Record<string, { tu_vi: number; linh_khi: number; realm: number }> {
    const out: Record<string, { tu_vi: number; linh_khi: number; realm: number }> = {};
    for (const r of this.db.prepare('SELECT player_id, tu_vi, linh_khi, realm FROM progression ORDER BY player_id').all() as {
      player_id: string; tu_vi: number; linh_khi: number; realm: number;
    }[]) out[r.player_id] = { tu_vi: r.tu_vi, linh_khi: r.linh_khi, realm: r.realm };
    return out;
  }

  backupTo(path: string) {
    this.db.prepare('VACUUM INTO ?').run(path);
  }

  close() {
    this.db.close();
  }
}
