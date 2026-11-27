/**
 * Toàn bộ con số game nằm ở đây, KHÔNG nằm trong luật.
 * Mọi giá trị là TẠM (D-017) — lấy từ GAME_FLOW_v0.1, chờ PO duyệt sau mô phỏng.
 */
export type RootId = 'tap' | 'song' | 'tam' | 'thien' | 'di' | 'tien' | 'thanhthe';
export type SeatRole = 'truongLao' | 'truongPhai' | 'tongChu';

export const GAME_CONFIG = {
  provisional: true,

  roots: [
    { id: 'tap', name: 'Tạp Linh Căn', mult: 1, chance: 0.35 },
    { id: 'song', name: 'Song Linh Căn', mult: 2, chance: 0.25 },
    { id: 'tam', name: 'Tam Linh Căn', mult: 3, chance: 0.18 },
    { id: 'thien', name: 'Thiên Linh Căn', mult: 4, chance: 0.12 },
    { id: 'di', name: 'Dị Linh Căn', mult: 5, chance: 0.06 },
    { id: 'tien', name: 'Tiên Linh Căn', mult: 6, chance: 0.03 },
    { id: 'thanhthe', name: 'Thánh Thể', mult: 10, chance: 0.01 },
  ] as { id: RootId; name: string; mult: number; chance: number }[],

  baseTuViPerSec: 1,
  presenceTimeoutMs: 30_000,
  maxTickGapMs: 60_000,

  /** Ngưỡng Tu Vi tích lũy để đạt từng Đại Cảnh, theo GDD checkpoint 2026-11-26. */
  realmThresholds: [
    1_200,
    6_000,
    24_000,
    72_000,
    180_000,
    420_000,
    900_000,
    1_800_000,
    3_600_000,
    7_200_000,
  ],
  realms: [
    { name: 'Luyện Khí', perMinor: 300, breakChance: 1 },
    { name: 'Trúc Cơ', perMinor: 1_200, breakChance: 1 },
    { name: 'Kim Đan', perMinor: 4_500, breakChance: 1 },
    { name: 'Nguyên Anh', perMinor: 12_000, breakChance: 1 },
    { name: 'Hóa Thần', perMinor: 27_000, breakChance: 1 },
    { name: 'Luyện Hư', perMinor: 60_000, breakChance: 1 },
    { name: 'Hợp Thể', perMinor: 120_000, breakChance: 1 },
    { name: 'Đại Thừa', perMinor: 240_000, breakChance: 1 },
    { name: 'Độ Kiếp', perMinor: 540_000, breakChance: 1 },
    { name: 'Tiên Cảnh', perMinor: 0, breakChance: 1 },
  ],
  minorNames: ['Sơ Kỳ', 'Trung Kỳ', 'Hậu Kỳ', 'Đại Viên Mãn'],
  autoBreakthrough: true,
  breakCooldownMs: 0,
  breakPillBonus: 0,

  /** Đan dược cộng thẳng Tu Vi; nhận/dùng không giới hạn, không cooldown. */
  pills: {
    tuKhiDan: { name: 'Tụ Khí Đan', tuVi: 100 },
    ngungKhiDan: { name: 'Ngưng Khí Đan', tuVi: 500 },
    trucCoDan: { name: 'Trúc Cơ Đan', tuVi: 1_500 },
    kimDan: { name: 'Kim Đan Đan', tuVi: 5_000 },
    nguyenAnhDan: { name: 'Nguyên Anh Đan', tuVi: 15_000 },
    hoaThanDan: { name: 'Hóa Thần Đan', tuVi: 40_000 },
  },

  // Like hợp lệ cộng trực tiếp Tu Vi theo Linh Căn; giữ giới hạn chống spam hiện tại.
  tuViPerLike: 5,
  likeCapPerMinute: 60,

  /** Quà → Tu Vi (D-010: tính vào Chiến Lực, không trần). Bảng cố định, công khai, không ngẫu nhiên (D-018). CHỜ D-007. */
  tuViPerDiamond: 20,

  // Khiêu chiến
  challengeMinRealm: { player: 1, truongLao: 2, truongPhai: 3, tongChu: 4 } as Record<string, number>,
  seatCount: { truongLao: 4, truongPhai: 2, tongChu: 1 } as Record<SeatRole, number>,
  npcPower: { truongLao: 20_000, truongPhai: 150_000, tongChu: 800_000 } as Record<SeatRole, number>,
  assistWindowMs: 30_000,
  /** Ân hạn nhận quà đến trễ (độ trễ mạng) sau khi hết cửa sổ Trợ Chiến. PO duyệt 3 giây (25/11/2026). */
  assistGraceMs: 3_000,
  assistPowerPerDiamond: 30,
  /**
   * Quà của người xem CHƯA chọn phe: 'none' = không tính vào trận (FEATURE_SPEC §5, GDD v0.3 §9.3);
   * 'defender' = mặc định cho bên giữ chức (GAME_FLOW §11.1). Hai tài liệu mâu thuẫn — chờ PO chọn.
   */
  assistDefaultSide: 'none' as 'none' | 'defender',
  powerSwing: 0.1, // D-016
  challengerCooldownMs: 5 * 60_000,
  newHolderImmunityMs: 2 * 60_000,

  // Cơ duyên
  fortuneIntervalMs: [5 * 60_000, 10 * 60_000] as [number, number],
  fortuneTable: [
    { kind: 'tuvi', chance: 0.45 },
    { kind: 'pill', chance: 0.3 },
    { kind: 'gongfa', chance: 0.15 },
    { kind: 'weapon', chance: 0.07 },
    { kind: 'treasure', chance: 0.03 },
  ] as { kind: 'tuvi' | 'pill' | 'gongfa' | 'weapon' | 'treasure'; chance: number }[],
  fortuneTuViFractionOfMinor: 0.1,
  fortuneItemPct: { gongfa: 0.05, weapon: 0.05, treasure: 0.08 },
  itemPctCap: 0.5,
  pills: {
    tuKhiDan: { name: 'Tụ Khí Đan', boostPct: 0.2, durationMs: 5 * 60_000 },
    trucCoDan: { name: 'Trúc Cơ Đan', breakBonus: 0.2 },
  },

  // Linh Khí Triều (FEATURE_SPEC §1) — mọi con số là ĐỀ XUẤT
  tide: { threshold: 2000, durationMs: 180_000, multiplier: 2, cooldownMs: 600_000, maxPerSession: 6 },

  // Tâm Ma / Trợ Đạo (FEATURE_SPEC §3): tim của người khác rút ngắn thời gian chờ, KHÔNG tăng xác suất
  xinMa: { windowMs: 120_000, heartsNeeded: 300, excludeSelf: true },

  // Danh Hiệu theo cột mốc (FEATURE_SPEC §4)
  badges: [
    { id: 'tanTu', label: 'Tân Tú' },
    { id: 'nhapDao', label: 'Nhập Đạo' },
    { id: 'kimDan', label: 'Kim Đan Chân Nhân' },
    { id: 'doKiep', label: 'Người Độ Kiếp' },
  ],
  maxBadgesShown: 2,

  // Thông báo
  announceMinGapMs: 3_500,
  announceMaxQueue: 12,
};

export type GameConfig = typeof GAME_CONFIG;
