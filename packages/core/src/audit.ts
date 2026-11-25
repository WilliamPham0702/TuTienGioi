import { createHash } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

/**
 * Nhật ký kiểm toán cho thao tác của người vận hành (tạm dừng, ẩn tên, đổi từ chặn, chỉnh số...).
 * - Chỉ GHI THÊM, không sửa/xóa qua API.
 * - Mỗi dòng giữ mã băm của dòng trước (chuỗi băm): ai sửa tay file SQLite thì `verify()` phát hiện.
 * - Không lưu mật khẩu/token. `detail` là dữ liệu thao tác (vd. mã người chơi, từ chặn, giá trị cũ → mới).
 */
export interface AuditEntry {
  seq: number;
  at: number;
  actor: string;
  action: string;
  detail: Record<string, unknown>;
  ok: boolean;
  prevHash: string;
  hash: string;
}

export type AuditInput = Pick<AuditEntry, 'at' | 'actor' | 'action' | 'detail' | 'ok'>;

export interface AuditLog {
  append(e: AuditInput): AuditEntry;
  /** Mới nhất trước. */
  recent(limit?: number): AuditEntry[];
  /** Trả seq của dòng đầu tiên bị sửa, hoặc null nếu toàn bộ chuỗi còn nguyên. */
  verify(): number | null;
}

const GENESIS = '0'.repeat(64);

export function entryHash(prevHash: string, e: Omit<AuditEntry, 'hash' | 'prevHash'>): string {
  const body = JSON.stringify([e.seq, e.at, e.actor, e.action, e.detail, e.ok]);
  return createHash('sha256').update(prevHash).update(body).digest('hex');
}

function verifyChain(rows: AuditEntry[]): number | null {
  let prev = GENESIS;
  for (const r of rows) {
    if (r.prevHash !== prev || entryHash(prev, r) !== r.hash) return r.seq;
    prev = r.hash;
  }
  return null;
}

/** Bản trong bộ nhớ (test, chạy thử). */
export class MemoryAuditLog implements AuditLog {
  rows: AuditEntry[] = [];
  append(e: AuditInput): AuditEntry {
    const prevHash = this.rows.at(-1)?.hash ?? GENESIS;
    const base = { seq: this.rows.length + 1, at: e.at, actor: e.actor, action: e.action, detail: e.detail, ok: e.ok };
    const row: AuditEntry = { ...base, prevHash, hash: entryHash(prevHash, base) };
    this.rows.push(row);
    return row;
  }
  recent(limit = 50): AuditEntry[] {
    return this.rows.slice(-limit).reverse();
  }
  verify(): number | null {
    return verifyChain(this.rows);
  }
}

/** Bản SQLite: dùng chung file với `Store` hoặc file riêng. Mỗi dòng ghi ngay trong giao dịch riêng. */
export class SqliteAuditLog implements AuditLog {
  private db: DatabaseSync;
  private owns: boolean;

  constructor(pathOrDb: string | DatabaseSync) {
    this.owns = typeof pathOrDb === 'string';
    this.db = typeof pathOrDb === 'string' ? new DatabaseSync(pathOrDb) : pathOrDb;
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit (
        seq INTEGER PRIMARY KEY,
        at INTEGER NOT NULL,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        detail TEXT NOT NULL,
        ok INTEGER NOT NULL,
        prev_hash TEXT NOT NULL,
        hash TEXT NOT NULL
      );
    `);
  }

  append(e: AuditInput): AuditEntry {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const last = this.db.prepare('SELECT seq, hash FROM audit ORDER BY seq DESC LIMIT 1').get() as { seq: number; hash: string } | undefined;
      const prevHash = last?.hash ?? GENESIS;
      const base = { seq: (last?.seq ?? 0) + 1, at: e.at, actor: e.actor, action: e.action, detail: e.detail, ok: e.ok };
      const row: AuditEntry = { ...base, prevHash, hash: entryHash(prevHash, base) };
      this.db
        .prepare('INSERT INTO audit (seq, at, actor, action, detail, ok, prev_hash, hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(row.seq, row.at, row.actor, row.action, JSON.stringify(row.detail), row.ok ? 1 : 0, row.prevHash, row.hash);
      this.db.exec('COMMIT');
      return row;
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  private rows(sql: string, ...args: number[]): AuditEntry[] {
    return (this.db.prepare(sql).all(...args) as Record<string, unknown>[]).map((r) => ({
      seq: Number(r.seq),
      at: Number(r.at),
      actor: String(r.actor),
      action: String(r.action),
      detail: JSON.parse(String(r.detail)) as Record<string, unknown>,
      ok: Number(r.ok) === 1,
      prevHash: String(r.prev_hash),
      hash: String(r.hash),
    }));
  }

  recent(limit = 50): AuditEntry[] {
    return this.rows('SELECT * FROM audit ORDER BY seq DESC LIMIT ?', limit);
  }

  verify(): number | null {
    return verifyChain(this.rows('SELECT * FROM audit ORDER BY seq ASC'));
  }

  close(): void {
    if (this.owns) this.db.close();
  }
}
