import { Announcer, type Announcement, type Priority } from './announce.ts';
import { GAME_CONFIG, type GameConfig, type SeatRole } from './config.ts';
import { weightedPick, type Rng } from './rng.ts';
import type { GameEvent, GameState, PendingChallenge, Player, Seat } from './types.ts';

const SEEN_CAP = 5000;
const ROLE_NAMES: Record<SeatRole, string> = {
  truongLao: 'Trưởng Lão',
  truongPhai: 'Trưởng Phái',
  tongChu: 'Tông Chủ',
};
const ROLE_ALIASES: Record<string, SeatRole> = {
  'trưởng lão': 'truongLao',
  'truong lao': 'truongLao',
  'trưởng phái': 'truongPhai',
  'truong phai': 'truongPhai',
  'tông chủ': 'tongChu',
  'tong chu': 'tongChu',
};

export interface ChallengeResult {
  winner: 'challenger' | 'defender';
  challengerPower: number;
  defenderPower: number;
}

/**
 * Lõi luật game. Thuần logic: không I/O, không đồng hồ, không ngẫu nhiên ẩn.
 * Thời gian (`at`/`now`) và số ngẫu nhiên đều truyền từ ngoài → test lặp lại được,
 * và dùng được với bất kỳ nguồn sự kiện nào (mô phỏng, TikTok, nhập tay).
 */
export class Game {
  state: GameState;
  readonly announcer: Announcer;
  /** Kết quả các trận đã xong (để test/UI). */
  results: ChallengeResult[] = [];

  constructor(
    private rng: Rng,
    private cfg: GameConfig = GAME_CONFIG,
    state?: GameState,
  ) {
    this.announcer = new Announcer(cfg.announceMinGapMs, cfg.announceMaxQueue);
    this.state = state ?? Game.emptyState(cfg);
  }

  static emptyState(cfg: GameConfig): GameState {
    const seats: Seat[] = [];
    for (const role of Object.keys(cfg.seatCount) as SeatRole[])
      for (let i = 0; i < cfg.seatCount[role]; i++) seats.push({ role, holder: null });
    return { players: {}, seats, hostSupreme: false, pending: null, lastTick: 0, nextFortuneAt: 0, seenEventIds: [] };
  }

  // ---------- Phiên ----------

  /** Bắt đầu phiên LIVE mới: linh căn đo lại (D-009); Tu Vi, cảnh giới, vật phẩm, chức vụ giữ nguyên. */
  startSession(now: number): void {
    for (const p of Object.values(this.state.players)) {
      p.root = null;
      p.present = false;
      p.boostPct = 0;
      p.boostUntil = 0;
    }
    this.state.pending = null;
    this.state.lastTick = now;
    this.state.nextFortuneAt = now + this.fortuneDelay();
  }

  // ---------- Sự kiện ----------

  /** Xử lý 1 sự kiện chuẩn hóa. Trả false nếu bỏ qua (trùng ID hoặc người chơi lạ). */
  handle(e: GameEvent): boolean {
    if (this.state.seenEventIds.includes(e.id)) return false;
    this.state.seenEventIds.push(e.id);
    if (this.state.seenEventIds.length > SEEN_CAP) this.state.seenEventIds.splice(0, 500);

    if (e.type === 'join') return this.onJoin(e.playerId, e.name, e.at), true;
    const p = this.state.players[e.playerId];
    if (!p) return false;
    switch (e.type) {
      case 'heartbeat':
        p.present = true;
        p.lastSeen = e.at;
        break;
      case 'leave':
        p.present = false;
        break;
      case 'like':
        this.onLike(p, e.count, e.at);
        break;
      case 'gift':
        this.onGift(p, e.diamonds, e.side, e.at);
        break;
      case 'command':
        this.onCommand(p, e.text, e.at);
        break;
    }
    return true;
  }

