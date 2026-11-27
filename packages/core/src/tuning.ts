import type { GameConfig, RootId } from './config.ts';

/**
 * Phần lõi cho CÔNG CỤ GM chỉnh tỉ lệ (thiết kế: 08_TECHNICAL/C-004_OPERATOR_TOOLS.md mục 4).
 * Chưa có giao diện. Ở đây chỉ có: danh sách thông số được phép chỉnh, giới hạn an toàn, kiểm tra và áp dụng.
 * Áp dụng tạo CẤU HÌNH MỚI (không sửa cấu hình đang chạy) + danh sách thay đổi để ghi nhật ký kiểm toán.
 */
export interface TuningOverrides {
  /** Nhân toàn bộ Tu Vi lên cấp (vd. 0,5 = giảm một nửa như D-020). */
  realmScale?: number;
  /** Chỉnh từng Đại Cảnh (chỉ số 0 = Luyện Khí … 8 = Độ Kiếp). */
  realms?: { index: number; perMinor?: number; breakChance?: number }[];
  baseTuViPerSec?: number;
  tuViPerLowStone?: number;
  likeCapPerMinute?: number;
  tuViPerDiamond?: number;
  assistPowerPerDiamond?: number;
  rootMults?: Partial<Record<RootId, number>>;
  /** Tỉ lệ ra từng linh căn; nếu chỉnh thì tổng tất cả phải bằng 1 (100%). */
  rootChances?: Partial<Record<RootId, number>>;
  /** Cơ duyên: khoảng phút giữa hai lần [ngắn nhất, dài nhất]. */
  fortuneIntervalMin?: [number, number];
  powerSwing?: number;
}

export interface TuningChange {
  key: string;
  from: number | string;
  to: number | string;
}

/** Giới hạn an toàn: ngoài khoảng này công cụ GM từ chối (tránh gõ nhầm thêm số 0). */
export const TUNING_LIMITS = {
  realmScale: [0.1, 10],
  perMinor: [10, 100_000_000],
  breakChance: [0.05, 1],
  baseTuViPerSec: [0.1, 100],
  tuViPerLowStone: [0, 1000],
  likeCapPerMinute: [0, 600],
  tuViPerDiamond: [0, 10_000],
  assistPowerPerDiamond: [0, 100_000],
  rootMult: [0.5, 10],
  rootChance: [0, 1],
  fortuneIntervalMin: [1, 120],
  powerSwing: [0, 0.5],
} as const;

const inRange = (v: unknown, [lo, hi]: readonly [number, number]) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;

export function validateTuning(cfg: GameConfig, o: TuningOverrides): string[] {
  const err: string[] = [];
  const L = TUNING_LIMITS;
  const num = (name: string, v: unknown, r: readonly [number, number]) => {
    if (v !== undefined && !inRange(v, r)) err.push(`${name} phải trong khoảng ${r[0]}–${r[1]}`);
  };
  num('Hệ số Tu Vi lên cấp', o.realmScale, L.realmScale);
  num('Tu Vi mỗi giây', o.baseTuViPerSec, L.baseTuViPerSec);
  num('Tu Vi mỗi Hạ Phẩm Linh Thạch', o.tuViPerLowStone, L.tuViPerLowStone);
  num('Trần tim mỗi phút', o.likeCapPerMinute, L.likeCapPerMinute);
  num('Tu Vi mỗi xu quà', o.tuViPerDiamond, L.tuViPerDiamond);
  num('Chiến Lực trợ chiến mỗi xu', o.assistPowerPerDiamond, L.assistPowerPerDiamond);
  num('Dao động Chiến Lực', o.powerSwing, L.powerSwing);

  const lastIdx = cfg.realms.length - 2; // không chỉnh Chân Tiên (cảnh cuối)
  const seen = new Set<number>();
  for (const r of o.realms ?? []) {
    if (!Number.isInteger(r.index) || r.index < 0 || r.index > lastIdx) {
      err.push(`Đại Cảnh số ${r.index} không tồn tại (0–${lastIdx})`);
      continue;
    }
    if (seen.has(r.index)) err.push(`Đại Cảnh ${cfg.realms[r.index]!.name} bị chỉnh hai lần`);
    seen.add(r.index);
    num(`Tu Vi mỗi tiểu cảnh của ${cfg.realms[r.index]!.name}`, r.perMinor, L.perMinor);
    num(`Tỉ lệ đột phá của ${cfg.realms[r.index]!.name}`, r.breakChance, L.breakChance);
  }

  const ids = new Set(cfg.roots.map((r) => r.id));
  for (const [id, v] of Object.entries(o.rootMults ?? {})) {
    if (!ids.has(id as RootId)) err.push(`Linh căn "${id}" không tồn tại`);
    else num(`Hệ số linh căn ${id}`, v, L.rootMult);
  }
  if (o.rootChances) {
    for (const [id, v] of Object.entries(o.rootChances)) {
      if (!ids.has(id as RootId)) err.push(`Linh căn "${id}" không tồn tại`);
      else num(`Tỉ lệ linh căn ${id}`, v, L.rootChance);
    }
    const sum = cfg.roots.reduce((s, r) => s + (o.rootChances![r.id] ?? r.chance), 0);
    if (Math.abs(sum - 1) > 1e-6) err.push(`Tổng tỉ lệ linh căn phải bằng 100% (đang là ${(sum * 100).toFixed(2)}%)`);
  }
  if (o.fortuneIntervalMin !== undefined) {
    const [a, b] = o.fortuneIntervalMin;
    if (!inRange(a, L.fortuneIntervalMin) || !inRange(b, L.fortuneIntervalMin) || a > b)
      err.push(`Khoảng cơ duyên phải là [ngắn, dài] trong ${L.fortuneIntervalMin[0]}–${L.fortuneIntervalMin[1]} phút, ngắn ≤ dài`);
  }

  // Sau khi áp: cảnh sau phải tốn nhiều Tu Vi hơn cảnh trước, và tỉ lệ đột phá không tăng dần lên.
  if (!err.length) {
    const next = applyTuningUnchecked(cfg, o).config.realms.slice(0, -1);
    for (let i = 1; i < next.length; i++) {
      if (next[i]!.perMinor <= next[i - 1]!.perMinor) err.push(`${next[i]!.name} phải tốn nhiều Tu Vi hơn ${next[i - 1]!.name}`);
      if (next[i]!.breakChance > next[i - 1]!.breakChance) err.push(`Tỉ lệ đột phá ${next[i]!.name} không được cao hơn ${next[i - 1]!.name}`);
    }
  }
  return err;
}

