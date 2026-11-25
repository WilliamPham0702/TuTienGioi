/**
 * Kiểm duyệt tên hiển thị (GDD mục 11). Tên bị chặn thì KHÔNG hiện và KHÔNG đọc to;
 * thay bằng bí danh ổn định "Đạo hữu #xxxx" (cùng người chơi → cùng bí danh).
 *
 * Cách so khớp:
 * - Chuẩn hóa: chữ thường, bỏ dấu tiếng Việt (đ → d), đổi ký tự "leet" (0→o, 1→i, 3→e, 4→a, 5→s, 7→t, @→a, $→s),
 *   gộp chữ lặp ("fuuuck" → "fuck").
 * - Từ NGẮN (dễ trùng tên thật, vd. "lon" trong "Long") chỉ chặn khi đứng thành MỘT TỪ riêng.
 * - Từ DÀI, đặc trưng thì chặn cả khi bị dính liền hoặc chèn ký tự ("d.i.t m.e", "ditme").
 * - Chặn thêm tên quảng cáo: link, số điện thoại, "zalo", "telegram".
 * Danh sách là BẢN ĐẦU, người vận hành thêm/bớt được lúc chạy (có ghi nhật ký kiểm toán).
 */

/** Chặn khi đứng thành một từ riêng (sau chuẩn hóa). */
export const DEFAULT_BLOCKED_TOKENS = [
  'dm', 'dmm', 'dcm', 'dkm', 'dcmm', 'vcl', 'vkl', 'vl', 'clm', 'cmm', 'dit', 'lon', 'loz', 'cac', 'buoi', 'cut', 'cave',
  'sex', 'porn', 'cock', 'dick', 'cum', 'slut', 'whore', 'nigga', 'nigger', 'fag',
];

/** Chặn cả khi dính liền với chữ khác trong cùng một từ, hoặc khi hai từ liền nhau ghép lại đúng bằng nó. */
export const DEFAULT_BLOCKED_SUBSTRINGS = [
  'ditme', 'dume', 'duma', 'dumay', 'ditbo', 'ditcon', 'concho', 'occho', 'thangcho', 'conmeno', 'mayngu', 'dongu',
  'nungloz', 'nunglon', 'cailon', 'concac', 'daubuoi', 'vailon', 'vailoz', 'vaicac', 'thangngu', 'conngu',
  'fuck', 'fuk', 'shit', 'bitch', 'pussy', 'motherf', 'asshole', 'bastard', 'retard', 'hitler', 'nazi',
];

/**
 * Từ tục trùng chữ với từ thường khi bỏ dấu ("lồn" / "lớn", "cặc" / "các").
 * Chỉ chặn khi viết KHÔNG dấu, hoặc đúng dạng có dấu tục; viết dấu khác thì cho qua.
 */
const AMBIGUOUS: Record<string, string[]> = {
  lon: ['lồn', 'lìn'],
  cac: ['cặc', 'cạc'],
  buoi: ['buồi'],
  cut: ['cứt'],
  dit: ['địt', 'đít', 'đjt'],
};

const SPAM_PATTERNS = [
  /https?:\/\//i,
  /www\./i,
  /\.(com|net|vn|io|xyz|me|top|link)\b/i,
  /\b(zalo|telegram|tele|t\.me|inbox|ib)\b/i,
  /\d[\d\s.-]{8,}\d/, // số điện thoại / số tài khoản
];

const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's', '!': 'i' };