  private onJoin(id: string, name: string, at: number): void {
    let p = this.state.players[id];
    if (!p) {
      p = {
        id,
        name,
        appearance: {
          body: Math.floor(this.rng.next() * 4),
          face: Math.floor(this.rng.next() * 6),
          hair: Math.floor(this.rng.next() * 8),
          color: Math.floor(this.rng.next() * 6),
        },
        root: null,
        present: true,
        lastSeen: at,
        realm: 0,
        minor: 0,
        progress: 0,
        tuViTotal: 0,
        gongfaPct: 0,
        weaponPct: 0,
        treasurePct: 0,
        boostPct: 0,
        boostUntil: 0,
        breakBonus: 0,
        breakCooldownUntil: 0,
        challengeCooldownUntil: 0,
        immuneUntil: 0,
        likeWindowStart: 0,
        likeWindowCount: 0,
      };
      this.state.players[id] = p;
    }
    p.name = name; // tên hiển thị đổi được; ngoại hình thì không (D-013)
    p.present = true;
    p.lastSeen = at;
    if (p.root === null) this.measureRoot(p, at);
  }

  /** Đo linh căn: 1 lần/phiên, không phụ thuộc quà (GAME_FLOW §4). */
  private measureRoot(p: Player, at: number): void {
    const r = weightedPick(this.cfg.roots, this.rng);
    p.root = r.id;
    const rare = r.id === 'thien' || r.id === 'di';
    this.say(rare ? 'high' : 'low', 'root', `Chúc mừng đạo hữu ${p.name} sở hữu ${r.name}!`, true, at);
  }

  private onLike(p: Player, count: number, at: number): void {
    if (at - p.likeWindowStart >= 60_000) {
      p.likeWindowStart = at;
      p.likeWindowCount = 0;
    }
    const room = Math.max(0, this.cfg.likeCapPerMinute - p.likeWindowCount);
    const stones = Math.min(Math.max(0, Math.floor(count)) * this.cfg.likeToLowStone, room);
    p.likeWindowCount += stones;
    if (stones > 0) this.addTuVi(p, stones * this.cfg.tuViPerLowStone, at, false);
  }

  private onGift(p: Player, diamonds: number, side: 'A' | 'B' | undefined, at: number): void {
    const d = Math.max(0, Math.floor(diamonds));
    if (d === 0) return;
    const c = this.state.pending;
    if (c && at < c.endsAt + this.cfg.assistGraceMs) {
      // Cửa sổ Trợ Chiến (D-018): quà cộng Chiến Lực ngay cho một phe.
      const own = p.id === c.challenger ? 'A' : p.id === c.defender ? 'B' : undefined;
      const fallback = this.cfg.assistDefaultSide === 'defender' ? 'B' : undefined;
      const s = own ?? side ?? c.choices[p.id] ?? fallback;
      // Chưa chọn phe và cấu hình là 'none' → quà không tính vào trận (người nhận vẫn được Tu Vi).
      if (s) {
        const pts = d * this.cfg.assistPowerPerDiamond;
        if (s === 'A') c.assistA += pts;
        else c.assistB += pts;
      }
    }
    this.addTuVi(p, d * this.cfg.tuViPerDiamond, at, d >= 100);
  }

  private onCommand(p: Player, text: string, at: number): void {
    const pick = /^!ung\s+([ab])$/i.exec(text.trim());
    if (pick) {
      const c = this.state.pending;
      if (c && at < c.endsAt) c.choices[p.id] = pick[1]!.toUpperCase() as 'A' | 'B';
      return;
    }
    const m = /^!khieuchien\s+(.+)$/i.exec(text.trim());
    if (!m) return;
    const arg = m[1]!.trim().toLowerCase();
    const role = ROLE_ALIASES[arg];
    if (role) this.startChallenge(p.id, { role }, at);
    else {
      const target = Object.values(this.state.players).find((x) => x.name.toLowerCase() === arg);
      if (target) this.startChallenge(p.id, { playerId: target.id }, at);
    }
  }

