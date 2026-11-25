export interface Rng {
  /** Số thực trong [0, 1). */
  next(): number;
}

/** Bộ sinh số lưu được trạng thái, để khôi phục sau khi tắt đột ngột mà kết quả vẫn y hệt. */
export interface PersistableRng extends Rng {
  getState(): number;
  setState(n: number): void;
}

/** Bộ sinh số có seed (mulberry32): cùng seed → cùng kết quả, để test và mô phỏng lặp lại được. */
export function seededRng(seed: number): PersistableRng {
  let a = seed >>> 0;
  return {
    getState: () => a,
    setState: (n: number) => {
      a = n >>> 0;
    },
    next() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

export function weightedPick<T extends { chance: number }>(items: T[], rng: Rng): T {
  const total = items.reduce((s, i) => s + i.chance, 0);
  let r = rng.next() * total;
  for (const it of items) {
    r -= it.chance;
    if (r < 0) return it;
  }
  return items[items.length - 1]!;
}
