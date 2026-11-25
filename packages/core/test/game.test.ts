import { describe, expect, it } from 'vitest';
import { Announcer, GAME_CONFIG, Game, seededRng, type GameEvent, type Rng } from '../src/index.ts';

const fixed = (v: number): Rng => ({ next: () => v });
let n = 0;
const ev = <T extends Omit<GameEvent, 'id'>>(e: T): GameEvent => ({ ...e, id: `e${++n}` }) as GameEvent;
const join = (g: Game, id: string, at = 0, name = id) => g.handle(ev({ type: 'join', playerId: id, name, at }));

describe('linh căn (D-009)', () => {
  it('bảng tỉ lệ cộng đúng 100%', () => {
    const sum = GAME_CONFIG.roots.reduce((s, r) => s + r.chance, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it('phân bố ngẫu nhiên khớp bảng (seed cố định, 20.000 lần)', () => {
    const g = new Game(seededRng(42));
    const counts: Record<string, number> = {};
    for (let i = 0; i < 20000; i++) {
      join(g, `p${i}`);
      const r = g.state.players[`p${i}`]!.root!;
      counts[r] = (counts[r] ?? 0) + 1;
    }
    for (const r of GAME_CONFIG.roots) {
      const got = (counts[r.id] ?? 0) / 20000;
      expect(Math.abs(got - r.chance)).toBeLessThan(0.012);
    }
  });

  it('đo 1 lần mỗi phiên; phiên mới đo lại nhưng giữ Tu Vi và ngoại hình', () => {
    const g = new Game(seededRng(1));
    g.startSession(0);
    join(g, 'a');
    const p = g.state.players.a!;
    const root1 = p.root;
    const look = { ...p.appearance };
    p.tuViTotal = 123;
    join(g, 'a'); // vào lại trong cùng phiên: không đo lại
    expect(p.root).toBe(root1);

    g.startSession(1000);
    expect(p.root).toBeNull();
    join(g, 'a', 1000);
    expect(p.root).not.toBeNull();
    expect(p.tuViTotal).toBe(123);
    expect(p.appearance).toEqual(look); // D-013
  });
});

describe('tu luyện theo thời gian', () => {
  it('Tạp linh căn 10 phút = 600 Tu Vi; Nhất phẩm = 1200', () => {
    const g = new Game(seededRng(1));
    g.startSession(0);
    g.state.nextFortuneAt = 0; // tắt cơ duyên để đo riêng Tu Vi theo thời gian
    join(g, 'a');
    join(g, 'b');
    g.state.players.a!.root = 'tap';
    g.state.players.b!.root = 'nhatpham';
    for (let t = 1; t <= 600; t++) {
      g.handle(ev({ type: 'heartbeat', playerId: 'a', at: t * 1000 }));
      g.handle(ev({ type: 'heartbeat', playerId: 'b', at: t * 1000 }));
      g.tick(t * 1000);
    }
    expect(g.state.players.a!.tuViTotal).toBeCloseTo(600, 3);
    expect(g.state.players.b!.tuViTotal).toBeCloseTo(1200, 3);
  });

  it('kết nối treo không được cộng mãi: dừng sau 30 giây không heartbeat', () => {
    const g = new Game(seededRng(1));
    g.startSession(0);
    join(g, 'a', 0);
    g.state.players.a!.root = 'tap';
    for (let t = 1; t <= 300; t++) g.tick(t * 1000);
    expect(g.state.players.a!.tuViTotal).toBeCloseTo(30, 3);
    expect(g.state.players.a!.present).toBe(false);
  });

  it('tick sau khi mất tick lâu không cộng bù quá maxTickGap', () => {
    const g = new Game(seededRng(1));
    g.startSession(0);
    join(g, 'a', 0);
    g.state.players.a!.root = 'tap';
    g.handle(ev({ type: 'heartbeat', playerId: 'a', at: 3_600_000 }));
    g.tick(3_600_000);
    expect(g.state.players.a!.tuViTotal).toBeLessThanOrEqual(60);
  });
});

describe('thả tim và quà', () => {
  it('tim: 1 tim = 1 Hạ Phẩm = 10 Tu Vi, trần 60/phút (D-014)', () => {
    const g = new Game(seededRng(1));
    join(g, 'a', 0);
    g.handle(ev({ type: 'like', playerId: 'a', count: 1000, at: 1000 }));
    expect(g.state.players.a!.tuViTotal).toBe(600);
    g.handle(ev({ type: 'like', playerId: 'a', count: 10, at: 30_000 }));
    expect(g.state.players.a!.tuViTotal).toBe(600); // cùng phút: đã chạm trần
    g.handle(ev({ type: 'like', playerId: 'a', count: 10, at: 61_001 }));
    expect(g.state.players.a!.tuViTotal).toBe(700);
  });

  it('quà cộng Tu Vi theo bảng cố định, không trần (D-010)', () => {
    const g = new Game(seededRng(1));
    join(g, 'a');
    g.handle(ev({ type: 'gift', playerId: 'a', diamonds: 1000, at: 1 }));
    expect(g.state.players.a!.tuViTotal).toBe(1000 * GAME_CONFIG.tuViPerDiamond);
  });

  it('sự kiện trùng ID bị bỏ qua (chống cộng trùng khi reconnect)', () => {
    const g = new Game(seededRng(1));
    join(g, 'a');
    const e: GameEvent = { id: 'dup', type: 'gift', playerId: 'a', diamonds: 10, at: 1 };
    expect(g.handle(e)).toBe(true);
    expect(g.handle(e)).toBe(false);
    expect(g.state.players.a!.tuViTotal).toBe(10 * GAME_CONFIG.tuViPerDiamond);
  });

  it('sự kiện của người lạ bị bỏ qua', () => {
    const g = new Game(seededRng(1));
    expect(g.handle(ev({ type: 'like', playerId: 'ghost', count: 5, at: 1 }))).toBe(false);
  });
});

describe('cảnh giới & đột phá (D-011)', () => {
  it('lên Tiểu Cảnh tự động; Đại Viên Mãn thì dừng chờ đột phá', () => {
    const g = new Game(fixed(0.99)); // 0.99 → luôn thất bại đột phá khi chance < 0.99
    join(g, 'a');
    const p = g.state.players.a!;
    p.root = 'tap';
    g.handle(ev({ type: 'gift', playerId: 'a', diamonds: 1000, at: 1 })); // 20.000 Tu Vi
    expect(p.realm).toBe(0);
    expect(p.minor).toBe(3);
    expect(g.readyToBreak(p)).toBe(true);
    expect(p.tuViTotal).toBe(20000); // không mất gì
  });

  it('thất bại: không mất Tu Vi, phải chờ hồi 60 giây rồi thử lại', () => {
    const g = new Game(fixed(0.99));
    join(g, 'a');
    const p = g.state.players.a!;
    p.minor = 3;
    p.progress = 600;
    p.tuViTotal = 5000;
    expect(g.tryBreakthrough(p, 1000)).toBe('fail');
    expect(p.tuViTotal).toBe(5000);
    expect(p.realm).toBe(0);
    expect(g.tryBreakthrough(p, 30_000)).toBe('cooldown');
    expect(g.tryBreakthrough(p, 61_001)).toBe('fail');
  });

  it('thành công: lên Đại Cảnh mới, trở về Sơ Kỳ', () => {
    const g = new Game(fixed(0.1));
    join(g, 'a');
    const p = g.state.players.a!;
    p.minor = 3;
    p.progress = 600;
    expect(g.tryBreakthrough(p, 1)).toBe('success');
    expect([p.realm, p.minor, p.progress]).toEqual([1, 0, 0]);
  });

  it('Trúc Cơ Đan tăng tỉ lệ một lần duy nhất', () => {
    const g = new Game(fixed(0.97)); // 0.95 + 0.2 > 0.97
    join(g, 'a');
    const p = g.state.players.a!;
    p.minor = 3;
    p.progress = 600;
    p.breakBonus = 0.2;
    expect(g.tryBreakthrough(p, 1)).toBe('success');
    expect(p.breakBonus).toBe(0);
  });
});

describe('khiêu chiến (D-012, D-015, D-016, D-018)', () => {
  const setup = (rng: Rng) => {
    const g = new Game(rng);
    join(g, 'a');
    join(g, 'b');
    // Không cho tu luyện trong lúc đấu để Chiến Lực test chính xác (tick vẫn chạy luật khác)
    for (const p of Object.values(g.state.players)) p.root = null;
    return g;
  };

  it('từ chối khi cảnh giới chưa đủ', () => {
    const g = setup(fixed(0.5));
    expect(g.startChallenge('a', { role: 'truongLao' }, 0)).toEqual({ ok: false, reason: 'realm_too_low' });
  });

  it('bằng nhau → bên bị khiêu chiến thắng; hơn 1 Tu Vi → bên khiêu chiến thắng', () => {
    // rng 0.5 → hệ số dao động đúng 1,0 cho cả hai bên
    for (const [extra, winner] of [[0, 'defender'], [1, 'challenger']] as const) {
      const g = setup(fixed(0.5));
      const a = g.state.players.a!;
      a.realm = 2;
      a.tuViTotal = GAME_CONFIG.npcPower.truongLao + extra;
      expect(g.startChallenge('a', { role: 'truongLao' }, 0).ok).toBe(true);
      g.tick(GAME_CONFIG.assistWindowMs + GAME_CONFIG.assistGraceMs);
      expect(g.results[0]!.winner).toBe(winner);
    }
  });

  it('chỉ một trận một lúc; có hồi chiêu 5 phút cho người khiêu chiến', () => {
    const g = setup(fixed(0.5));
    g.state.players.a!.realm = 2;
    g.state.players.b!.realm = 2;
    expect(g.startChallenge('a', { role: 'truongLao' }, 0).ok).toBe(true);
    expect(g.startChallenge('b', { role: 'truongLao' }, 1)).toEqual({ ok: false, reason: 'busy' });
    g.tick(33_000);
    expect(g.startChallenge('a', { role: 'truongLao' }, 34_000)).toEqual({ ok: false, reason: 'cooldown' });
    expect(g.startChallenge('a', { role: 'truongLao' }, 5 * 60_000 + 1).ok).toBe(true);
  });

  it('Trợ Chiến: người xem chưa chọn phe thì quà không tính vào trận (mặc định cấu hình)', () => {
    const g = setup(fixed(0.5));
    join(g, 'c');
    g.state.players.a!.realm = 2;
    g.startChallenge('a', { role: 'truongLao' }, 0);
    g.handle(ev({ type: 'gift', playerId: 'c', diamonds: 10, at: 10_000 }));
    expect(g.state.pending!.assistA + g.state.pending!.assistB).toBe(0);
    expect(g.state.players.c!.tuViTotal).toBe(10 * GAME_CONFIG.tuViPerDiamond); // vẫn nhận Tu Vi
  });

  it('Trợ Chiến: chọn phe bằng !ung rồi tặng quà; đấu thủ tặng thì cộng cho chính mình', () => {
    const g = setup(fixed(0.5));
    join(g, 'c');
    join(g, 'd');
    g.state.players.a!.realm = 2;
    g.startChallenge('a', { role: 'truongLao' }, 0);
    g.handle(ev({ type: 'command', playerId: 'c', text: '!ung A', at: 5_000 }));
    g.handle(ev({ type: 'command', playerId: 'd', text: '!ung B', at: 5_000 }));
    g.handle(ev({ type: 'gift', playerId: 'c', diamonds: 10, at: 10_000 }));
    g.handle(ev({ type: 'gift', playerId: 'd', diamonds: 4, at: 11_000 }));
    g.handle(ev({ type: 'gift', playerId: 'a', diamonds: 5, at: 12_000 }));
    expect(g.state.pending!.assistA).toBe(15 * GAME_CONFIG.assistPowerPerDiamond);
    expect(g.state.pending!.assistB).toBe(4 * GAME_CONFIG.assistPowerPerDiamond);
  });

  it('Trợ Chiến: cấu hình assistDefaultSide=defender cho bên giữ chức khi chưa chọn (GAME_FLOW §11.1)', () => {
    const g = new Game(fixed(0.5), { ...GAME_CONFIG, assistDefaultSide: 'defender' });
    join(g, 'a');
    join(g, 'c');
    g.state.players.a!.realm = 2;
    g.startChallenge('a', { role: 'truongLao' }, 0);
    g.handle(ev({ type: 'gift', playerId: 'c', diamonds: 10, at: 10_000 }));
    expect(g.state.pending!.assistB).toBe(10 * GAME_CONFIG.assistPowerPerDiamond);
  });

  it('Trợ Chiến: quà đủ lớn cho phe thủ đảo ngược kết quả', () => {
    const g = setup(fixed(0.5));
    join(g, 'c');
    const a = g.state.players.a!;
    a.realm = 2;
    a.tuViTotal = GAME_CONFIG.npcPower.truongLao + 1; // hơn NPC 1 điểm → thắng nếu không ai trợ chiến
    g.startChallenge('a', { role: 'truongLao' }, 0);
    g.handle(ev({ type: 'command', playerId: 'c', text: '!ung B', at: 1_000 }));
    g.handle(ev({ type: 'gift', playerId: 'c', diamonds: 10, at: 2_000 })); // +300 cho phe thủ
    g.tick(33_000);
    expect(g.results[0]!.winner).toBe('defender');
  });

  it('ân hạn 3 giây: quà đến trễ vẫn tính, sau ân hạn thì không', () => {
    const g = setup(fixed(0.5));
    g.state.players.a!.realm = 2;
    g.startChallenge('a', { role: 'truongLao' }, 0);
    g.handle(ev({ type: 'command', playerId: 'b', text: '!ung B', at: 1_000 }));
    g.handle(ev({ type: 'gift', playerId: 'b', diamonds: 1, at: 32_000 })); // trễ 2 giây: vẫn tính
    expect(g.state.pending!.assistB).toBe(GAME_CONFIG.assistPowerPerDiamond);
    g.handle(ev({ type: 'gift', playerId: 'b', diamonds: 10, at: 33_000 }));
    expect(g.state.pending!.assistB).toBe(GAME_CONFIG.assistPowerPerDiamond); // không tăng thêm
  });

  it('thắng: nhậm ghế, được miễn khiêu chiến 2 phút; Tông Chủ → host thành Thái Thượng', () => {
    const g = setup(fixed(0.5));
    const a = g.state.players.a!;
    a.realm = 4;
    a.tuViTotal = 10_000_000;
    expect(g.state.hostSupreme).toBe(false);
    expect(g.startChallenge('a', { role: 'tongChu' }, 0).ok).toBe(true);
    g.tick(33_000);
    const seat = g.state.seats.find((s) => s.role === 'tongChu')!;
    expect(seat.holder).toBe('a');
    expect(g.state.hostSupreme).toBe(true);
    // b thử khiêu chiến Tông Chủ trong thời gian miễn
    const b = g.state.players.b!;
    b.realm = 4;
    expect(g.startChallenge('b', { role: 'tongChu' }, 60_000)).toEqual({ ok: false, reason: 'defender_immune' });
    expect(g.startChallenge('b', { role: 'tongChu' }, 33_000 + 2 * 60_000 + 1).ok).toBe(true);
  });

  it('dao động ±10% nằm trong khoảng cho phép', () => {
    const lo = new Game(fixed(0));
    const hi = new Game(fixed(0.999999));
    for (const [g, k] of [[lo, 0.9], [hi, 1.1]] as const) {
      join(g, 'a');
      join(g, 'b');
      for (const p of Object.values(g.state.players)) p.root = null;
      g.state.players.a!.realm = 1;
      g.state.players.a!.tuViTotal = 1000;
      g.state.players.b!.tuViTotal = 1000;
      g.startChallenge('a', { playerId: 'b' }, 0);
      g.tick(33_000);
      expect(g.results[0]!.challengerPower / 1000).toBeCloseTo(k, 3);
    }
  });

  it('lệnh bình luận !khieuchien được hiểu', () => {
    const g = setup(fixed(0.5));
    g.state.players.a!.realm = 2;
    g.handle(ev({ type: 'command', playerId: 'a', text: '!khieuchien Trưởng Lão', at: 0 }));
    expect(g.state.pending?.defenderRole).toBe('truongLao');
  });
});

describe('cơ duyên', () => {
    it('chỉ chọn người đang hiện diện, chia đều, không ưu tiên người tặng quà', () => {
    const g = new Game(seededRng(7));
    g.startSession(0);
    for (const id of ['a', 'b', 'c', 'd']) join(g, id, 0);
    g.state.players.d!.present = false; // vắng mặt
    g.handle(ev({ type: 'gift', playerId: 'a', diamonds: 100000, at: 1 })); // a tặng rất nhiều quà
    const hits: Record<string, number> = { a: 0, b: 0, c: 0, d: 0 };
    const N = 3000;
    let clock = 0;
    for (let i = 0; i < N; i++) {
      g.runFortune(0);
      clock += 10_000;
      for (const m of g.announcer.drain(clock)) {
        if (m.kind !== 'fortune') continue;
        const who = Object.keys(hits).find((id) => m.text.includes(`ký chủ ${id} `));
        if (who) hits[who]!++;
      }
    }
    expect(hits.d).toBe(0);
    for (const id of ['a', 'b', 'c']) expect(Math.abs(hits[id]! / N - 1 / 3)).toBeLessThan(0.04);
  });

  it('vật phẩm có trần Chiến Lực', () => {
    const g = new Game(fixed(0.999)); // luôn rơi vào loại cuối bảng (pháp bảo)
    join(g, 'a');
    const p = g.state.players.a!;
    p.root = 'tap';
    for (let i = 0; i < 100; i++) g.runFortune(i);
    expect(p.treasurePct).toBe(GAME_CONFIG.itemPctCap);
  });
});

describe('thông báo (GAME_FLOW §12)', () => {
  it('mỗi 3,5 giây chỉ đọc 1 câu, ưu tiên cao đi trước', () => {
    const a = new Announcer(3500, 12);
    a.push({ priority: 'low', kind: 'x', text: 'low', speak: true, at: 0 });
    a.push({ priority: 'high', kind: 'x', text: 'high', speak: true, at: 1 });
    expect(a.drain(10_000).map((x) => x.text)).toEqual(['high']);
    expect(a.drain(11_000)).toEqual([]);
    expect(a.drain(13_600).map((x) => x.text)).toEqual(['low']);
  });

  it('mục chỉ hiện chữ không bị giới hạn nhịp', () => {
    const a = new Announcer(3500, 12);
    for (let i = 0; i < 5; i++) a.push({ priority: 'textOnly', kind: 'm', text: `t${i}`, speak: false, at: i });
    expect(a.drain(0)).toHaveLength(5);
  });

  it('quá tải: bỏ mục thấp trước, không bao giờ bỏ mục ưu tiên cao', () => {
    const a = new Announcer(3500, 5);
    for (let i = 0; i < 5; i++) a.push({ priority: 'high', kind: 'h', text: `h${i}`, speak: true, at: i });
    for (let i = 0; i < 20; i++) a.push({ priority: 'low', kind: 'l', text: `l${i}`, speak: true, at: 100 + i });
    const all: string[] = [];
    for (let t = 0; t < 40; t++) all.push(...a.drain(t * 4000).map((x) => x.text));
    expect(all.filter((x) => x.startsWith('h'))).toHaveLength(5);
    expect(a.dropped).toBeGreaterThan(0);
  });
});

describe('lưu và khôi phục', () => {
  it('snapshot → restore cho cùng trạng thái', () => {
    const g = new Game(seededRng(3));
    g.startSession(0);
    join(g, 'a');
    g.handle(ev({ type: 'gift', playerId: 'a', diamonds: 50, at: 1 }));
    const g2 = Game.restore(g.snapshot(), seededRng(3));
    expect(g2.state).toEqual(g.state);
    // sự kiện đã xử lý vẫn bị chặn trùng sau khôi phục
    const last = g.state.seenEventIds.at(-1)!;
    expect(g2.handle({ id: last, type: 'gift', playerId: 'a', diamonds: 50, at: 2 })).toBe(false);
  });
});