  // ---------- Tu luyện ----------

  /** Gọi đều đặn (vd. mỗi giây). Cộng Tu Vi theo thời gian hiện diện hợp lệ, thử đột phá, chạy cơ duyên, chốt khiêu chiến. */
  tick(now: number): void {
    const s = this.state;
    const start = Math.max(s.lastTick, now - this.cfg.maxTickGapMs);
    for (const p of Object.values(s.players)) {
      if (!p.present || p.root === null) continue;
      // Chỉ cộng đến lúc hết hạn hiện diện: kết nối treo không được cộng mãi (GDD 6.1).
      const end = Math.min(now, p.lastSeen + this.cfg.presenceTimeoutMs);
      const sec = Math.max(0, end - start) / 1000;
      if (sec > 0) {
        const mult = this.cfg.roots.find((r) => r.id === p.root)!.mult;
        const boost = p.boostUntil > start ? 1 + p.boostPct : 1;
        this.addTuVi(p, sec * this.cfg.baseTuViPerSec * mult * boost, now, false);
      }
      if (now - p.lastSeen > this.cfg.presenceTimeoutMs) p.present = false;
      if (this.cfg.autoBreakthrough) this.tryBreakthrough(p, now);
    }
    s.lastTick = now;
    if (s.pending && now >= s.pending.endsAt + this.cfg.assistGraceMs) this.resolveChallenge(now);
    if (s.nextFortuneAt > 0 && now >= s.nextFortuneAt) {
      this.runFortune(now);
      s.nextFortuneAt = now + this.fortuneDelay();
    }
  }

  private fortuneDelay(): number {
    const [lo, hi] = this.cfg.fortuneIntervalMs;
    return lo + this.rng.next() * (hi - lo);
  }

  private addTuVi(p: Player, amount: number, at: number, announceBig: boolean): void {
    if (amount <= 0) return;
    p.tuViTotal += amount;
    let left = amount;
    const last = this.cfg.realms.length - 1;
    while (left > 0 && p.realm < last) {
      const cost = this.cfg.realms[p.realm]!.perMinor;
      const room = cost - p.progress;
      if (left < room) {
        p.progress += left;
        break;
      }
      left -= room;
      if (p.minor < 3) {
        p.minor++;
        p.progress = 0;
        this.say('textOnly', 'minor', `${p.name} đạt ${this.cfg.realms[p.realm]!.name} ${this.cfg.minorNames[p.minor]}`, false, at);
      } else {
        p.progress = cost; // Đại Viên Mãn: đầy, chờ đột phá. Phần dư vẫn nằm trong tuViTotal.
        break;
      }
    }
    if (announceBig) this.say('medium', 'gift', `Đa tạ đạo hữu ${p.name} đã tặng quà!`, true, at);
  }

  readyToBreak(p: Player): boolean {
    return p.realm < this.cfg.realms.length - 1 && p.minor === 3 && p.progress >= this.cfg.realms[p.realm]!.perMinor;
  }

  /** Đột phá có thể thất bại nhưng không mất Tu Vi; chờ hồi rồi thử lại (D-011). */
  tryBreakthrough(p: Player, now: number): 'none' | 'cooldown' | 'success' | 'fail' {
    if (!this.readyToBreak(p)) return 'none';
    if (now < p.breakCooldownUntil) return 'cooldown';
    const chance = Math.min(1, this.cfg.realms[p.realm]!.breakChance + p.breakBonus);
    p.breakBonus = 0; // Đan dược đột phá dùng một lần
    if (this.rng.next() < chance) {
      const from = this.cfg.realms[p.realm]!.name;
      p.realm++;
      p.minor = 0;
      p.progress = 0;
      const to = this.cfg.realms[p.realm]!.name;
      const big = p.realm >= 3;
      this.say(big ? 'high' : 'medium', 'breakthrough', `${p.name} đột phá từ ${from} lên ${to}!`, true, now);
      // Tu Vi dư (tuViTotal) không chuyển vào tiểu cảnh mới: giữ đơn giản và dễ cân bằng.
      return 'success';
    }
    p.breakCooldownUntil = now + this.cfg.breakCooldownMs;
    this.say('low', 'breakfail', `${p.name} đột phá thất bại, tu vi không tổn hao. Chờ hồi rồi thử lại.`, false, now);
    return 'fail';
  }