/** Bỏ dấu tiếng Việt, chữ thường. */
export function foldVietnamese(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

/** Các từ sau chuẩn hóa (giữ ranh giới từ). */
export function tokens(s: string): string[] {
  const f = foldVietnamese(s).replace(/[013457@$!]/g, (c) => LEET[c] ?? c);
  return f
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(collapse);
}

/** Gộp chữ lặp liền nhau: "fuuuck" → "fuck", "dmm" → "dm". */
export function collapse(t: string): string {
  return t.replace(/(.)\1+/g, '$1');
}

/** Chuỗi liền sau chuẩn hóa (bỏ mọi ký tự phân cách) — bắt kiểu "d.i.t m.e". */
export function squash(s: string): string {
  return collapse(tokens(s).join(''));
}

export interface NameCheck {
  ok: boolean;
  reason?: 'empty' | 'blocked' | 'spam';
  /** Từ bị bắt (để người vận hành xem; không hiển thị cho khán giả). */
  match?: string;
}

export interface NameFilterOptions {
  blockedTokens?: string[];
  blockedSubstrings?: string[];
  maxLength?: number;
}

export class NameFilter {
  private tokenSet: Set<string>;
  private subs: string[];
  readonly maxLength: number;

  constructor(o: NameFilterOptions = {}) {
    this.tokenSet = new Set((o.blockedTokens ?? DEFAULT_BLOCKED_TOKENS).map((t) => squash(t)).filter(Boolean));
    this.subs = [...new Set((o.blockedSubstrings ?? DEFAULT_BLOCKED_SUBSTRINGS).map((t) => squash(t)).filter(Boolean))];
    this.maxLength = o.maxLength ?? 20;
  }

  /** Thêm từ chặn lúc chạy. Từ ≤ 4 ký tự (sau chuẩn hóa) chặn theo từ riêng, dài hơn chặn cả khi dính liền. */
  addWord(w: string): string {
    const k = squash(w);
    if (!k) return k;
    if (k.length <= 4) this.tokenSet.add(k);
    else if (!this.subs.includes(k)) this.subs.push(k);
    return k;
  }

  removeWord(w: string): boolean {
    const k = squash(w);
    const a = this.tokenSet.delete(k);
    const i = this.subs.indexOf(k);
    if (i >= 0) this.subs.splice(i, 1);
    return a || i >= 0;
  }

  words(): { tokens: string[]; substrings: string[] } {
    return { tokens: [...this.tokenSet].sort(), substrings: [...this.subs].sort() };
  }

  check(name: string): NameCheck {
    const clean = stripControl(name);
    if (!clean.trim()) return { ok: false, reason: 'empty' };
    for (const re of SPAM_PATTERNS) if (re.test(clean) || re.test(foldVietnamese(clean))) return { ok: false, reason: 'spam' };
    const toks = tokens(clean);
    const rawToks = clean.toLowerCase().normalize('NFC').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    for (const t of toks) {
      if (!this.tokenSet.has(t)) continue;
      const vulgar = AMBIGUOUS[t];
      if (vulgar) {
        const raws = rawToks.filter((r) => collapse(foldVietnamese(r)) === t);
        if (raws.length && raws.every((r) => foldVietnamese(r) !== r && !vulgar.includes(r))) continue; // "Lớn", "Các"
      }
      return { ok: false, reason: 'blocked', match: t };
    }
    // Tên viết rời từng chữ ("d i t m e"): ghép lại rồi so.
    const joined = collapse(toks.join(''));
    const spaced = toks.length > 1 && toks.every((t) => t.length <= 2) ? joined : '';
    if (spaced && this.tokenSet.has(spaced)) return { ok: false, reason: 'blocked', match: spaced };
    for (const s of this.subs) {
      if (toks.some((t) => t.includes(s)) || (spaced && spaced.includes(s))) return { ok: false, reason: 'blocked', match: s };
      for (let i = 0; i + 1 < toks.length; i++) if (collapse(toks[i]! + toks[i + 1]!) === s) return { ok: false, reason: 'blocked', match: s };
    }
    return { ok: true };
  }

  /**
   * Tên dùng để hiển thị và đọc to.
   * - `hidden` = người vận hành đã ẩn tên này bằng tay.
   * - `approved` = người vận hành đã duyệt tên này (bộ lọc bắt nhầm) → hiện dù bộ lọc chặn.
   * - Tên bị chặn/quảng cáo/trống → bí danh ổn định theo mã người chơi.
   * - Tên dài bị cắt, bỏ ký tự điều khiển.
   */
  display(playerId: string, raw: string, hidden = false, approved = false): string {
    if (hidden || (!approved && !this.check(raw).ok)) return aliasFor(playerId);
    const clean = stripControl(raw).trim().replace(/\s+/g, ' ');
    const chars = [...clean];
    return chars.length > this.maxLength ? chars.slice(0, this.maxLength - 1).join('') + '…' : clean;
  }
}

/** Bí danh ổn định: "Đạo hữu #1234" (4 số từ băm mã người chơi). */
export function aliasFor(playerId: string): string {
  let h = 2166136261;
  for (let i = 0; i < playerId.length; i++) h = Math.imul(h ^ playerId.charCodeAt(i), 16777619);
  return `Đạo hữu #${String((h >>> 0) % 10000).padStart(4, '0')}`;
}

function stripControl(s: string): string {
  // ký tự điều khiển, ký tự định hướng (RTL override), zero-width
  return s.replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁤﻿]/g, '');
}
