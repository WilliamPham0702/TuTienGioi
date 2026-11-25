import { DatabaseSync } from 'node:sqlite';
import type { GameState, Player } from './types.ts';

export interface Loaded {
  state: GameState;
  /** Chỉ số sự kiện nguồn kế tiếp cần đọc sau lần commit cuối. */
  offset: number;
  rngState: number | null;
}

/**
 * Lưu trữ SQLite (một file, WAL). Mỗi lần commit là MỘT giao dịch:
 * tắt đột ngột chỉ mất phần chưa commit, không bao giờ để trạng thái nửa vời.
 * Chỉ ghi lại những người chơi có thay đổi kể từ lần commit trước.
 */
export class Store {
  private db: DatabaseSync;
  private written = new Map<string, string>();

  constructor(path: string) {
    this.db = new DatabaseSync(path);
    this.db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, json TEXT NOT NULL);
    `);
  }

  load(): Loaded | null {
    const m = new Map(
      (this.db.prepare('SELECT k, v FROM meta').all() as { k: string; v: string }[]).map((r) => [r.k, r.v]),
    );
    if (!m.has('lastTick')) return null;
    const players: Record<string, Player> = {};
    this.written.clear();
    for (const r of this.db.prepare('SELECT id, json FROM players').all() as { id: string; json: string }[]) {
      players[r.id] = JSON.parse(r.json) as Player;
      this.written.set(r.id, r.json);
    }
    const state: GameState = {
      players,
      seats: JSON.parse(m.get('seats')!),
      hostSupreme: m.get('hostSupreme') === '1',
      tide: JSON.parse(m.get('tide')!),
      paused: m.get('paused') === '1',
      pending: JSON.parse(m.get('pending')!),
      lastTick: Number(m.get('lastTick')),
      nextFortuneAt: Number(m.get('nextFortuneAt')),
      seenEventIds: JSON.parse(m.get('seen')!),
    };
    return { state, offset: Number(m.get('offset')), rngState: m.has('rng') ? Number(m.get('rng')) : null };
  }

  /** Ghi trạng thái + vị trí nguồn + trạng thái rng trong một giao dịch. Trả số người chơi đã ghi. */
  commit(state: GameState, offset: number, rngState?: number): number {
    const up = this.db.prepare('INSERT INTO players (id, json) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json');
    const setMeta = this.db.prepare('INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v');
    const pending: [string, string][] = [];
    for (const [id, p] of Object.entries(state.players)) {
      const json = JSON.stringify(p);
      if (this.written.get(id) !== json) pending.push([id, json]);
    }
    this.db.exec('BEGIN IMMEDIATE');
    try {
      for (const [id, json] of pending) up.run(id, json);
      setMeta.run('seats', JSON.stringify(state.seats));
      setMeta.run('hostSupreme', state.hostSupreme ? '1' : '0');
      setMeta.run('tide', JSON.stringify(state.tide));
      setMeta.run('paused', state.paused ? '1' : '0');
      setMeta.run('pending', JSON.stringify(state.pending));
      setMeta.run('lastTick', String(state.lastTick));
      setMeta.run('nextFortuneAt', String(state.nextFortuneAt));
      setMeta.run('seen', JSON.stringify(state.seenEventIds));
      setMeta.run('offset', String(offset));
      if (rngState !== undefined) setMeta.run('rng', String(rngState));
      this.db.exec('COMMIT');
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
    for (const [id, json] of pending) this.written.set(id, json);
    return pending.length;
  }

  /** Sao lưu một file nhất quán (không cần tắt game). */
  backup(destPath: string): void {
    this.db.exec(`VACUUM INTO '${destPath.replace(/'/g, "''")}'`);
  }

  close(): void {
    this.db.close();
  }
}