  // ---------- Chiến Lực & khiêu chiến ----------

  combatPower(p: Player): number {
    return p.tuViTotal * (1 + p.gongfaPct) * (1 + p.weaponPct) * (1 + p.treasurePct);
  }

  /** Chọn ghế bị khiêu chiến: ghế yếu nhất trong vai trò đó (quy ước tạm). */
  private pickSeat(role: SeatRole, challengerId: string): number {
    let best = -1;
    let bestPower = Infinity;
    this.state.seats.forEach((s, i) => {
      if (s.role !== role || s.holder === challengerId) return;
      const pw = s.holder ? this.combatPower(this.state.players[s.holder]!) : this.cfg.npcPower[role];
      if (pw < bestPower) {
        best = i;
        bestPower = pw;
      }
    });
    return best;
  }

  startChallenge(
    challengerId: string,
    target: { role: SeatRole } | { playerId: string },
    now: number,
  ): { ok: true } | { ok: false; reason: string } {
    const c = this.state.players[challengerId];
    if (!c) return { ok: false, reason: 'unknown_player' };
    if (this.state.pending) return { ok: false, reason: 'busy' };
    if (now < c.challengeCooldownUntil) return { ok: false, reason: 'cooldown' };
    const need = 'role' in target ? this.cfg.challengeMinRealm[target.role]! : this.cfg.challengeMinRealm.player!;
    if (c.realm < need) return { ok: false, reason: 'realm_too_low' };

    let seatIndex: number | null = null;
    let defender: string | null = null;
    let defenderRole: SeatRole | null = null;
    if ('role' in target) {
      seatIndex = this.pickSeat(target.role, challengerId);
      if (seatIndex < 0) return { ok: false, reason: 'no_seat' };
      defender = this.state.seats[seatIndex]!.holder;
      defenderRole = target.role;
    } else {
      const d = this.state.players[target.playerId];
      if (!d || d.id === c.id) return { ok: false, reason: 'bad_target' };
      defender = d.id;
    }
    if (defender) {
      const d = this.state.players[defender]!;
      if (now < d.immuneUntil) return { ok: false, reason: 'defender_immune' };
    }
    c.challengeCooldownUntil = now + this.cfg.challengerCooldownMs;
    this.state.pending = {
      challenger: c.id,
      seatIndex,
      defender,
      defenderRole,
      startedAt: now,
      endsAt: now + this.cfg.assistWindowMs,
      assistA: 0,
      assistB: 0,
      choices: {},
    };
    const who = defender ? this.state.players[defender]!.name : `${ROLE_NAMES[defenderRole!]} (NPC)`;
    this.say('medium', 'challenge', `${c.name} khiêu chiến ${who}! Trợ Chiến mở ${this.cfg.assistWindowMs / 1000} giây.`, true, now);
    return { ok: true };
  }

