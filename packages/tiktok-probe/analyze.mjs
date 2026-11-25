// Bộ phân tích cho PoC-3 TikTok. THUẦN logic, không mạng — kiểm thử được ngoại tuyến.
// QUYỀN RIÊNG TƯ: không bao giờ lưu tên hiển thị hay nội dung bình luận. ID người xem chỉ tồn tại trong bộ nhớ
// dưới dạng băm với muối ngẫu nhiên mỗi lần chạy; báo cáo chỉ có số đếm.
import { createHash, randomBytes } from 'node:crypto';

const ID_KEYS = ['userId', 'user_id', 'id', 'idStr', 'secUid'];

/** Duyệt đối tượng, trả các đường dẫn khóa (chỉ TÊN khóa, không có giá trị). */
export function paths(obj, depth = 3, prefix = '', out = new Set()) {
  if (obj === null || typeof obj !== 'object' || depth < 0) return out;
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    out.add(p);
    if (Array.isArray(v)) {
      if (v[0] && typeof v[0] === 'object') paths(v[0], depth - 1, `${p}[]`, out);
    } else if (v && typeof v === 'object') paths(v, depth - 1, p, out);
  }
  return out;
}

function pick(obj, keys) {
  for (const k of keys) if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  return undefined;
}

export function createAnalyzer({ now = () => Date.now(), salt = randomBytes(16) } = {}) {
  const hash = (x) => createHash('sha256').update(salt).update(String(x)).digest('hex').slice(0, 12);
  const types = new Map(); // type -> {count, withUserId, maskedUserId, paths:Set}
  const viewersByType = new Map(); // type -> Set(hash)
  const allViewers = new Set();
  const minutes = new Map(); // phút -> số sự kiện (xem tốc độ/độ dồn dập)
  const startedAt = now();
  const gifts = { total: 0, withDiamond: 0, diamondSum: 0, withRepeat: 0, repeatEnd: 0, ids: new Set() };
  const likes = { total: 0, withCount: 0, countSum: 0, withTotal: 0, maxTotal: 0 };
  const chats = { total: 0, bang: 0, diacritics: 0, empty: 0 };
  const room = { updates: 0, maxViewers: 0, withViewerCount: 0 };
  const conn = { connected: 0, disconnected: 0, errors: 0, errorKinds: new Map() };
  let msgIds = 0;
  const seenMsgIds = new Set();
  let dupMsgIds = 0;

  function userOf(p) {
    return p && typeof p === 'object' ? (p.user && typeof p.user === 'object' ? p.user : p) : undefined;
  }

  return {
    record(type, p) {
      const t = types.get(type) ?? { count: 0, withUserId: 0, maskedUserId: 0, paths: new Set() };
      t.count++;
      for (const x of paths(p)) t.paths.add(x);
      const u = userOf(p);
      const id = u ? pick(u, ID_KEYS) : undefined;
      if (id !== undefined) {
        t.withUserId++;
        const s = String(id);
        if (s === '' || s === '0') t.maskedUserId++;
        else {
          const h = hash(s);
          allViewers.add(h);
          (viewersByType.get(type) ?? viewersByType.set(type, new Set()).get(type)).add(h);
        }
      }
      types.set(type, t);
      const m = Math.floor((now() - startedAt) / 60_000);
      minutes.set(m, (minutes.get(m) ?? 0) + 1);

      const mid = p?.msgId ?? p?.common?.msgId;
      if (mid !== undefined) {
        msgIds++;
        const k = String(mid);
        if (seenMsgIds.has(k)) dupMsgIds++;
        else seenMsgIds.add(k);
      }

      if (type === 'gift') {
        gifts.total++;
        const d = p?.diamondCount ?? p?.gift?.diamondCount ?? p?.giftDetails?.diamondCount;
        if (typeof d === 'number') {
          gifts.withDiamond++;
          gifts.diamondSum += d * Math.max(1, Number(p?.repeatCount ?? 1));
        }
        if (p?.repeatCount !== undefined) gifts.withRepeat++;
        if (p?.repeatEnd) gifts.repeatEnd++;
        const gid = p?.giftId ?? p?.gift?.id;
        if (gid !== undefined) gifts.ids.add(String(gid));
      } else if (type === 'like') {
        likes.total++;
        const c = p?.likeCount;
        if (typeof c === 'number') {
          likes.withCount++;
          likes.countSum += c;
        }
        const tt = p?.totalLikeCount;
        if (typeof tt === 'number') {
          likes.withTotal++;
          likes.maxTotal = Math.max(likes.maxTotal, tt);
        }
      } else if (type === 'chat') {
        chats.total++;
        const c = String(p?.comment ?? '');
        if (!c) chats.empty++;
        if (c.trim().startsWith('!')) chats.bang++;
        if (/[ăâêôơưđàáảãạèéẻẽẹìíỉĩịòóỏõọùúủũụỳýỷỹỵ]/i.test(c)) chats.diacritics++;
      } else if (type === 'roomUser') {
        room.updates++;
        const v = p?.viewerCount ?? p?.totalUser;
        if (typeof v === 'number') {
          room.withViewerCount++;
          room.maxViewers = Math.max(room.maxViewers, v);
        }
      }
    },
    connection(kind, err) {
      if (kind === 'connected') conn.connected++;
      else if (kind === 'disconnected') conn.disconnected++;
      else if (kind === 'error') {
        conn.errors++;
        const name = String(err?.name ?? err?.constructor?.name ?? 'Error');
        conn.errorKinds.set(name, (conn.errorKinds.get(name) ?? 0) + 1);
      }
    },
    report() {
      const durMin = Math.max(1 / 60, (now() - startedAt) / 60_000);
      const perType = {};
      for (const [k, t] of types)
        perType[k] = {
          count: t.count,
          perMinute: +(t.count / durMin).toFixed(2),
          withUserId: t.withUserId,
          maskedUserId: t.maskedUserId,
          distinctViewers: viewersByType.get(k)?.size ?? 0,
          fieldPaths: [...t.paths].sort(),
        };
      const peak = Math.max(0, ...minutes.values());
      return {
        simulated: false,
        durationMinutes: +durMin.toFixed(1),
        eventTypesSeen: [...types.keys()].sort(),
        perType,
        distinctViewersAllTypes: allViewers.size,
        peakEventsPerMinute: peak,
        gifts: { ...gifts, ids: gifts.ids.size },
        likes,
        chats,
        room,
        connection: { ...conn, errorKinds: Object.fromEntries(conn.errorKinds) },
        messageIds: { withMsgId: msgIds, duplicates: dupMsgIds },
      };
    },
  };
}

