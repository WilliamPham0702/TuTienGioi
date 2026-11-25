import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Bridge } from './bridge.ts';
import { simSource, tiktokSource, type Source } from './sources.ts';

const HELP = `Cách dùng:
  Thử bằng dữ liệu giả:   npm run sim
  Đọc LIVE TikTok:        npm start -- --source tiktok --user ten_tai_khoan

Tùy chọn:
  --source sim|tiktok     Nguồn sự kiện (mặc định sim)
  --user TEN              Tên tài khoản TikTok đang LIVE, không có @ (bắt buộc với tiktok)
  --port 8787             Cổng màn hình (mặc định 8787)
  --db data/game.sqlite   File lưu dữ liệu (mặc định data/game.sqlite; "none" = không lưu)
  --tiep-tuc              Chạy tiếp phiên LIVE đang dở sau khi tắt đột ngột (không mở phiên mới)
  --speed 1               Tốc độ phát dữ liệu mô phỏng
  --players 40            Số người xem giả trong mô phỏng
`;

const args = process.argv.slice(2);
const flag = (n: string, d?: string) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
if (args.includes('--help') || args.includes('-h')) {
  console.log(HELP);
  process.exit(0);
}

const here = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(here, '..');
const source = flag('--source', 'sim')!;
const user = flag('--user')?.replace(/^@/, '');
const port = Number(flag('--port', '8787'));
const dbArg = flag('--db', join(pkg, 'data', 'game.sqlite'))!;
const dbPath = dbArg === 'none' ? undefined : resolve(dbArg);

if (source === 'tiktok' && !user) {
  console.error('Thiếu tên tài khoản. Ví dụ: npm start -- --source tiktok --user ten_tai_khoan\n');
  console.log(HELP);
  process.exit(2);
}
if (dbPath) mkdirSync(dirname(dbPath), { recursive: true });

const bridge = new Bridge({ publicDir: join(pkg, 'public'), dbPath, port, resume: args.includes('--tiep-tuc') });
const actualPort = await bridge.start();
console.log(`
Màn hình OBS (Browser Source, 1080 x 1920):  http://127.0.0.1:${actualPort}/
Trang operator (mở bằng trình duyệt):        http://127.0.0.1:${actualPort}/operator
Dữ liệu lưu tại: ${dbPath ?? '(không lưu)'}
Bấm Ctrl + C để dừng (dữ liệu được lưu trước khi thoát).
`);

let src: Source;
if (source === 'tiktok') src = await tiktokSource(bridge, user!);
else src = simSource(bridge, { speed: Number(flag('--speed', '1')), players: Number(flag('--players', '40')) });

let stopping = false;
const shutdown = async () => {
  if (stopping) return;
  stopping = true;
  console.log('\nĐang lưu và thoát...');
  await src.stop();
  await bridge.stop();
  console.log('Đã lưu. Tạm biệt.');
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
