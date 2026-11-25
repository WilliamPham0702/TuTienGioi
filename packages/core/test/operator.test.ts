import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterAll, describe, expect, it } from 'vitest';
import {
  GAME_CONFIG,
  Game,
  MemoryAuditLog,
  NameFilter,
  Operator,
  SqliteAuditLog,
  aliasFor,
  applyTuning,
  seededRng,
  startDashboard,
  validateTuning,
} from '../src/index.ts';

let n = 0;
const join_ = (g: Game, pid: string, name: string, at = 0) => g.handle({ id: `o${++n}`, type: 'join', playerId: pid, name, at });

// ---------------------------------------------------------------- bộ lọc tên
describe('Bộ lọc tên', () => {
  const f = new NameFilter();
  const blocked = [
    'Địt mẹ mày',
    'dit me',
    'D.I.T M.E',
    'đụ má',
    'ditmemay123',
    'vcl',
    'Thằng VCL',
    'con chó',
    'óc chó',
    'concac',
    'fuuuuck you',
    'f u c k',
    'Sh1t',
    'b1tch',
    'cái lồn',
    'loz',
    'dmm',
    'Hitler',
    'lon',
    'cứt',
    'Cặc',
  ];
  const spam = ['zalo 0912345678', 'xem tai abc.com', 'https://x.y', 'ib 0987 654 321', 'kết bạn telegram'];
  const fine = [
    'Long',
    'Nguyễn Văn Long',
    'Lớn Lên',
    'Đức Minh',
    'Dư Thanh',
    'Đỗ Phở',
    'Cù Lao',
    'Đi chợ Tết',
    'Chợ Lớn',
    'Con Chồn',
    'Cường 2005',
    'Mèo Ú 🐱',
    'Anna',
    'Phúc Lộc',
    'Bé Dâu',
    'Thanh Trúc',
    'Hà My',
    'Cúc',
    'Các Bạn',
    'Lớn',
  ];

  it.each(blocked)('chặn: %s', (s) => expect(f.check(s)).toMatchObject({ ok: false, reason: 'blocked' }));
  it.each(spam)('chặn quảng cáo: %s', (s) => expect(f.check(s)).toMatchObject({ ok: false, reason: 'spam' }));
  it.each(fine)('không bắt nhầm: %s', (s) => expect(f.check(s)).toEqual({ ok: true }));

  it('tên bị chặn → bí danh ổn định, không lộ tên gốc', () => {
    expect(f.display('u1', 'dit me')).toBe(aliasFor('u1'));
    expect(aliasFor('u1')).toMatch(/^Đạo hữu #\d{4}$/);
    expect(aliasFor('u1')).toBe(aliasFor('u1'));
    expect(f.display('u1', '   ')).toBe(aliasFor('u1'));
  });

  it('bỏ ký tự điều khiển / đảo chiều, cắt tên dài', () => {
    expect(f.display('u2', 'Ha‮M​y')).toBe('HaMy');
    expect([...f.display('u3', 'A'.repeat(50))].length).toBe(f.maxLength);
  });

  it('thêm/bớt từ chặn lúc chạy', () => {
    const g = new NameFilter();
    expect(g.check('Bánh Bao').ok).toBe(true);
    g.addWord('bao');
    expect(g.check('Bánh Bao').ok).toBe(false);
    expect(g.removeWord('bao')).toBe(true);
    expect(g.check('Bánh Bao').ok).toBe(true);
    g.addWord('xau xa'); // dài → chặn cả khi dính liền
    expect(g.check('Thằng Xấu Xa').ok).toBe(false);
    expect(g.check('xauxa99').ok).toBe(false);
  });
});

describe('Game dùng bộ lọc tên', () => {
  it('thông báo đo linh căn dùng bí danh, không đọc tên xấu', () => {
    const g = new Game(seededRng(1));
    g.startSession(0);
    join_(g, 'bad', 'đụ má mày');
    const p = g.state.players.bad!;
    expect(p.rawName).toBe('đụ má mày');
    expect(p.name).toBe(aliasFor('bad'));
    const texts = g.announcer.drain(10_000).map((a) => a.text).join('\n');
    expect(texts).toContain(aliasFor('bad'));
    expect(texts).not.toMatch(/đụ/);
  });

  it('ẩn/duyệt tên thủ công, áp lại sau khi đổi từ chặn', () => {
    const g = new Game(seededRng(1));
    g.startSession(0);
    join_(g, 'a', 'Long');
    g.setNameHidden('a', true);
    expect(g.state.players.a!.name).toBe(aliasFor('a'));
    g.setNameHidden('a', false);
    expect(g.state.players.a!.name).toBe('Long');
    g.nameFilter.addWord('long');
    expect(g.refreshNames()).toBe(1);
    expect(g.state.players.a!.name).toBe(aliasFor('a'));
    g.setNameApproved('a', true);
    expect(g.state.players.a!.name).toBe('Long');
  });
});

// ---------------------------------------------------------------- nhật ký kiểm toán
describe('Nhật ký kiểm toán', () => {
  const dir = mkdtempSync(join(tmpdir(), 'audit-'));
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('SQLite: chỉ ghi thêm, đọc lại sau khi mở lại file, phát hiện sửa tay', () => {
    const path = join(dir, 'a.db');
    const a = new SqliteAuditLog(path);
    a.append({ at: 1, actor: 'op', action: 'pause', detail: {}, ok: true });
    a.append({ at: 2, actor: 'op', action: 'hideName', detail: { playerId: 'x' }, ok: true });
    a.close();
    const b = new SqliteAuditLog(path);
    expect(b.recent().map((r) => r.action)).toEqual(['hideName', 'pause']);
    expect(b.verify()).toBeNull();
    b.append({ at: 3, actor: 'op', action: 'resume', detail: {}, ok: true });
    b.close();
    // sửa tay dòng 2
    const db = new DatabaseSync(path);
    db.prepare("UPDATE audit SET detail = '{\"playerId\":\"y\"}' WHERE seq = 2").run();
    db.close();
    const c = new SqliteAuditLog(path);
    expect(c.verify()).toBe(2);
    c.close();
  });

  it('xóa một dòng giữa chuỗi cũng bị phát hiện', () => {
    const m = new MemoryAuditLog();
    for (let i = 0; i < 4; i++) m.append({ at: i, actor: 'op', action: 'a' + i, detail: {}, ok: true });
    m.rows.splice(1, 1);
    expect(m.verify()).toBe(3);
  });
});

// ---------------------------------------------------------------- lệnh vận hành
describe('Operator', () => {
  const mk = () => {
    const g = new Game(seededRng(2));
    g.startSession(0);
    join_(g, 'a', 'Long');
    join_(g, 'b', 'dit me');
    return new Operator(g, new MemoryAuditLog());
  };

  it('mọi lệnh đều ghi nhật ký, kể cả lệnh bị từ chối', () => {
    const op = mk();
    expect(op.run('op', 'pause', {}, 10).ok).toBe(true);
    expect(op.game.state.paused).toBe(true);
    const again = op.run('op', 'pause', {}, 11);
    expect(again.ok).toBe(false);
    expect(op.run('op', 'xoaHet', {}, 12).error).toBe('lệnh không hỗ trợ');
    expect(op.run('op', 'hideName', { playerId: 'zzz' }, 13).ok).toBe(false);
    expect(op.run('op', 'resume', {}, 14).ok).toBe(true);
    const log = op.audit.recent();
    expect(log.map((r) => [r.action, r.ok])).toEqual([
      ['resume', true],
      ['hideName', false],
      ['xoaHet', false],
      ['pause', false],
      ['pause', true],
    ]);
    expect(op.audit.verify()).toBeNull();
  });

  it('ẩn tên ghi lại tên trước/sau; không ghi token vào nhật ký', () => {
    const op = mk();
    const r = op.run('op', 'hideName', { playerId: 'a', token: 'secret' }, 1);
    expect(r.audit.detail).toMatchObject({ playerId: 'a', before: 'Long', after: aliasFor('a') });
    expect(JSON.stringify(r.audit)).not.toContain('secret');
  });

  it('thêm từ chặn đổi tên người đang có', () => {
    const op = mk();
    const r = op.run('op', 'addBlockedWord', { word: 'Long' }, 1);
    expect(r.ok).toBe(true);
    expect(r.result).toBe(1);
    expect(op.game.state.players.a!.name).toBe(aliasFor('a'));
    expect(op.run('op', 'addBlockedWord', { word: 'x'.repeat(41) }, 2).ok).toBe(false);
  });

  it('status: liệt kê tên bị lọc kèm tên gốc cho người vận hành', () => {
    const op = mk();
    const s = op.status(5);
    expect(s.players).toEqual({ total: 2, present: 2 });
    expect(s.flaggedNames).toEqual([{ id: 'b', name: aliasFor('b'), rawName: 'dit me', hidden: false, approved: false }]);
    expect(s.auditIntact).toBe(true);
  });
});

// ---------------------------------------------------------------- bảng điều khiển (HTTP thật trên 127.0.0.1)
describe('Bảng điều khiển', () => {
  it('cần mã truy cập; lệnh qua HTTP đi vào game và nhật ký', async () => {
    const g = new Game(seededRng(3));
    g.startSession(0);
    join_(g, 'a', 'Long');
    const op = new Operator(g, new MemoryAuditLog());
    const d = await startDashboard({ operator: op, token: 'tok123', port: 0, now: () => 1000, actor: 'chu-live' });
    try {
      const page = await fetch(d.url);
      expect(page.status).toBe(200);
      expect(await page.text()).toContain('Bảng điều khiển vận hành');

      expect((await fetch(d.url + 'api/status')).status).toBe(401);
      expect((await fetch(d.url + 'api/status', { headers: { 'x-operator-token': 'sai' } })).status).toBe(401);

      const h = { 'x-operator-token': 'tok123', 'content-type': 'application/json' };
      const st = await (await fetch(d.url + 'api/status', { headers: h })).json();
      expect(st.paused).toBe(false);

      const r = await fetch(d.url + 'api/action', { method: 'POST', headers: h, body: JSON.stringify({ action: 'pause' }) });
      expect(r.status).toBe(200);
      expect(g.state.paused).toBe(true);
      expect(op.audit.recent(1)[0]).toMatchObject({ actor: 'chu-live', action: 'pause', ok: true, at: 1000 });

      expect((await fetch(d.url + 'api/action', { method: 'POST', headers: h, body: JSON.stringify({ action: 'pause' }) })).status).toBe(409);
      expect((await fetch(d.url + 'api/action', { method: 'POST', headers: h, body: JSON.stringify({ action: 'boom' }) })).status).toBe(400);
      expect((await fetch(d.url + 'api/action', { method: 'POST', headers: h, body: '{not json' })).status).toBe(400);
      const big = await fetch(d.url + 'api/action', { method: 'POST', headers: h, body: JSON.stringify({ action: 'pause', args: { x: 'a'.repeat(10_000) } }) }).catch(() => null);
      expect(big === null || big.status === 413).toBe(true);

      const players = await (await fetch(d.url + 'api/players?q=lon', { headers: h })).json();
      expect(players.map((p: { id: string }) => p.id)).toEqual(['a']);
    } finally {
      await d.close();
    }
  });

  it('chỉ nghe ở 127.0.0.1', async () => {
    const op = new Operator(new Game(seededRng(4)), new MemoryAuditLog());
    const d = await startDashboard({ operator: op, port: 0 });
    try {
      expect(d.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/$/);
      expect(d.token.length).toBeGreaterThanOrEqual(12);
    } finally {
      await d.close();
    }
  });
});

// ---------------------------------------------------------------- công cụ GM: kiểm tra & áp số
describe('Chỉnh tỉ lệ (GM)', () => {
  it('nhân toàn bộ Tu Vi lên cấp, trả danh sách thay đổi, không sửa cấu hình gốc', () => {
    const r = applyTuning(GAME_CONFIG, { realmScale: 0.5 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.config.realms[0]!.perMinor).toBe(150);
    expect(r.config.realms.at(-1)!.perMinor).toBe(0); // Chân Tiên giữ nguyên
    expect(GAME_CONFIG.realms[0]!.perMinor).toBe(300);
    expect(r.changes).toHaveLength(9);
    expect(r.changes[0]).toEqual({ key: 'realms.Luyện Khí.perMinor', from: 300, to: 150 });
  });

  it('từ chối số ngoài giới hạn và số làm hỏng thứ tự cảnh giới', () => {
    expect(validateTuning(GAME_CONFIG, { realmScale: 50 })).toHaveLength(1);
    expect(validateTuning(GAME_CONFIG, { tuViPerDiamond: -1 })).toHaveLength(1);
    expect(validateTuning(GAME_CONFIG, { realms: [{ index: 9, perMinor: 5 }] })[0]).toMatch(/không tồn tại/);
    expect(validateTuning(GAME_CONFIG, { realms: [{ index: 1, perMinor: 200 }] })[0]).toMatch(/Trúc Cơ phải tốn nhiều Tu Vi hơn Luyện Khí/);
    expect(validateTuning(GAME_CONFIG, { realms: [{ index: 2, breakChance: 0.99 }] })[0]).toMatch(/Tỉ lệ đột phá Kim Đan/);
    expect(validateTuning(GAME_CONFIG, { fortuneIntervalMin: [10, 5] })).toHaveLength(1);
    expect(applyTuning(GAME_CONFIG, { realmScale: 50 }).ok).toBe(false);
  });

  it('tỉ lệ linh căn phải cộng đủ 100%', () => {
    expect(validateTuning(GAME_CONFIG, { rootChances: { tap: 0.5 } })[0]).toMatch(/100%/);
    const ok = applyTuning(GAME_CONFIG, { rootChances: { tap: 0.3, tu: 0.35 } });
    expect(ok.ok).toBe(true);
  });

  it('cấu hình mới dùng được ngay cho phiên mới', () => {
    const r = applyTuning(GAME_CONFIG, { realmScale: 0.5, baseTuViPerSec: 2 });
    if (!r.ok) throw new Error(r.errors.join());
    const g = new Game(seededRng(5), r.config);
    g.startSession(0);
    join_(g, 'a', 'Long');
    g.state.players.a!.root = 'tap';
    for (let t = 1000; t <= 75_000; t += 1000) {
      g.handle({ id: `hb${t}`, type: 'heartbeat', playerId: 'a', at: t });
      g.tick(t);
    }
    // 75 giây × 2 Tu Vi = 150 = đủ 1 tiểu cảnh Luyện Khí mới (150)
    expect(g.state.players.a!.minor).toBe(1);
  });
});
