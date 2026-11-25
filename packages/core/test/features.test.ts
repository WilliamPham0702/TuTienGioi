import { describe, expect, it } from 'vitest';
import { GAME_CONFIG, Game, seededRng, type GameEvent, type Rng } from '../src/index.ts';

const fixed = (v: number): Rng => ({ next: () => v });
let n = 0;
const id = () => `f${++n}`;
const join = (g: Game, pid: string, at = 0) => g.handle({ id: id(), type: 'join', playerId: pid, name: pid, at });
const like = (g: Game, pid: string, count: number, at: number) => g.handle({ id: id(), type: 'like', playerId: pid, count, at });
const community = (g: Game, count: number, at: number) => g.handle({ id: id(), type: 'communityLike', count, at } as GameEvent);

describe('Linh Khí Triều', () => {
  it('đủ tim hợp lệ → bật ×2 Tu Vi trong 3 phút rồi tan; có hồi chiêu', () => {
    const g = new Game(fixed(0.5));
    g.startSession(0);
    g.state.nextFortuneAt = 0;
    join(g, 'a');
    g.state.players.a!.root = 'tap';
    g.tick(1000);
    community(g, GAME_CONFIG.tide.threshold, 1000);
    expect(g.state.tide.until).toBe(1000 + GAME_CONFIG.tide.durationMs);
    // 10 giây trong triều: 20 Tu Vi thay vì 10
    for (let t = 2000; t <= 11_000; t += 1000) {
      g.handle({ id: id(), type: 'heartbeat', playerId: 'a', at: t });
      g.tick(t);
    }
    expect(g.state.players.a!.tuViTotal).toBeCloseTo(21, 3); // 1 giây trước triều + 10 giây trong triều × 2
    // tim thêm khi đang triều/hồi chiêu không kích hoạt lần nữa
    community(g, GAME_CONFIG.tide.threshold, 5000);
    expect(g.state.tide.activations).toBe(1);
  });

  it('trần số lần kích hoạt mỗi phiên', () => {
    const g = new Game(fixed(0.5));
    g.startSession(0);
    let t = 0;
    for (let i = 0; i < 20; i++) {
      t += GAME_CONFIG.tide.durationMs + GAME_CONFIG.tide.cooldownMs + 1;
      community(g, GAME_CONFIG.tide.threshold, t);
    }
    expect(g.state.tide.activations).toBe(GAME_CONFIG.tide.maxPerSession);
  });

  it('tim từng người (có trần 60/phút) cũng góp vào thanh cộng đồng', () => {
    const g = new Game(fixed(0.5));
    g.startSession(0);
    join(g, 'a');
    like(g, 'a', 1000, 1);
    expect(g.state.tide.progress).toBe(GAME_CONFIG.likeCapPerMinute);
  });
});

describe('Tâm Ma / Trợ Đạo', () => {
  const failing = () => {
    const g = new Game(fixed(0.99), { ...GAME_CONFIG, autoBreakthrough: false }); // đột phá luôn thất bại, thử tay
    g.startSession(0);
    g.state.nextFortuneAt = 0;
    join(g, 'a');
    join(g, 'b');
    const a = g.state.players.a!;
    a.minor = 3;
    a.progress = 600;
    g.tryBreakthrough(a, 1000);
    return { g, a };
  };

  it('thất bại → vào Tâm Ma, không mất Tu Vi', () => {
    const { a } = failing();
    expect(a.xinMa).not.toBeNull();
  });

  it('đủ tim của người khác trong cửa sổ → thử lại ngay; không tăng tỉ lệ', () => {
    const { g, a } = failing();
    community(g, GAME_CONFIG.xinMa.heartsNeeded, 5000);
    expect(a.xinMa).toBeNull();
    expect(a.breakCooldownUntil).toBe(5000);
    expect(g.tryBreakthrough(a, 5000)).toBe('fail'); // rng 0.99: tỉ lệ vẫn như cũ
  });

  it('tim của chính người Tâm Ma không tính (chống tự cứu)', () => {
    const { g, a } = failing();
    for (let t = 2000; t < 40_000; t += 61_000) like(g, 'a', 1000, t);
    expect(a.xinMa!.hearts).toBe(0);
  });

  it('hết cửa sổ mà chưa đủ tim → chờ hồi chiêu bình thường', () => {
    const { g, a } = failing();
    community(g, 10, 2000);
    g.tick(1000 + GAME_CONFIG.xinMa.windowMs + 1);
    expect(a.xinMa).toBeNull();
    expect(a.breakCooldownUntil).toBe(1000 + GAME_CONFIG.breakCooldownMs);
  });
});

