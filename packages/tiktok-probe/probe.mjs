#!/usr/bin/env node
// PoC-3 TikTok — thăm dò CHỈ ĐỌC. Không đăng nhập, không cookie, không gửi tin nhắn.
// Dùng:  node probe.mjs <tên_tài_khoản_đang_LIVE> [--minutes 30] [--out thư_mục] [--dry-run]
// Khóa Euler (không bắt buộc, chỉ để nâng giới hạn): đặt biến môi trường EULER_API_KEY. Không truyền qua tham số.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createAnalyzer, verdict } from './analyze.mjs';

const args = process.argv.slice(2);
const flag = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const dry = args.includes('--dry-run');
const user = args.find((a) => !a.startsWith('--') && a !== flag('--minutes') && a !== flag('--out'));
const minutes = Number(flag('--minutes', '30'));
const outDir = flag('--out', `probe-out-${new Date().toISOString().replace(/[:.]/g, '-')}`);
if (!dry && !user) {
  console.error('Thiếu tên tài khoản đang LIVE.  Ví dụ: node probe.mjs ten_tai_khoan --minutes 30');
  process.exit(2);
}

const an = createAnalyzer();
mkdirSync(outDir, { recursive: true });
let finished = false;

function finish(code = 0) {
  if (finished) return;
  finished = true;
  const rep = an.report();
  rep.simulated = dry;
  const text = verdict(rep);
  writeFileSync(join(outDir, 'report.json'), JSON.stringify(rep, null, 2));
  writeFileSync(join(outDir, 'report.txt'), (dry ? '*** DỮ LIỆU GIẢ LẬP — không phản ánh TikTok ***\n' : '') + text + '\n');
  console.log('\n' + (dry ? '*** DỮ LIỆU GIẢ LẬP ***\n' : '') + text + `\n\nĐã ghi: ${outDir}/report.json và report.txt`);
  process.exit(code);
}
process.on('SIGINT', () => finish(0));

if (dry) {
  // Kiểm tra đường ống end-to-end không cần mạng
  const sim = [
    ['member', { user: { userId: '1' } }], ['chat', { user: { userId: '1' }, comment: 'đi chợ' }],
    ['like', { user: { userId: '2' }, likeCount: 3, totalLikeCount: 10 }],
    ['gift', { user: { userId: '2' }, giftId: 5, diamondCount: 1, repeatCount: 2, repeatEnd: true }],
    ['roomUser', { viewerCount: 12 }],
  ];
  for (const [t, p] of sim) an.record(t, p);
  an.connection('connected');
  finish(0);
} else {
  const { TikTokLiveConnection, WebcastEvent, ControlEvent } = await import('tiktok-live-connector');
  const key = process.env.EULER_API_KEY;
  const conn = new TikTokLiveConnection(user, key ? { signApiKey: key } : {});
  // Lắng nghe MỌI loại sự kiện để biết game thực sự nhận được gì
  for (const type of Object.values(WebcastEvent)) conn.on(type, (p) => an.record(String(type), p));
  conn.on(ControlEvent.CONNECTED, () => (an.connection('connected'), console.log('Đã kết nối.')));
  conn.on(ControlEvent.DISCONNECTED, () => (an.connection('disconnected'), console.log('Rớt kết nối.')));
  conn.on(ControlEvent.ERROR, (e) => (an.connection('error', e), console.log('Lỗi:', e?.name ?? e?.message ?? e)));
  try {
    await conn.connect();
  } catch (e) {
    an.connection('error', e);
    console.error('Không kết nối được:', e?.name ?? e?.message ?? e);
    finish(1);
  }
  console.log(`Đang đo ${minutes} phút (Ctrl+C để dừng sớm)...`);
  setTimeout(() => finish(0), minutes * 60_000);
}