/** Kiểm tra rồi áp dụng. Lỗi thì không đổi gì. */
export function applyTuning(cfg: GameConfig, o: TuningOverrides): { ok: true; config: GameConfig; changes: TuningChange[] } | { ok: false; errors: string[] } {
  const errors = validateTuning(cfg, o);
  if (errors.length) return { ok: false, errors };
  return { ok: true, ...applyTuningUnchecked(cfg, o) };
}

function applyTuningUnchecked(cfg: GameConfig, o: TuningOverrides): { config: GameConfig; changes: TuningChange[] } {
  const c: GameConfig = structuredClone(cfg);
  const changes: TuningChange[] = [];
  const set = (key: string, from: number, to: number, write: (v: number) => void) => {
    if (from !== to) {
      changes.push({ key, from, to });
      write(to);
    }
  };
  const last = c.realms.length - 1;
  if (o.realmScale !== undefined)
    c.realms.forEach((r, i) => {
      if (i < last) set(`realms.${r.name}.perMinor`, r.perMinor, Math.round(r.perMinor * o.realmScale!), (v) => (r.perMinor = v));
    });
  for (const x of o.realms ?? []) {
    const r = c.realms[x.index]!;
    if (x.perMinor !== undefined) set(`realms.${r.name}.perMinor`, r.perMinor, Math.round(x.perMinor), (v) => (r.perMinor = v));
    if (x.breakChance !== undefined) set(`realms.${r.name}.breakChance`, r.breakChance, x.breakChance, (v) => (r.breakChance = v));
  }
  const scalar = ['baseTuViPerSec', 'likeCapPerMinute', 'tuViPerDiamond', 'assistPowerPerDiamond', 'powerSwing'] as const;
  for (const k of scalar) if (o[k] !== undefined) set(k, c[k], o[k]!, (v) => ((c as Record<string, unknown>)[k] = v));
  for (const r of c.roots) {
    const m = o.rootMults?.[r.id];
    if (m !== undefined) set(`roots.${r.id}.mult`, r.mult, m, (v) => (r.mult = v));
    const ch = o.rootChances?.[r.id];
    if (ch !== undefined) set(`roots.${r.id}.chance`, r.chance, ch, (v) => (r.chance = v));
  }
  if (o.fortuneIntervalMin) {
    const [a, b] = o.fortuneIntervalMin.map((m) => m * 60_000) as [number, number];
    set('fortuneIntervalMs.min', c.fortuneIntervalMs[0], a, (v) => (c.fortuneIntervalMs[0] = v));
    set('fortuneIntervalMs.max', c.fortuneIntervalMs[1], b, (v) => (c.fortuneIntervalMs[1] = v));
  }
  return { config: c, changes };
}
