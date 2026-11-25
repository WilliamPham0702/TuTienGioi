import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAnalyzer, paths, verdict } from './analyze.mjs';

test('paths chỉ trả tên khóa, không có giá trị', () => {
  const p = [...paths({ user: { userId: 'SECRET', nickname: 'Tên' }, comment: 'xin chào' })];
  assert.ok(p.includes('user.userId') && p.includes('comment'));
  assert.ok(!JSON.stringify(p).includes('SECRET') && !JSON.stringify(p).includes('Tên'));
});

test('báo cáo không chứa ID gốc, tên hay nội dung bình luận', () => {
  const a = createAnalyzer();
  a.record('chat', { user: { userId: '987654321', nickname: 'Nguyễn Văn A' }, comment: 'đi chợ bí mật' });
  a.record('gift', { user: { userId: '987654321' }, giftId: 1, diamondCount: 5, repeatCount: 3 });
  const s = JSON.stringify(a.report());
  for (const secret of ['987654321', 'Nguyễn Văn A', 'bí mật']) assert.ok(!s.includes(secret), secret);
});

test('cùng một người ở nhiều loại sự kiện được tính là 1 người; ID rỗng/0 bị đánh dấu che', () => {
  const a = createAnalyzer();
  a.record('chat', { user: { userId: 'u1' }, comment: '!khieuchien Trưởng Lão' });
  a.record('like', { user: { userId: 'u1' }, likeCount: 2 });
  a.record('like', { user: { userId: '0' }, likeCount: 1 });
  const r = a.report();
  assert.equal(r.distinctViewersAllTypes, 1);
  assert.equal(r.perType.like.maskedUserId, 1);
  assert.equal(r.chats.bang, 1);
  assert.equal(r.chats.diacritics, 1);
});

test('đếm quà theo kim cương × số lần lặp, chuỗi combo, tim, người xem', () => {
  const a = createAnalyzer();
  a.record('gift', { user: { userId: 'x' }, giftId: 7, diamondCount: 10, repeatCount: 3, repeatEnd: true });
  a.record('like', { user: { userId: 'x' }, likeCount: 4, totalLikeCount: 100 });
  a.record('roomUser', { viewerCount: 55 });
  const r = a.report();
  assert.equal(r.gifts.diamondSum, 30);
  assert.equal(r.gifts.repeatEnd, 1);
  assert.equal(r.likes.countSum, 4);
  assert.equal(r.room.maxViewers, 55);
  assert.match(verdict(r), /T1 Hiện diện/);
});

test('lệnh --dry-run chạy được trọn đường ống', async () => {
  const { execFileSync } = await import('node:child_process');
  const out = execFileSync(process.execPath, ['probe.mjs', '--dry-run', '--out', '/tmp/probe-dry'], { encoding: 'utf8' });
  assert.match(out, /DỮ LIỆU GIẢ LẬP/);
});
