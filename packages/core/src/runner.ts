import type { Game } from './engine.ts';
import type { PersistableRng } from './rng.ts';
import type { Store } from './store.ts';
import type { GameEvent } from './types.ts';

export interface RunOptions {
  /** Đọc nguồn từ vị trí này (0 nếu phiên mới; lấy từ Store.load() khi khôi phục). */
  startOffset?: number;
  endAt: number;
  tickMs?: number;
  commitEveryMs?: number;
  store?: Store;
  rng?: PersistableRng;
  /** Dùng cho test: dừng đột ngột khi tới sự kiện này, KHÔNG commit gì thêm (giả lập tắt máy). */
  crashAtOffset?: number;
}

/**
 * Chạy nguồn sự kiện đã sắp theo thời gian qua `Game`, tick đều đặn và commit định kỳ.
 * Kết quả chỉ phụ thuộc (trạng thái, vị trí nguồn, trạng thái rng) → khôi phục xong chạy tiếp ra đúng như chưa từng tắt.
 */
export function run(game: Game, events: GameEvent[], o: RunOptions): { offset: number; crashed: boolean; commits: number } {
  const tickMs = o.tickMs ?? 1000;
  const commitEvery = o.commitEveryMs ?? 5000;
  let i = o.startOffset ?? 0;
  let commits = 0;
  let lastCommitAt = game.state.lastTick;

  const commit = () => {
    if (!o.store) return;
    o.store.commit(game.state, i, o.rng?.getState());
    lastCommitAt = game.state.lastTick;
    commits++;
  };
  const advanceTo = (t: number) => {
    while (game.state.lastTick + tickMs <= t) {
      game.tick(game.state.lastTick + tickMs);
      if (game.state.lastTick - lastCommitAt >= commitEvery) commit();
    }
  };

  for (; i < events.length; i++) {
    if (o.crashAtOffset !== undefined && i >= o.crashAtOffset) return { offset: i, crashed: true, commits };
    const e = events[i]!;
    if (e.at > o.endAt) break;
    advanceTo(e.at);
    game.handle(e);
  }
  advanceTo(o.endAt);
  commit();
  return { offset: i, crashed: false, commits };
}
