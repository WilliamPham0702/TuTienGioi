import type { AuditEntry, AuditLog } from './audit.ts';
import type { Game } from './engine.ts';

/**
 * Lệnh của người vận hành. MỌI lần gọi (thành công hay bị từ chối) đều ghi nhật ký kiểm toán.
 * Lớp này không biết gì về HTTP: bảng điều khiển, phím tắt hay dòng lệnh đều gọi `run()`.
 */
export type OperatorAction =
  | 'pause'
  | 'resume'
  | 'startSession'
  | 'hideName'
  | 'unhideName'
  | 'approveName'
  | 'unapproveName'
  | 'addBlockedWord'
  | 'removeBlockedWord';

export const OPERATOR_ACTIONS: readonly OperatorAction[] = [
  'pause',
  'resume',
  'startSession',
  'hideName',
  'unhideName',
  'approveName',
  'unapproveName',
  'addBlockedWord',
  'removeBlockedWord',
];

export interface OperatorResult {
  ok: boolean;
  error?: string;
  result?: unknown;
  audit: AuditEntry;
}

const MAX_WORD = 40;

export class Operator {
  constructor(
    readonly game: Game,
    readonly audit: AuditLog,
  ) {}

  run(actor: string, action: string, args: Record<string, unknown>, now: number): OperatorResult {
    let ok = false;
    let error: string | undefined;
    let result: unknown;
    const detail: Record<string, unknown> = { ...pickSafe(args) };
    try {
      result = this.exec(action, args, detail, now);
      ok = true;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      detail.error = error;
    }
    const audit = this.audit.append({ at: now, actor: actor || 'unknown', action, detail, ok });
    return { ok, error, result, audit };
  }

  private exec(action: string, args: Record<string, unknown>, detail: Record<string, unknown>, now: number): unknown {
    const g = this.game;
    const pid = () => {
      const id = args.playerId;
      if (typeof id !== 'string' || !id) throw new Error('thiếu playerId');
      if (!g.state.players[id]) throw new Error('không có người chơi này');
      return id;
    };
    const word = () => {
      const w = args.word;
      if (typeof w !== 'string' || !w.trim()) throw new Error('thiếu từ');
      if (w.length > MAX_WORD) throw new Error('từ quá dài');
      return w;
    };
    const nameChange = (id: string, f: () => void) => {
      const before = g.state.players[id]!.name;
      f();
      detail.before = before;
      detail.after = g.state.players[id]!.name;
      return detail.after;
    };
    switch (action) {
      case 'pause':
        if (g.state.paused) throw new Error('đang tạm dừng rồi');
        g.pause();
        return true;
      case 'resume':
        if (!g.state.paused) throw new Error('game đang chạy');
        g.resume();
        return true;
      case 'startSession':
        g.startSession(now);
        return true;
      case 'hideName': {
        const id = pid();
        return nameChange(id, () => g.setNameHidden(id, true));
      }
      case 'unhideName': {
        const id = pid();
        return nameChange(id, () => g.setNameHidden(id, false));
      }
      case 'approveName': {
        const id = pid();
        return nameChange(id, () => g.setNameApproved(id, true));
      }
      case 'unapproveName': {
        const id = pid();
        return nameChange(id, () => g.setNameApproved(id, false));
      }
      case 'addBlockedWord': {
        const key = g.nameFilter.addWord(word());
        if (!key) throw new Error('từ không hợp lệ');
        detail.key = key;
        detail.renamed = g.refreshNames();
        return detail.renamed;
      }
      case 'removeBlockedWord': {
        if (!g.nameFilter.removeWord(word())) throw new Error('từ này không có trong danh sách');
        detail.renamed = g.refreshNames();
        return detail.renamed;
      }
      default:
        throw new Error('lệnh không hỗ trợ');
    }
  }

  /** Ảnh chụp trạng thái cho bảng điều khiển (chỉ đọc). */
  status(now: number) {
    const g = this.game;
    const players = Object.values(g.state.players);
    const present = players.filter((p) => p.present);
    const flagged = players
      .filter((p) => p.rawName !== undefined && (p.nameHidden || p.name !== g.nameFilter.display(p.id, p.rawName, false, true)))
      .slice(0, 50)
      .map((p) => ({ id: p.id, name: p.name, rawName: p.rawName, hidden: !!p.nameHidden, approved: !!p.nameApproved }));
    return {
      now,
      paused: g.state.paused,
      players: { total: players.length, present: present.length },
      seats: g.state.seats.map((s) => ({ role: s.role, holder: s.holder ? (g.state.players[s.holder]?.name ?? s.holder) : null })),
      hostSupreme: g.state.hostSupreme,
      tide: { ...g.state.tide, active: g.state.tide.until > now },
      pending: g.state.pending
        ? {
            challenger: g.state.players[g.state.pending.challenger]?.name ?? g.state.pending.challenger,
            defender: g.state.pending.defender ? (g.state.players[g.state.pending.defender]?.name ?? g.state.pending.defender) : 'NPC',
            endsInMs: Math.max(0, g.state.pending.endsAt - now),
            assistA: g.state.pending.assistA,
            assistB: g.state.pending.assistB,
          }
        : null,
      announcements: { queued: g.announcer.size, dropped: g.announcer.dropped },
      leaderboards: {
        tuVi: g.leaderboard('tuVi', 5),
        chienLuc: g.leaderboard('chienLuc', 5),
        beQuan: g.leaderboard('beQuan', 5),
        cungPhung: g.leaderboard('cungPhung', 5),
      },
      flaggedNames: flagged,
      blockedWords: g.nameFilter.words(),
      audit: this.audit.recent(20),
      auditIntact: this.audit.verify() === null,
    };
  }

  /** Danh sách người chơi theo tên (để tìm nhanh khi cần ẩn tên). */
  findPlayers(query: string, limit = 20) {
    const q = query.trim().toLowerCase();
    return Object.values(this.game.state.players)
      .filter((p) => !q || p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || (p.rawName ?? '').toLowerCase().includes(q))
      .slice(0, limit)
      .map((p) => ({ id: p.id, name: p.name, rawName: p.rawName, present: p.present, hidden: !!p.nameHidden, approved: !!p.nameApproved }));
  }
}

/** Chỉ giữ tham số kiểu đơn giản, cắt ngắn chuỗi — tránh ghi rác hoặc dữ liệu lớn vào nhật ký. */
function pickSafe(args: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(args ?? {}).slice(0, 10)) {
    if (k === 'token' || k === 'password') continue;
    if (typeof v === 'string') out[k] = v.slice(0, 80);
    else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
  }
  return out;
}
