import { readFile } from 'node:fs/promises';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import { join } from 'node:path';
import { WebSocketServer, type WebSocket } from 'ws';
import { Game, seededRng, Store, type GameEvent, type PersistableRng } from '../../core/src/index.ts';
import { buildView } from './view.ts';

export interface BridgeOptions {
  /** Mặc định 127.0.0.1: chỉ máy này mở được màn hình (OBS chạy cùng máy). */
  host?: string;
  /** 0 = chọn cổng trống (dùng cho test). */
  port?: number;
  publicDir: string;
  /** File SQLite; bỏ trống = không lưu (chỉ dùng thử). */
  dbPath?: string;
  /** true = chạy tiếp phiên LIVE đang dở sau khi tắt đột ngột; false = mở phiên LIVE mới. */
  resume?: boolean;
  seed?: number;
  tickMs?: number;
  broadcastMs?: number;
  commitMs?: number;
  maxPlayersShown?: number;
  now?: () => number;
  log?: (msg: string) => void;
}

export interface SourceStatus {
  source: string;
  connected: boolean;
  detail: string;
  eventsIn: number;
  skipped: number;
  lastEventAt: number;
}

const PAGES: Record<string, { file: string; type: string }> = {
  '/': { file: 'overlay.html', type: 'text/html; charset=utf-8' },
  '/overlay': { file: 'overlay.html', type: 'text/html; charset=utf-8' },
  '/operator': { file: 'operator.html', type: 'text/html; charset=utf-8' },
};

function isLoopback(req: IncomingMessage): boolean {
  const a = req.socket.remoteAddress ?? '';
  return a === '127.0.0.1' || a === '::1' || a === '::ffff:127.0.0.1';
}

/**
 * Cầu nối chạy trên PC của streamer:
 * nguồn sự kiện → `push()` → lõi game → WebSocket `/ws` → màn hình OBS (Browser Source) và trang operator.
 * Giờ lấy từ `now()` (mặc định Date.now). Mọi thay đổi trạng thái commit vào SQLite định kỳ.
 */
export class Bridge {
  readonly game: Game;
  readonly status: SourceStatus = { source: '-', connected: false, detail: '', eventsIn: 0, skipped: 0, lastEventAt: 0 };
  private rng: PersistableRng;
  private store?: Store;
  private http?: Server;
  private wss?: WebSocketServer;
  private operators = new Set<WebSocket>();
  private timers: NodeJS.Timeout[] = [];
  private now: () => number;
  private log: (m: string) => void;
  private lastCommit = 0;

  constructor(private o: BridgeOptions) {
    this.now = o.now ?? Date.now;
    this.log = o.log ?? ((m) => console.log(m));
    this.rng = seededRng(o.seed ?? (Date.now() & 0x7fffffff));
    if (o.dbPath) {
      this.store = new Store(o.dbPath);
      const loaded = this.store.load();
      if (loaded) {
        if (loaded.rngState !== null) this.rng.setState(loaded.rngState);
        this.game = new Game(this.rng, undefined, loaded.state);
        this.log(`Đã nạp dữ liệu cũ: ${Object.keys(loaded.state.players).length} người chơi.`);
      } else this.game = new Game(this.rng);
    } else this.game = new Game(this.rng);

    const t = this.now();
    if (o.resume) {
      // Chạy tiếp: tick sẽ tự giới hạn khoảng trống bằng maxTickGapMs.
      this.log('Chạy tiếp phiên LIVE đang dở.');
    } else {
      this.game.startSession(t);
      this.log('Mở phiên LIVE mới (linh căn đo lại, Thiên Bảng phiên về 0).');
    }
  }

  /** Nhận sự kiện đã chuẩn hóa từ một nguồn. Trả số sự kiện được lõi chấp nhận. */
  push(events: GameEvent[]): number {
    let ok = 0;
    for (const e of events) if (this.game.handle(e)) ok++;
    if (events.length) {
      this.status.eventsIn += events.length;
      this.status.lastEventAt = this.now();
    }
    return ok;
  }

  setSource(patch: Partial<SourceStatus>): void {
    Object.assign(this.status, patch);
  }

