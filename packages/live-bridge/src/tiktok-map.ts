import type { GameEvent } from '../../core/src/index.ts';

/**
 * Chuyển sự kiện thô của `tiktok-live-connector` (v2.4.x) thành `GameEvent` của lõi game.
 *
 * CHƯA KIỂM CHỨNG VỚI TIKTOK THẬT. Tên trường lấy từ định nghĩa kiểu của thư viện
 * (tiktok-live-proto v3); phải đối chiếu lại với `report.txt` của công cụ thăm dò.
 * Mọi chỗ đọc trường đều phòng thủ: thiếu trường thì bỏ sự kiện, không ném lỗi.
 *
 * Quy ước TẠM (cần PO duyệt):
 * - Người lạ làm bất cứ gì (bình luận, tim, quà) được tự cho vào game trước (sinh `join`).
 * - Mỗi hoạt động của một người = một lần "còn đang xem" (`heartbeat`). TikTok có thể không
 *   báo người xem im lặng, nên người không làm gì sẽ hết hiện diện sau `presenceTimeoutMs`.
 * - Bình luận bắt đầu bằng `!` là lệnh; bình luận khác chỉ tính là hiện diện.
 * - Quà combo (gift.type === 1) chỉ tính khi chuỗi kết thúc (`repeatEnd`), tổng = kim cương × repeatCount.
 */

type Raw = Record<string, any>;

export interface MapOptions {
  /** Tiền tố ID người chơi để không trùng với nguồn khác. */
  idPrefix?: string;
}

export class TikTokMapper {
  private known = new Set<string>();
  private seq = 0;
  private prefix: string;
  /** Số sự kiện bị bỏ vì thiếu trường (để chẩn đoán). */
  skipped = 0;

  constructor(o: MapOptions = {}) {
    this.prefix = o.idPrefix ?? 'tt:';
  }

  // Ghi chú: `known` luôn bắt đầu rỗng mỗi phiên, kể cả khi khôi phục từ SQLite. Lần hoạt động
  // đầu tiên trong phiên phải là `join` để lõi đo lại linh căn (D-009); `join` với người cũ không mất dữ liệu.

  map(type: string, p: Raw, now: number): GameEvent[] {
    switch (type) {
      case 'member':
        return this.withUser(p, now, () => []);
      case 'chat': {
        const text = typeof p?.content === 'string' ? p.content.normalize('NFC').trim() : '';
        return this.withUser(p, now, (pid, eid) =>
          text.startsWith('!') ? [{ id: `${eid}:cmd`, type: 'command', playerId: pid, text, at: now }] : [],
        );
      }
      case 'like': {
        const count = Math.floor(Number(p?.count));
        if (!(count > 0)) return this.skip();
        return this.withUser(p, now, (pid, eid) => [{ id: `${eid}:like`, type: 'like', playerId: pid, count, at: now }]);
      }
      case 'gift': {
        const g = p?.gift ?? p?.extendedGiftInfo ?? {};
        const per = Number(g?.diamondCount ?? g?.diamond_count ?? p?.diamondCount);
        const streakable = Number(g?.type) === 1;
        const ended = !!p?.repeatEnd;
        const repeat = Math.max(1, Math.floor(Number(p?.repeatCount) || 1));
        return this.withUser(p, now, (pid, eid) => {
          if (streakable && !ended) return []; // combo đang chạy: chờ sự kiện cuối chuỗi
          if (!(per > 0)) return [];
          return [{ id: `${eid}:gift`, type: 'gift', playerId: pid, diamonds: per * repeat, at: now }];
        });
      }
      case 'social':
      case 'emote':
      case 'questionNew':
        return this.withUser(p, now, () => []);
      default:
        return [];
    }
  }

  private skip(): GameEvent[] {
    this.skipped++;
    return [];
  }

  /** Lấy người gửi; sinh `join` nếu là người lạ, luôn kèm `heartbeat`, rồi thêm sự kiện riêng. */
  private withUser(p: Raw, now: number, rest: (playerId: string, eventId: string) => GameEvent[]): GameEvent[] {
    const u = p?.user ?? {};
    const raw = u.id ?? u.userId ?? p?.userId ?? u.uniqueId ?? u.displayId;
    if (raw === undefined || raw === null || raw === '' || raw === '0') return this.skip();
    const pid = this.prefix + String(raw);
    const name = String(u.nickname || u.displayId || u.uniqueId || 'Đạo hữu').normalize('NFC').trim().slice(0, 24);
    const msgId = p?.common?.msgId ?? p?.msgId;
    const eid = msgId && msgId !== '0' ? `tt-${msgId}` : `tt-${now}-${this.seq++}`;
    const out: GameEvent[] = [];
    if (!this.known.has(pid)) {
      this.known.add(pid);
      out.push({ id: `${eid}:join`, type: 'join', playerId: pid, name, at: now });
    } else {
      out.push({ id: `${eid}:hb`, type: 'heartbeat', playerId: pid, at: now });
    }
    out.push(...rest(pid, eid));
    return out;
  }
}
