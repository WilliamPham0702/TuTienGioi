import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { Game, Store, burst, run, scenario, seededRng, type GameState } from '../src/index.ts';

const dir = mkdtempSync(join(tmpdir(), 'ttg-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));
let n = 0;
const dbPath = () => join(dir, `t${n++}.db`);

const END = 20 * 60_000;
const events = scenario({ seed: 3, players: 150, minutes: 20, giftChancePerMin: 0.05 });

function fresh(store?: Store) {
  const rng = seededRng(99);
  const game = new Game(rng);
  game.startSession(0);
  store?.commit(game.state, 0, rng.getState());
  return { rng, game };
}

describe('lưu SQLite và khôi phục sau khi tắt đột ngột', () => {
  it('chạy xong rồi mở lại: trạng thái y hệt', () => {
    const path = dbPath();
    const s1 = new Store(path);
    const { game, rng } = fresh(s1);
    run(game, events, { endAt: END, store: s1, rng });
    const expected = JSON.stringify(game.state);
    s1.close();

    const s2 = new Store(path);
    const loaded = s2.load()!;
    expect(JSON.stringify(loaded.state)).toBe(expected);
    s2.close();
  });

  const CRASH_POINTS = Array.from({ length: 20 }, (_, k) => 30 + Math.floor((k * (events.length - 60)) / 19));
  for (const crashAt of CRASH_POINTS) {
    it(`tắt đột ngột ở sự kiện #${crashAt} rồi chạy tiếp ra kết quả giống hệt chưa từng tắt`, () => {
      // Chạy liền một mạch (đối chứng)
      const sA = new Store(dbPath());
      const a = fresh(sA);
      run(a.game, events, { endAt: END, store: sA, rng: a.rng });
      const expected = JSON.stringify(a.game.state);
      sA.close();

      // Chạy đến lúc "mất điện"
      const pathB = dbPath();
      const sB = new Store(pathB);
      const b = fresh(sB);
      const r = run(b.game, events, { endAt: END, store: sB, rng: b.rng, crashAtOffset: crashAt });
      expect(r.crashed).toBe(true);
      sB.close(); // bỏ hết bộ nhớ; chỉ còn file

      // Mở lại, khôi phục, chạy tiếp
      const sC = new Store(pathB);
      const loaded = sC.load()!;
      expect(loaded.offset).toBeLessThanOrEqual(crashAt); // không bao giờ "nhảy cóc" qua sự kiện chưa xử lý
      const rng = seededRng(0);
      rng.setState(loaded.rngState!);
      const game = new Game(rng, undefined, loaded.state);
      run(game, events, { endAt: END, store: sC, rng, startOffset: loaded.offset });
      expect(JSON.stringify(game.state)).toBe(expected);
      sC.close();
    });
  }

  it('khôi phục không làm mất Tu Vi: tổng Tu Vi sau khôi phục ≥ lúc commit cuối', () => {
    const path = dbPath();
    const s = new Store(path);
    const { game, rng } = fresh(s);
    run(game, events, { endAt: 10 * 60_000, store: s, rng });
    const before = Object.values(game.state.players).reduce((x, p) => x + p.tuViTotal, 0);
    s.close();
    const s2 = new Store(path);
    const after = Object.values(s2.load()!.state.players).reduce((x, p) => x + p.tuViTotal, 0);
    expect(after).toBe(before);
    s2.close();
  });

  it('nguồn gửi lại 300 sự kiện cuối sau khi nối lại: bị bỏ qua, không cộng trùng', () => {
    const path = dbPath();
    const s = new Store(path);
    const { game, rng } = fresh(s);
    const cut = Math.floor(events.length / 2);
    run(game, events.slice(0, cut), { endAt: events[cut - 1]!.at, store: s, rng });
    const snap = JSON.stringify(game.state.players);
    let accepted = 0;
    for (const e of events.slice(cut - 300, cut)) if (game.handle(e)) accepted++;
    expect(accepted).toBe(0);
    expect(JSON.stringify(game.state.players)).toBe(snap);
    s.close();
  });

  it('chỉ ghi lại người chơi có thay đổi', () => {
    const s = new Store(dbPath());
    const { game, rng } = fresh(s);
    game.handle({ id: 'x1', type: 'join', playerId: 'a', name: 'A', at: 1 });
    game.handle({ id: 'x2', type: 'join', playerId: 'b', name: 'B', at: 1 });
    expect(s.commit(game.state, 0, rng.getState())).toBe(2);
    expect(s.commit(game.state, 0, rng.getState())).toBe(0);
    game.handle({ id: 'x3', type: 'like', playerId: 'a', count: 3, at: 2 });
    expect(s.commit(game.state, 0, rng.getState())).toBe(1);
    s.close();
  });

  it('sao lưu nóng ra file khác mở được và giống bản gốc', () => {
    const path = dbPath();
    const s = new Store(path);
    const { game, rng } = fresh(s);
    run(game, events, { endAt: 5 * 60_000, store: s, rng });
    const bak = join(dir, 'backup.db');
    s.backup(bak);
    const b = new Store(bak);
    expect(JSON.stringify(b.load()!.state)).toBe(JSON.stringify(s.load()!.state));
    b.close();
    s.close();
  });
});

describe('sự kiện dồn dập (mô phỏng)', () => {
  it('500 sự kiện/giây trong 60 giây: không lỗi, không mất quà, lưu được', () => {
    const ev = burst(300, 500, 60);
    const giftDiamonds = ev.reduce((x, e) => x + (e.type === 'gift' ? e.diamonds : 0), 0);
    const s = new Store(dbPath());
    const rng = seededRng(1);
    const game = new Game(rng);
    game.startSession(0);
    const t0 = performance.now();
    run(game, ev, { endAt: 62_000, store: s, rng });
    const ms = performance.now() - t0;
    console.log(`burst: ${ev.length} sự kiện xử lý trong ${ms.toFixed(0)} ms (máy cloud)`);

    const state: GameState = s.load()!.state;
    expect(Object.keys(state.players)).toHaveLength(300);
    // quà không mất: tổng kim cương quy ra Tu Vi nằm trong tổng Tu Vi của mọi người
    const total = Object.values(state.players).reduce((x, p) => x + p.tuViTotal, 0);
    expect(total).toBeGreaterThanOrEqual(giftDiamonds * 20);
    s.close();
  });
});