describe('Thiên Bảng', () => {
  it('4 tab; Bế Quan và Cúng Phụng reset theo phiên, Tu Vi giữ', () => {
    const g = new Game(seededRng(1));
    g.startSession(0);
    g.state.nextFortuneAt = 0;
    join(g, 'a');
    join(g, 'b');
    g.state.players.a!.root = 'tap';
    g.state.players.b!.root = 'tap';
    g.handle({ id: id(), type: 'gift', playerId: 'b', diamonds: 7, at: 1 });
    for (let t = 1000; t <= 10_000; t += 1000) {
      g.handle({ id: id(), type: 'heartbeat', playerId: 'a', at: t });
      g.tick(t);
    }
    expect(g.leaderboard('cungPhung')[0]).toMatchObject({ id: 'b', value: 7 });
    expect(g.leaderboard('beQuan')[0]!.id).toBe('a');
    expect(g.leaderboard('tuVi')[0]!.id).toBe('b'); // quà 7×20 = 140 > 10
    g.startSession(20_000);
    expect(g.leaderboard('cungPhung')).toEqual([]);
    expect(g.leaderboard('beQuan')).toEqual([]);
    expect(g.leaderboard('tuVi').length).toBe(2);
  });

  it('đồng hạng: mã nhỏ hơn đứng trước (ổn định, không nhấp nháy)', () => {
    const g = new Game(fixed(0.5));
    for (const x of ['c', 'a', 'b']) join(g, x);
    for (const p of Object.values(g.state.players)) p.tuViTotal = 100;
    expect(g.leaderboard('tuVi').map((r) => r.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('Danh Hiệu', () => {
  it('cấp theo cột mốc, hiện tối đa 2 danh hiệu, chức vụ tách riêng', () => {
    const g = new Game(fixed(0.1));
    join(g, 'a');
    const p = g.state.players.a!;
    p.realm = 1;
    p.minor = 3;
    p.progress = 3000;
    g.tryBreakthrough(p, 1); // Trúc Cơ → Kim Đan
    expect(p.badges).toEqual(['tanTu', 'nhapDao', 'kimDan']);
    g.state.seats[0]!.holder = 'a';
    expect(g.displayTitles(p)).toEqual({ seat: 'Trưởng Lão', badges: ['Nhập Đạo', 'Kim Đan Chân Nhân'] });
  });
});

describe('Operator tạm dừng', () => {
  it('đang tạm dừng: không cộng Tu Vi, trận và cơ duyên bị đóng băng; tiếp tục thì chạy lại', () => {
    const g = new Game(fixed(0.5));
    g.startSession(0);
    join(g, 'a');
    join(g, 'b');
    g.state.players.a!.root = 'tap';
    g.state.players.a!.realm = 2;
    g.startChallenge('a', { role: 'truongLao' }, 0);
    const endsAt = g.state.pending!.endsAt;
    g.pause();
    g.handle({ id: id(), type: 'heartbeat', playerId: 'a', at: 60_000 });
    g.tick(60_000);
    expect(g.state.players.a!.tuViTotal).toBe(0);
    expect(g.state.pending).not.toBeNull();
    expect(g.state.pending!.endsAt).toBe(endsAt + 60_000);
    g.resume();
    g.tick(60_000 + 33_000);
    expect(g.state.pending).toBeNull();
  });
});
