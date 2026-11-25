import type { RootId, SeatRole } from './config.ts';

export interface Appearance {
  body: number;
  face: number;
  hair: number;
  color: number;
}

export interface Player {
  id: string;
  name: string;
  /** Cố định theo người chơi, không đổi (D-013). */
  appearance: Appearance;
  /** Đo lại mỗi phiên (D-009). null = chưa đo trong phiên này. */
  root: RootId | null;
  present: boolean;
  lastSeen: number;

  // Lưu qua các phiên
  realm: number;
  minor: number;
  /** Tu Vi trong Tiểu Cảnh hiện tại. */
  progress: number;
  /** Tu Vi tích lũy toàn bộ — dùng cho Chiến Lực. */
  tuViTotal: number;
  gongfaPct: number;
  weaponPct: number;
  treasurePct: number;

  /** Tính theo phiên LIVE, reset khi bắt đầu phiên mới (Thiên Bảng). */
  sessionBeQuanSec: number;
  sessionGiftDiamonds: number;
  /** Trạng thái Tâm Ma sau đột phá thất bại; null = không có. */
  xinMa: { until: number; hearts: number } | null;
  badges: string[];

  // Trạng thái tạm
  boostPct: number;
  boostUntil: number;
  breakBonus: number;
  breakCooldownUntil: number;
  challengeCooldownUntil: number;
  immuneUntil: number;
  likeWindowStart: number;
  likeWindowCount: number;
}

export interface Seat {
  role: SeatRole;
  /** null = NPC giữ ghế. */
  holder: string | null;
}

export interface PendingChallenge {
  challenger: string;
  /** Ghế bị khiêu chiến, hoặc null nếu là đấu người chơi thường. */
  seatIndex: number | null;
  defender: string | null; // null = NPC
  defenderRole: SeatRole | null;
  startedAt: number;
  endsAt: number;
  assistA: number; // phe khiêu chiến
  assistB: number; // phe bị khiêu chiến
  /** Người xem đã chọn phe bằng lệnh `!ung A|B` (A = người khiêu chiến, B = bên bị khiêu chiến). */
  choices: Record<string, 'A' | 'B'>;
}

export type GameEvent =
  | { id: string; type: 'join'; playerId: string; name: string; at: number }
  | { id: string; type: 'heartbeat'; playerId: string; at: number }
  | { id: string; type: 'leave'; playerId: string; at: number }
  | { id: string; type: 'like'; playerId: string; count: number; at: number }
  | { id: string; type: 'gift'; playerId: string; diamonds: number; side?: 'A' | 'B'; at: number }
  | { id: string; type: 'communityLike'; count: number; at: number }
  | { id: string; type: 'command'; playerId: string; text: string; at: number };

export interface GameState {
  players: Record<string, Player>;
  seats: Seat[];
  /** Host trở thành Thái Thượng Tông Chủ khi người chơi giành ghế Tông Chủ (D-015). */
  hostSupreme: boolean;
  /** Linh Khí Triều. */
  tide: { progress: number; until: number; cooldownUntil: number; activations: number };
  /** Operator tạm dừng: dừng mọi cơ chế theo thời gian. */
  paused: boolean;
  pending: PendingChallenge | null;
  lastTick: number;
  nextFortuneAt: number;
  seenEventIds: string[];
}
