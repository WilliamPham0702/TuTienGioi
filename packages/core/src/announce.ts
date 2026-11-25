export type Priority = 'high' | 'medium' | 'low' | 'textOnly';

export interface Announcement {
  priority: Priority;
  kind: string;
  text: string;
  /** Có đọc to không. textOnly thì không bao giờ đọc. */
  speak: boolean;
  at: number;
}

const ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2, textOnly: 3 };

/**
 * Hàng đợi thông báo chung (GAME_FLOW §12).
 * - Mỗi lần chỉ lấy 1 mục có đọc to, cách nhau tối thiểu `minGapMs`.
 * - Mục chỉ hiện chữ không bị giới hạn nhịp (UI tự cuộn).
 * - Quá tải: bỏ mục ưu tiên thấp nhất/cũ nhất trước; không bao giờ bỏ 'high'.
 */
export class Announcer {
  private queue: Announcement[] = [];
  private lastSpokenAt = -Infinity;
  dropped = 0;

  constructor(private minGapMs: number, private maxQueue: number) {}

  push(a: Announcement): void {
    this.queue.push(a);
    while (this.queue.length > this.maxQueue) {
      const idx = this.victim();
      if (idx < 0) break;
      this.queue.splice(idx, 1);
      this.dropped++;
    }
  }

  private victim(): number {
    let worst = -1;
    for (let i = 0; i < this.queue.length; i++) {
      const q = this.queue[i]!;
      if (q.priority === 'high') continue;
      if (worst < 0 || ORDER[q.priority] > ORDER[this.queue[worst]!.priority]) worst = i;
    }
    return worst;
  }

  /** Trả các thông báo cần hiển thị tại thời điểm `now`. */
  drain(now: number): Announcement[] {
    const out: Announcement[] = [];
    const rest: Announcement[] = [];
    for (const a of this.queue) (a.speak ? rest : out).push(a);
    rest.sort((x, y) => ORDER[x.priority] - ORDER[y.priority] || x.at - y.at);
    if (rest.length && now - this.lastSpokenAt >= this.minGapMs) {
      out.push(rest.shift()!);
      this.lastSpokenAt = now;
    }
    this.queue = rest;
    return out;
  }

  get size(): number {
    return this.queue.length;
  }
}
