// Chạy thử bảng điều khiển với người chơi GIẢ (không nối TikTok).
//   cd packages/core && npm run dashboard
// Mở địa chỉ in ra, dán mã truy cập. Ctrl+C để tắt. Nhật ký lưu ở file demo-audit.db cạnh thư mục này.
import { join } from 'node:path';
import { Game, Operator, SqliteAuditLog, seededRng, startDashboard } from '../src/index.ts';

const names = ['Long', 'Hà My', 'Đức Minh', 'Thanh Trúc', 'dit me may', 'Phúc Lộc', 'zalo 0912345678', 'Bé Dâu', 'Cường 2005', 'Anna'];
const rng = seededRng(Date.now() >>> 0);
const game = new Game(rng);
const start = Date.now();
game.startSession(start);
let seq = 0;
for (let i = 0; i < 40; i++) {
  const id = `demo${i}`;
  game.handle({ id: `j${seq++}`, type: 'join', playerId: id, name: `${names[i % names.length]}${i >= names.length ? ' ' + i : ''}`, at: start });
}

const audit = new SqliteAuditLog(join(import.meta.dirname, '..', 'demo-audit.db'));
const operator = new Operator(game, audit);
const d = await startDashboard({ operator, actor: 'chu-live' });
console.log(`\nBảng điều khiển: ${d.url}\nMã truy cập:     ${d.token}\n(Ctrl+C để tắt)\n`);

setInterval(() => {
  const now = Date.now();
  for (const p of Object.values(game.state.players)) {
    if (rng.next() < 0.9) game.handle({ id: `h${seq++}`, type: 'heartbeat', playerId: p.id, at: now });
    if (rng.next() < 0.05) game.handle({ id: `l${seq++}`, type: 'like', playerId: p.id, count: 5, at: now });
    if (rng.next() < 0.003) game.handle({ id: `g${seq++}`, type: 'gift', playerId: p.id, diamonds: 10, at: now });
  }
  game.tick(now);
  game.announcer.drain(now);
}, 1000);