  async start(): Promise<number> {
    const dir = this.o.publicDir;
    this.http = createServer(async (req, res) => {
      const path = (req.url ?? '/').split('?')[0]!;
      const page = PAGES[path];
      if (!page) {
        res.writeHead(404).end('Không có trang này');
        return;
      }
      if (path === '/operator' && !isLoopback(req)) {
        res.writeHead(403).end('Trang operator chỉ mở được trên chính máy này');
        return;
      }
      try {
        const body = await readFile(join(dir, page.file));
        res.writeHead(200, { 'content-type': page.type, 'cache-control': 'no-store' }).end(body);
      } catch {
        res.writeHead(500).end('Thiếu file giao diện');
      }
    });
    this.wss = new WebSocketServer({ server: this.http, path: '/ws' });
    this.wss.on('connection', (ws, req) => {
      const op = isLoopback(req) && (req.url ?? '').includes('role=operator');
      if (op) this.operators.add(ws);
      ws.on('close', () => this.operators.delete(ws));
      ws.on('message', (buf) => {
        if (!op) return; // màn hình OBS chỉ nhận, không điều khiển
        try {
          this.onOperator(JSON.parse(String(buf)));
        } catch {
          /* bỏ qua tin hỏng */
        }
      });
      ws.send(JSON.stringify({ type: 'state', state: buildView(this.game, this.now(), this.o.maxPlayersShown) }));
    });

    const port = await new Promise<number>((resolve, reject) => {
      this.http!.once('error', reject);
      this.http!.listen(this.o.port ?? 8787, this.o.host ?? '127.0.0.1', () => {
        const a = this.http!.address();
        resolve(typeof a === 'object' && a ? a.port : 0);
      });
    });

    this.lastCommit = this.now();
    this.timers.push(setInterval(() => this.step(), this.o.tickMs ?? 1000));
    this.timers.push(setInterval(() => this.broadcastState(), this.o.broadcastMs ?? 250));
    return port;
  }

  /** Một nhịp: tick lõi, phát thông báo, commit định kỳ. Gọi tay được trong test. */
  step(): void {
    const t = this.now();
    this.game.tick(t);
    const items = this.game.announcer.drain(t);
    if (items.length) this.broadcast({ type: 'announce', items });
    if (this.store && t - this.lastCommit >= (this.o.commitMs ?? 5000)) this.commit();
    this.sendOperators({ type: 'status', status: this.status, dropped: this.game.announcer.dropped, paused: this.game.state.paused });
  }

  commit(): void {
    if (!this.store) return;
    this.store.commit(this.game.state, 0, this.rng.getState());
    this.lastCommit = this.now();
  }

  private onOperator(m: any): void {
    const t = this.now();
    if (m?.type === 'pause') this.game.pause(), this.log('Operator: tạm dừng.');
    else if (m?.type === 'resume') this.game.resume(), this.log('Operator: tiếp tục.');
    else if (m?.type === 'fake' && m.event && typeof m.event === 'object') {
      // Sự kiện thử từ trang operator (không phải TikTok). Gắn tiền tố để không lẫn người thật.
      const e = { ...m.event, id: `op-${t}-${Math.random().toString(36).slice(2)}`, at: t };
      if (typeof e.playerId !== 'string' || !e.playerId) return;
      const name = String(e.name ?? e.playerId).slice(0, 24);
      e.playerId = `test:${e.playerId}`;
      const batch: GameEvent[] = [];
      if (e.type !== 'join' && !this.game.state.players[e.playerId])
        batch.push({ id: `${e.id}:join`, type: 'join', playerId: e.playerId, name, at: t });
      batch.push(e as GameEvent);
      this.push(batch);
    }
  }

  private broadcastState(): void {
    if (!this.wss || this.wss.clients.size === 0) return;
    this.broadcast({ type: 'state', state: buildView(this.game, this.now(), this.o.maxPlayersShown) });
  }

  private broadcast(msg: unknown): void {
    if (!this.wss) return;
    const s = JSON.stringify(msg);
    for (const c of this.wss.clients) if (c.readyState === 1) c.send(s);
  }

  private sendOperators(msg: unknown): void {
    if (!this.operators.size) return;
    const s = JSON.stringify(msg);
    for (const c of this.operators) if (c.readyState === 1) c.send(s);
  }

  async stop(): Promise<void> {
    for (const t of this.timers) clearInterval(t);
    this.timers = [];
    this.commit();
    this.store?.close();
    for (const c of this.wss?.clients ?? []) c.terminate();
    await new Promise<void>((r) => (this.wss ? this.wss.close(() => r()) : r()));
    await new Promise<void>((r) => (this.http ? this.http.close(() => r()) : r()));
  }
}