  private resolveChallenge(now: number): void {
    const c = this.state.pending as PendingChallenge;
    this.state.pending = null;
    const ch = this.state.players[c.challenger]!;
    const swing = () => 1 - this.cfg.powerSwing + this.rng.next() * 2 * this.cfg.powerSwing;
    const baseA = this.combatPower(ch) + c.assistA;
    const baseDef = c.defender ? this.combatPower(this.state.players[c.defender]!) : this.cfg.npcPower[c.defenderRole!];
    const pa = baseA * swing();
    const pb = (baseDef + c.assistB) * swing();
    const win = pa > pb; // bằng nhau → bên bị khiêu chiến thắng (D-016)
    this.results.push({ winner: win ? 'challenger' : 'defender', challengerPower: pa, defenderPower: pb });

    const defName = c.defender ? this.state.players[c.defender]!.name : `${ROLE_NAMES[c.defenderRole!]} (NPC)`;
    if (!win) {
      this.say('medium', 'challenge_result', `${defName} đánh bại ${ch.name}!`, true, now);
      return;
    }
    if (c.seatIndex !== null) {
      const seat = this.state.seats[c.seatIndex]!;
      // Nếu người khiêu chiến đang giữ ghế khác thì nhường ghế đó lại cho NPC.
      for (const s of this.state.seats) if (s.holder === ch.id) s.holder = null;
      seat.holder = ch.id;
      ch.immuneUntil = now + this.cfg.newHolderImmunityMs;
      if (seat.role === 'tongChu') this.state.hostSupreme = true; // D-015
      this.say('high', 'seat', `Chúc mừng ${ch.name} đánh bại ${defName}, nhậm chức ${ROLE_NAMES[seat.role]}!`, true, now);
    } else {
      this.say('medium', 'challenge_result', `${ch.name} đánh bại ${defName}!`, true, now);
    }
  }

  // ---------- Cơ duyên ----------

  /** Chọn đều trong người đang hiện diện — không ưu tiên người tặng quà (GAME_FLOW §10, §11.2). */
  runFortune(now: number): void {
    const pool = Object.values(this.state.players).filter((p) => p.present && p.root !== null);
    if (pool.length === 0) return;
    const p = pool[Math.floor(this.rng.next() * pool.length)]!;
    const reward = weightedPick(this.cfg.fortuneTable, this.rng);
    let what = '';
    switch (reward.kind) {
      case 'tuvi':
        this.addTuVi(p, this.cfg.realms[p.realm]!.perMinor * this.cfg.fortuneTuViFractionOfMinor, now, false);
        what = 'một đạo linh khí tinh thuần';
        break;
      case 'pill':
        if (this.rng.next() < 0.5) {
          p.boostPct = this.cfg.pills.tuKhiDan.boostPct;
          p.boostUntil = now + this.cfg.pills.tuKhiDan.durationMs;
          what = this.cfg.pills.tuKhiDan.name;
        } else {
          p.breakBonus = this.cfg.pills.trucCoDan.breakBonus;
          what = this.cfg.pills.trucCoDan.name;
        }
        break;
      case 'gongfa':
        p.gongfaPct = Math.min(this.cfg.itemPctCap, p.gongfaPct + this.cfg.fortuneItemPct.gongfa);
        what = 'một bộ công pháp';
        break;
      case 'weapon':
        p.weaponPct = Math.min(this.cfg.itemPctCap, p.weaponPct + this.cfg.fortuneItemPct.weapon);
        what = 'một món vũ khí';
        break;
      case 'treasure':
        p.treasurePct = Math.min(this.cfg.itemPctCap, p.treasurePct + this.cfg.fortuneItemPct.treasure);
        what = 'một kiện pháp bảo';
        break;
    }
    const pr: Priority = reward.kind === 'weapon' || reward.kind === 'treasure' ? 'high' : 'medium';
    this.say(pr, 'fortune', `Chúc mừng ký chủ ${p.name} nhận được ${what}!`, true, now);
  }

  // ---------- Khác ----------

  private say(priority: Priority, kind: string, text: string, speak: boolean, at: number): void {
    const a: Announcement = { priority, kind, text, speak, at };
    this.announcer.push(a);
  }

  snapshot(): string {
    return JSON.stringify(this.state);
  }

  static restore(json: string, rng: Rng, cfg: GameConfig = GAME_CONFIG): Game {
    return new Game(rng, cfg, JSON.parse(json) as GameState);
  }
}
