import { scenario, type GameEvent } from '../../core/src/index.ts';
import type { Bridge } from './bridge.ts';
import { TikTokMapper } from './tiktok-map.ts';

export interface Source {
  stop(): void | Promise<void>;
}

/**
 * Nguồn MÔ PHỎNG: phát lại `scenario()` của lõi theo thời gian thực (nhân tốc `speed`).
 * Dữ liệu giả, chỉ để thử màn hình và đường ống. ID có tiền tố riêng của lần chạy để không bị coi là trùng.
 */
export function simSource(bridge: Bridge, o: { players?: number; minutes?: number; speed?: number; seed?: number; now?: () => number } = {}): Source {
  const now = o.now ?? Date.now;
  const speed = o.speed ?? 1;
  const run = `sim${now().toString(36)}`;
  const events = scenario({ players: o.players ?? 40, minutes: o.minutes ?? 30, seed: o.seed ?? 1 });
  const start = now();
  let i = 0;
  bridge.setSource({ source: 'mô phỏng', connected: true, detail: `${events.length} sự kiện giả, tốc độ x${speed}` });
  const timer = setInterval(() => {
    const t = now();
    const batch: GameEvent[] = [];
    while (i < events.length && start + events[i]!.at / speed <= t) {
      const e = events[i++]!;
      const out: any = { ...e, id: `${run}-${e.id}`, at: t };
      if ('playerId' in e) out.playerId = `sim:${e.playerId}`;
      batch.push(out as GameEvent);
    }
    if (batch.length) bridge.push(batch);
    if (i >= events.length) {
      clearInterval(timer);
      bridge.setSource({ connected: false, detail: 'Hết dữ liệu mô phỏng' });
    }
  }, 100);
  return { stop: () => clearInterval(timer) };
}

const TYPES = ['member', 'chat', 'like', 'gift', 'social', 'emote', 'questionNew'] as const;

/**
 * Nguồn TIKTOK, CHỈ ĐỌC: không đăng nhập, không gửi gì vào LIVE.
 * Dùng thư viện không chính thức `tiktok-live-connector` (AGPL-3.0-only, xem README). Tự nối lại khi rớt.
 * CHƯA CHẠY VỚI TIKTOK THẬT.
 */
export async function tiktokSource(bridge: Bridge, username: string, o: { now?: () => number; log?: (m: string) => void } = {}): Promise<Source> {
  const now = o.now ?? Date.now;
  const log = o.log ?? ((m: string) => console.log(m));
  let mod: any;
  try {
    mod = await import('tiktok-live-connector');
  } catch {
    throw new Error('Chưa cài thư viện đọc TikTok. Chạy lại "npm install" trong thư mục live-bridge.');
  }
  const mapper = new TikTokMapper();
  const key = process.env.EULER_API_KEY;
  let stopped = false;
  let backoff = 5_000;
  let conn: any;
  let retry: NodeJS.Timeout | undefined;

  bridge.setSource({ source: `TikTok @${username}`, connected: false, detail: 'Đang kết nối...' });

  const connect = async () => {
    if (stopped) return;
    conn = new mod.TikTokLiveConnection(username, key ? { signApiKey: key } : {});
    for (const type of TYPES)
      conn.on(type, (p: any) => {
        bridge.push(mapper.map(type, p, now()));
        bridge.setSource({ skipped: mapper.skipped });
      });
    conn.on(mod.ControlEvent.DISCONNECTED, () => {
      bridge.setSource({ connected: false, detail: 'Rớt kết nối, đang nối lại...' });
      log('TikTok: rớt kết nối.');
      schedule();
    });
    conn.on(mod.ControlEvent.ERROR, (e: any) => log(`TikTok lỗi: ${e?.name ?? e?.message ?? e}`));
    try {
      await conn.connect();
      backoff = 5_000;
      bridge.setSource({ connected: true, detail: 'Đã kết nối' });
      log('TikTok: đã kết nối.');
    } catch (e: any) {
      bridge.setSource({ connected: false, detail: `Không kết nối được: ${e?.message ?? e}` });
      log(`TikTok: không kết nối được (${e?.message ?? e}). Kiểm tra đã bật LIVE và đúng tên tài khoản.`);
      schedule();
    }
  };
  const schedule = () => {
    if (stopped || retry) return;
    const wait = backoff;
    backoff = Math.min(backoff * 2, 60_000);
    retry = setTimeout(() => {
      retry = undefined;
      try {
        conn?.disconnect?.();
      } catch {
        /* bỏ qua */
      }
      void connect();
    }, wait);
  };
  await connect();
  return {
    stop: () => {
      stopped = true;
      if (retry) clearTimeout(retry);
      try {
        conn?.disconnect?.();
      } catch {
        /* bỏ qua */
      }
    },
  };
}
