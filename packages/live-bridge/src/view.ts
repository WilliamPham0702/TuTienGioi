import { GAME_CONFIG, type Announcement, type Game, type GameConfig, type Player } from '../../core/src/index.ts';

/** Gói dữ liệu gửi ra màn hình. Chỉ chứa những gì màn hình cần vẽ, không chứa ID TikTok gốc. */
export interface ViewPlayer {
  /** ID rút gọn ổn định trong phiên, dùng làm khóa sprite. */
  key: string;
  name: string;
  realm: string;
  minor: string;
  /** Tiến độ trong Tiểu Cảnh hiện tại, 0..1. */
  progress: number;
  root: string | null;
  appearance: Player['appearance'];
  seat: string | null;
  badges: string[];
  xinMa: boolean;
  boosted: boolean;
}

export interface ViewState {
  v: 1;
  now: number;
  paused: boolean;
  hostSupreme: boolean;
  players: ViewPlayer[];
  seats: { role: string; holder: string | null }[];
  tide: { progress: number; threshold: number; activeUntil: number; activations: number };
  challenge: null | {
    challenger: string;
    defender: string;
    endsAt: number;
    graceUntil: number;
    powerA: number;
    powerB: number;
    assistA: number;
    assistB: number;
  };
  boards: Record<'tuVi' | 'chienLuc' | 'beQuan' | 'cungPhung', { name: string; value: number }[]>;
}

export interface ViewMessage {
  type: 'state';
  state: ViewState;
}
export interface AnnounceMessage {
  type: 'announce';
  items: Announcement[];
}

const ROLE_NAMES: Record<string, string> = { truongLao: 'Trưởng Lão', truongPhai: 'Trưởng Phái', tongChu: 'Tông Chủ' };

/** Khóa ngắn, không lộ ID TikTok: băm FNV-1a của ID người chơi. */
function keyOf(id: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(36);
}

/** Dựng gói trạng thái cho màn hình. `maxPlayers` giới hạn số nhân vật gửi đi (ưu tiên chức vụ rồi Tu Vi). */
export function buildView(game: Game, now: number, maxPlayers = 60, cfg: GameConfig = GAME_CONFIG): ViewState {
  const s = game.state;
  const name = (id: string | null) => (id ? (s.players[id]?.name ?? '?') : 'NPC');
  const holders = new Set(s.seats.map((x) => x.holder).filter(Boolean));
  const present = Object.values(s.players)
    .filter((p) => p.present)
    .sort((a, b) => Number(holders.has(b.id)) - Number(holders.has(a.id)) || b.tuViTotal - a.tuViTotal || (a.id < b.id ? -1 : 1))
    .slice(0, maxPlayers);

  const players: ViewPlayer[] = present.map((p) => {
    const t = game.displayTitles(p);
    const realm = cfg.realms[p.realm]!;
    return {
      key: keyOf(p.id),
      name: p.name,
      realm: realm.name,
      minor: cfg.minorNames[p.minor] ?? '',
      progress: realm.perMinor > 0 ? Math.min(1, p.progress / realm.perMinor) : 1,
      root: p.root ? (cfg.roots.find((r) => r.id === p.root)?.name ?? null) : null,
      appearance: p.appearance,
      seat: t.seat,
      badges: t.badges,
      xinMa: !!p.xinMa && now < p.xinMa.until,
      boosted: p.boostUntil > now,
    };
  });

  const c = s.pending;
  const powerOf = (id: string | null) => {
    const p = id ? s.players[id] : undefined;
    return p ? game.combatPower(p) : 0;
  };
  const board = (tab: 'tuVi' | 'chienLuc' | 'beQuan' | 'cungPhung') =>
    game.leaderboard(tab, 5).map((r) => ({ name: r.name, value: Math.floor(r.value) }));

  return {
    v: 1,
    now,
    paused: s.paused,
    hostSupreme: s.hostSupreme,
    players,
    seats: s.seats.map((x) => ({ role: ROLE_NAMES[x.role] ?? x.role, holder: x.holder ? name(x.holder) : null })),
    tide: { progress: s.tide.progress, threshold: cfg.tide.threshold, activeUntil: s.tide.until, activations: s.tide.activations },
    challenge: c
      ? {
          challenger: name(c.challenger),
          defender: c.defender ? name(c.defender) : `NPC ${c.defenderRole ? (ROLE_NAMES[c.defenderRole] ?? '') : ''}`.trim(),
          endsAt: c.endsAt,
          graceUntil: c.endsAt + cfg.assistGraceMs,
          powerA: Math.floor(powerOf(c.challenger)),
          powerB: Math.floor(c.defender ? powerOf(c.defender) : c.defenderRole ? cfg.npcPower[c.defenderRole] : 0),
          assistA: c.assistA,
          assistB: c.assistB,
        }
      : null,
    boards: { tuVi: board('tuVi'), chienLuc: board('chienLuc'), beQuan: board('beQuan'), cungPhung: board('cungPhung') },
  };
}
