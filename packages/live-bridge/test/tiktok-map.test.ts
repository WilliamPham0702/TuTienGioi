import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Game, seededRng } from '../../core/src/index.ts';
import { TikTokMapper } from '../src/tiktok-map.ts';

// Dữ liệu GIẢ theo hình dạng kiểu của tiktok-live-connector 2.4.x. Chưa đối chiếu với TikTok thật.
const user = (id: string, nickname = `Người ${id}`) => ({ id, nickname, displayId: `nguoi_${id}` });
const common = (msgId: string) => ({ msgId, createTime: '0' });

test('người lạ bình luận lần đầu: sinh join rồi lệnh; lần sau là heartbeat', () => {
  const m = new TikTokMapper();
  const a = m.map('chat', { common: common('1'), user: user('42'), content: '!ung A' }, 1000);
  assert.deepEqual(a.map((e) => e.type), ['join', 'command']);
  assert.equal(a[0]!.type === 'join' && a[0]!.name, 'Người 42');
  const b = m.map('chat', { common: common('2'), user: user('42'), content: 'xin chào' }, 2000);
  assert.deepEqual(b.map((e) => e.type), ['heartbeat']);
});

test('lệnh giữ nguyên dấu tiếng Việt và được chuẩn hóa NFC', () => {
  const m = new TikTokMapper();
  const decomposed = '!khieuchien trưởng lão'.normalize('NFD');
  const out = m.map('chat', { common: common('3'), user: user('7'), content: `  ${decomposed} ` }, 0);
  const cmd = out.find((e) => e.type === 'command');
  assert.ok(cmd && cmd.type === 'command');
  assert.equal(cmd.text, '!khieuchien trưởng lão'.normalize('NFC'));
});

test('quà combo chỉ tính khi kết thúc chuỗi, tổng = kim cương × repeatCount', () => {
  const m = new TikTokMapper();
  const g = (msgId: string, repeatCount: number, repeatEnd: number) => ({
    common: common(msgId),
    user: user('9'),
    gift: { id: '5655', type: 1, diamondCount: 1, name: 'Rose' },
    repeatCount,
    repeatEnd,
  });
  const mid = [...m.map('gift', g('10', 1, 0), 0), ...m.map('gift', g('11', 2, 0), 0), ...m.map('gift', g('12', 3, 0), 0)];
  assert.equal(mid.filter((e) => e.type === 'gift').length, 0);
  const end = m.map('gift', g('13', 3, 1), 0);
  const gift = end.find((e) => e.type === 'gift');
  assert.ok(gift && gift.type === 'gift');
  assert.equal(gift.diamonds, 3);
});

test('quà không combo tính ngay', () => {
  const m = new TikTokMapper();
  const out = m.map('gift', { common: common('20'), user: user('9'), gift: { type: 2, diamondCount: 99 }, repeatCount: 1, repeatEnd: 0 }, 0);
  const gift = out.find((e) => e.type === 'gift');
  assert.ok(gift && gift.type === 'gift');
  assert.equal(gift.diamonds, 99);
});

test('thiếu ID người gửi: bỏ sự kiện, đếm vào skipped, không ném lỗi', () => {
  const m = new TikTokMapper();
  assert.deepEqual(m.map('like', { count: 5, user: {} }, 0), []);
  assert.deepEqual(m.map('chat', { content: '!ung A' }, 0), []);
  assert.deepEqual(m.map('like', { count: 0, user: user('1') }, 0), []);
  assert.equal(m.skipped, 3);
  assert.deepEqual(m.map('roomUser', { viewerCount: 10 }, 0), []);
});

test('cùng msgId gửi lại (sau khi nối lại) bị lõi bỏ qua, không cộng trùng', () => {
  const m = new TikTokMapper();
  const game = new Game(seededRng(1));
  game.startSession(0);
  const like = { common: common('30'), user: user('5'), count: 10 };
  for (const e of m.map('like', like, 0)) game.handle(e);
  const after1 = game.state.players['tt:5']!.tuViTotal;
  for (const e of m.map('like', like, 0)) game.handle(e);
  assert.equal(game.state.players['tt:5']!.tuViTotal, after1);
});

test('sự kiện đi qua lõi: tim cộng Tu Vi, quà cộng Cúng Phụng', () => {
  const m = new TikTokMapper();
  const game = new Game(seededRng(2));
  game.startSession(0);
  for (const e of m.map('like', { common: common('40'), user: user('8', 'Lan'), count: 20 }, 0)) game.handle(e);
  for (const e of m.map('gift', { common: common('41'), user: user('8', 'Lan'), gift: { type: 2, diamondCount: 30 } }, 10)) game.handle(e);
  const p = game.state.players['tt:8']!;
  assert.equal(p.name, 'Lan');
  assert.ok(p.tuViTotal > 0);
  assert.equal(p.sessionGiftDiamonds, 30);
});
