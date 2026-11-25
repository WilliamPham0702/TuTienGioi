import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Bridge } from '../src/bridge.ts';
import { simSource } from '../src/sources.ts';

const pub = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');

function nextMessage(ws: WebSocket, pred: (m: any) => boolean, ms = 5000): Promise<any> {
  return new Promise((res, rej) => {
    const to = setTimeout(() => rej(new Error('hết thời gian chờ tin nhắn')), ms);
    const h = (ev: MessageEvent) => {
      const m = JSON.parse(String(ev.data));
      if (pred(m)) {
        clearTimeout(to);
        ws.removeEventListener('message', h);
        res(m);
      }
    };
    ws.addEventListener('message', h);
  });
}

function open(url: string): Promise<WebSocket> {
  return new Promise((res, rej) => {
    const ws = new WebSocket(url);
    ws.onopen = () => res(ws);
    ws.onerror = () => rej(new Error('không mở được WebSocket'));
  });
}

test('màn hình nhận trạng thái và thông báo từ nguồn mô phỏng qua WebSocket', async () => {
  const b = new Bridge({ publicDir: pub, port: 0, seed: 3, tickMs: 50, broadcastMs: 50, log: () => {} });
  const port = await b.start();
  const src = simSource(b, { players: 10, minutes: 1, speed: 60 });
  const ws = await open(`ws://127.0.0.1:${port}/ws`);
  const m = await nextMessage(ws, (x) => x.type === 'state' && x.state.players.length > 0);
  assert.equal(m.state.v, 1);
  const p = m.state.players[0];
  assert.ok(typeof p.name === 'string' && typeof p.realm === 'string');
  assert.ok(!('id' in p), 'không gửi ID gốc ra màn hình');
  assert.equal(m.state.seats.length, 7);
  const a = await nextMessage(ws, (x) => x.type === 'announce');
  assert.ok(a.items.length > 0);
  ws.close();
  src.stop();
  await b.stop();
});

test('trang overlay và operator phục vụ qua HTTP; đường dẫn lạ trả 404', async () => {
  const b = new Bridge({ publicDir: pub, port: 0, log: () => {} });
  const port = await b.start();
  const r1 = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(r1.status, 200);
  assert.match(await r1.text(), /Linh Khí Triều/);
  assert.equal((await fetch(`http://127.0.0.1:${port}/operator`)).status, 200);
  assert.equal((await fetch(`http://127.0.0.1:${port}/../package.json`)).status, 404);
  await b.stop();
});

test('operator: tạm dừng, tiếp tục, và người xem giả; màn hình thường không điều khiển được', async () => {
  const b = new Bridge({ publicDir: pub, port: 0, tickMs: 50, broadcastMs: 50, log: () => {} });
  const port = await b.start();
  const screen = await open(`ws://127.0.0.1:${port}/ws`);
  screen.send(JSON.stringify({ type: 'pause' }));
  await new Promise((r) => setTimeout(r, 100));
  assert.equal(b.game.state.paused, false, 'màn hình OBS không được tạm dừng game');

  const op = await open(`ws://127.0.0.1:${port}/ws?role=operator`);
  op.send(JSON.stringify({ type: 'pause' }));
  await nextMessage(op, (x) => x.type === 'status' && x.paused === true);
  op.send(JSON.stringify({ type: 'resume' }));
  await nextMessage(op, (x) => x.type === 'status' && x.paused === false);

  op.send(JSON.stringify({ type: 'fake', event: { type: 'gift', playerId: 'Khách', diamonds: 10 } }));
  const s = await nextMessage(screen, (x) => x.type === 'state' && x.state.players.some((p: any) => p.name === 'Khách'));
  assert.ok(s);
  assert.equal(b.game.state.players['test:Khách']!.sessionGiftDiamonds, 10);
  screen.close();
  op.close();
  await b.stop();
});

test('lưu SQLite khi dừng và nạp lại khi mở; mở phiên mới thì linh căn đo lại', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ttg-bridge-'));
  const db = join(dir, 'game.sqlite');
  try {
    const b1 = new Bridge({ publicDir: pub, port: 0, dbPath: db, log: () => {} });
    await b1.start();
    b1.push([
      { id: 'x1', type: 'join', playerId: 'tt:1', name: 'Minh', at: Date.now() },
      { id: 'x2', type: 'gift', playerId: 'tt:1', diamonds: 50, at: Date.now() },
    ]);
    const tuVi = b1.game.state.players['tt:1']!.tuViTotal;
    await b1.stop();

    const b2 = new Bridge({ publicDir: pub, port: 0, dbPath: db, resume: true, log: () => {} });
    assert.equal(b2.game.state.players['tt:1']!.tuViTotal, tuVi);
    assert.notEqual(b2.game.state.players['tt:1']!.root, null, 'chạy tiếp: giữ linh căn');
    assert.equal(b2.push([{ id: 'x2', type: 'gift', playerId: 'tt:1', diamonds: 50, at: Date.now() }]), 0, 'sự kiện cũ không cộng lại');
    await b2.stop();

    const b3 = new Bridge({ publicDir: pub, port: 0, dbPath: db, log: () => {} });
    assert.equal(b3.game.state.players['tt:1']!.tuViTotal, tuVi, 'phiên mới: giữ Tu Vi');
    assert.equal(b3.game.state.players['tt:1']!.root, null, 'phiên mới: linh căn đo lại');
    await b3.stop();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