/** Trả lời các câu hỏi T1–T5 của CORE_AND_SPEC_REVIEW từ báo cáo. Chỉ nêu điều đo được; không suy diễn. */
export function verdict(r) {
  const has = (t) => r.eventTypesSeen.includes(t);
  const idOk = (t) => (r.perType[t] ? r.perType[t].withUserId - r.perType[t].maskedUserId : 0);
  const lines = [];
  lines.push(`T1 Hiện diện: loại sự kiện thấy được = ${r.eventTypesSeen.join(', ') || '(không có)'}.`);
  lines.push(
    `   - Có sự kiện vào phòng ("member"): ${has('member') ? 'CÓ' : 'KHÔNG THẤY'}; có sự kiện rời phòng: ${
      r.eventTypesSeen.some((t) => /leave|exit|quit/i.test(t)) ? 'CÓ' : 'KHÔNG THẤY'
    }; số người xem tổng ("roomUser") ${room(r)}.`,
  );
  lines.push(`T2 ID người xem: ${r.distinctViewersAllTypes} người khác nhau có ID dùng được. Theo loại: ` +
    ['chat', 'like', 'gift', 'member'].map((t) => `${t}=${idOk(t)}/${r.perType[t]?.count ?? 0}`).join(', ') + '.');
  const masked = Object.entries(r.perType).filter(([, v]) => v.maskedUserId > 0).map(([k, v]) => `${k}(${v.maskedUserId})`);
  lines.push(`   - Sự kiện có ID rỗng/0 (nghi bị che): ${masked.join(', ') || 'không thấy'}.`);
  lines.push(`T3 Tim theo người: ${r.likes.total} sự kiện tim; có số lượng: ${r.likes.withCount}; có ID người gửi: ${idOk('like')}/${r.perType.like?.count ?? 0}.`);
  lines.push(`T4/T5 Quà: ${r.gifts.total} sự kiện; có giá trị kim cương: ${r.gifts.withDiamond}; có repeatCount: ${r.gifts.withRepeat}; kết thúc chuỗi: ${r.gifts.repeatEnd}.`);
  lines.push(`T6 Lệnh: ${r.chats.total} bình luận, ${r.chats.bang} bắt đầu bằng "!", ${r.chats.diacritics} có dấu tiếng Việt.`);
  lines.push(`Kết nối: ${r.connection.connected} lần nối, ${r.connection.disconnected} lần rớt, ${r.connection.errors} lỗi ${JSON.stringify(r.connection.errorKinds)}.`);
  lines.push(`Mã tin trùng: ${r.messageIds.duplicates}/${r.messageIds.withMsgId}.`);
  return lines.join('\n');
}
function room(r) {
  return r.room.updates ? `có (${r.room.updates} lần cập nhật, cao nhất ${r.room.maxViewers})` : 'KHÔNG THẤY';
}
