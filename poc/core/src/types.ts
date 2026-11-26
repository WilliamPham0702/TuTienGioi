// C-002 PoC-3 — shared types. Throwaway PoC code, not product code.

export type EventType = 'join' | 'comment' | 'like' | 'gift';

/** A LIVE event after normalisation. In the PoC every event comes from the simulator. */
export interface LiveEvent {
  /** Unique id from the source. Duplicated deliveries carry the same id. */
  id: string;
  type: EventType;
  userId: string;
  name: string;
  /** Simulated time in ms since session start. */
  ts: number;
  /** like: number of likes in this batch */
  count?: number;
  /** gift: TikTok-style streak, repeatCount is cumulative within a streak */
  giftId?: string;
  diamonds?: number;
  streakId?: string;
  repeatCount?: number;
}

export interface CoreConfig {
  tickMs: number;               // game tick length (sim time)
  presenceWindowMs: number;     // "active participation" window (proposal D-008b)
  tuViPerTick: number;          // tu vi for each active player per tick
  tuViCapPerSession: number;    // anti-AFK cap for time-based tu vi
  linhKhiPerLike: number;
  linhKhiCapPerMinute: number;  // per player
  tuViPerDiamond: number;
  realmThresholds: number[];    // tu vi needed to reach realm index i+1 (placeholder balance)
  queueCap: number;             // bounded ingest queue
  dedupWindowMs: number;        // how long seen event ids are remembered
}

export const DEFAULT_CONFIG: CoreConfig = {
  tickMs: 5000,
  presenceWindowMs: 5 * 60_000,
  tuViPerTick: 1,
  tuViCapPerSession: 720,
  linhKhiPerLike: 1,
  linhKhiCapPerMinute: 60,
  tuViPerDiamond: 10,
  realmThresholds: [100, 400, 1200],
  queueCap: 5000,
  dedupWindowMs: 10 * 60_000,
};

export interface LedgerEntry {
  playerId: string;
  resource: 'tu_vi' | 'linh_khi';
  amount: number;
  source: 'time' | 'like' | 'gift' | 'breakthrough';
  ref: string; // unique: makes every award idempotent
}
