import { randomBytes, timingSafeEqual } from 'node:crypto';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { OPERATOR_ACTIONS, type Operator } from './operator.ts';

/**
 * Bảng điều khiển cho người vận hành: một trang web chạy trên chính máy phát LIVE.
 * - Chỉ nghe ở 127.0.0.1 (máy khác trong mạng không vào được).
 * - Mọi API cần mã truy cập (token) gửi trong header `x-operator-token`; mã in ra cửa sổ lúc khởi động.
 *   Header riêng này còn chặn được trang web lạ gửi lệnh hộ (trình duyệt không cho gửi header lạ sang trang khác).
 * - Mọi lệnh đi qua `Operator.run()` → luôn có nhật ký kiểm toán.
 */
export interface DashboardOptions {
  operator: Operator;
  /** Mã truy cập; bỏ trống thì tự sinh ngẫu nhiên. */
  token?: string;
  port?: number;
  /** Đồng hồ (để test). */
  now?: () => number;
  /** Tên người thao tác ghi vào nhật ký. */
  actor?: string;
}

export interface Dashboard {
  url: string;
  token: string;
  close(): Promise<void>;
}

const MAX_BODY = 4096;

export function startDashboard(o: DashboardOptions): Promise<Dashboard> {
  const token = o.token ?? randomBytes(9).toString('base64url');
  const now = o.now ?? (() => Date.now());
  const tokenBuf = Buffer.from(token);
  const authed = (req: http.IncomingMessage) => {
    const got = Buffer.from(String(req.headers['x-operator-token'] ?? ''));
    return got.length === tokenBuf.length && timingSafeEqual(got, tokenBuf);
  };
  const send = (res: http.ServerResponse, code: number, body: unknown, type = 'application/json; charset=utf-8') => {
    res.writeHead(code, {
      'Content-Type': type,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'",
    });
    res.end(typeof body === 'string' ? body : JSON.stringify(body));
  };

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/') return send(res, 200, PAGE, 'text/html; charset=utf-8');
    if (!url.pathname.startsWith('/api/')) return send(res, 404, { error: 'not found' });
    if (!authed(req)) return send(res, 401, { error: 'sai hoặc thiếu mã truy cập' });

    if (req.method === 'GET' && url.pathname === '/api/status') return send(res, 200, o.operator.status(now()));
    if (req.method === 'GET' && url.pathname === '/api/players') return send(res, 200, o.operator.findPlayers(url.searchParams.get('q') ?? ''));
    if (req.method === 'POST' && url.pathname === '/api/action') {
      let size = 0;
      const chunks: Buffer[] = [];
      req.on('data', (c: Buffer) => {
        size += c.length;
        if (size > MAX_BODY) {
          send(res, 413, { error: 'quá lớn' });
          req.destroy();
        } else chunks.push(c);
      });
      req.on('end', () => {
        if (res.headersSent) return;
        let body: { action?: unknown; args?: unknown };
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
        } catch {
          return send(res, 400, { error: 'JSON không hợp lệ' });
        }
        const action = typeof body.action === 'string' ? body.action : '';
        const args = body.args && typeof body.args === 'object' ? (body.args as Record<string, unknown>) : {};
        const r = o.operator.run(o.actor ?? 'operator', action, args, now());
        const known = (OPERATOR_ACTIONS as readonly string[]).includes(action);
        send(res, r.ok ? 200 : known ? 409 : 400, { ok: r.ok, error: r.error, result: r.result, auditSeq: r.audit.seq });
      });
      return;
    }
    send(res, 404, { error: 'not found' });
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(o.port ?? 8790, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        url: `http://127.0.0.1:${port}/`,
        token,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}

/** Trang một file, không thư viện ngoài. Chữ do người chơi đặt luôn được chèn bằng textContent (không chạy được mã). */
const PAGE = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bảng điều khiển vận hành</title>
<style>
:root{--bg:#f6f4ef;--card:#fff;--ink:#1f2328;--mute:#6b6f76;--line:#e3e0d8;--accent:#1f7a5c;--warn:#b54708;--bad:#b42318}
@media (prefers-color-scheme:dark){:root{--bg:#16181b;--card:#1f2226;--ink:#e8e6e3;--mute:#9aa0a6;--line:#2e3237;--accent:#4cc79a;--warn:#f0a35e;--bad:#f97066}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 system-ui,sans-serif}
header{display:flex;gap:12px;align-items:center;padding:12px 16px;border-bottom:1px solid var(--line);flex-wrap:wrap}
h1{font-size:17px;margin:0;flex:1}h2{font-size:14px;margin:0 0 8px;color:var(--mute);text-transform:uppercase;letter-spacing:.04em}
main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;padding:16px}
section{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px}
button{font:inherit;padding:6px 12px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}
button.primary{background:var(--accent);border-color:var(--accent);color:#fff}button.danger{color:var(--bad)}
input{font:inherit;padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink);min-width:0}
table{width:100%;border-collapse:collapse}td{padding:4px 2px;border-top:1px solid var(--line);vertical-align:top}td.n{text-align:right;font-variant-numeric:tabular-nums}
.pill{display:inline-block;padding:2px 10px;border-radius:99px;font-weight:600}.run{background:#d1fadf;color:#05603a}.stop{background:#fee4e2;color:#912018}
.mute{color:var(--mute)}.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:6px 0}#msg{min-height:1.4em}
.kv{display:grid;grid-template-columns:auto 1fr;gap:2px 12px}
</style></head><body>
<header><h1>Tu Tiên Giới · Vận hành</h1><span id="state" class="pill">…</span>
<button id="pause" class="danger">Tạm dừng</button><button id="resume" class="primary">Tiếp tục</button></header>
<div id="login" style="padding:16px" hidden><div class="row"><span>Mã truy cập (in ở cửa sổ đen khi khởi động):</span><input id="tok" type="password"><button id="go" class="primary">Vào</button></div></div>
<div style="padding:0 16px" id="msg" class="mute"></div>
<main id="main" hidden>
<section><h2>Tổng quan</h2><div class="kv" id="overview"></div></section>
<section><h2>Ghế chức vụ</h2><table id="seats"></table></section>
<section><h2>Thiên Bảng · Tu Vi</h2><table id="lb"></table></section>
<section><h2>Tìm người chơi</h2><div class="row"><input id="q" placeholder="tên hoặc mã"><button id="find">Tìm</button></div><table id="players"></table></section>
<section><h2>Tên bị lọc / bị ẩn</h2><table id="flagged"></table></section>
<section><h2>Từ chặn</h2><div class="row"><input id="word" placeholder="từ cần chặn"><button id="addw">Thêm</button><button id="rmw">Bỏ</button></div><div id="words" class="mute"></div></section>
<section style="grid-column:1/-1"><h2>Nhật ký thao tác <span id="intact"></span></h2><table id="audit"></table></section>
</main>
<script>
let token=sessionStorage.getItem('opToken')||'';
const $=id=>document.getElementById(id);
const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cls)e.className=cls;return e};
const row=(cells)=>{const tr=el('tr');for(const c of cells){const td=el('td');if(c instanceof Node)td.append(c);else{td.textContent=c&&c.t!==undefined?c.t:String(c??'');if(c&&c.n)td.className='n'}tr.append(td)}return tr};
const LABEL={pause:'Tạm dừng',resume:'Tiếp tục',startSession:'Bắt đầu phiên mới',hideName:'Ẩn tên',unhideName:'Bỏ ẩn tên',approveName:'Duyệt tên',unapproveName:'Hủy duyệt tên',addBlockedWord:'Thêm từ chặn',removeBlockedWord:'Bỏ từ chặn'};
const fmt=n=>Math.round(n).toLocaleString('vi-VN');
async function api(path,opts={}){const r=await fetch(path,{...opts,headers:{'x-operator-token':token,'content-type':'application/json'}});if(r.status===401){showLogin();throw new Error('cần mã truy cập')}return r.json()}
function showLogin(){$('login').hidden=false;$('main').hidden=true}
async function act(action,args={}){const r=await api('/api/action',{method:'POST',body:JSON.stringify({action,args})});$('msg').textContent=r.ok?'Đã làm: '+(LABEL[action]||action):'Không làm được: '+r.error;await refresh()}
async function refresh(){const s=await api('/api/status');$('login').hidden=true;$('main').hidden=false;
$('state').textContent=s.paused?'Đang tạm dừng':'Đang chạy';$('state').className='pill '+(s.paused?'stop':'run');
const ov=$('overview');ov.replaceChildren();const kv=(k,v)=>{ov.append(el('span',k,'mute'),el('span',v))};
kv('Người chơi đang xem',fmt(s.players.present)+' / '+fmt(s.players.total));kv('Linh Khí Triều',s.tide.active?'Đang bật':'Không');
kv('Trận khiêu chiến',s.pending?s.pending.challenger+' đấu '+s.pending.defender+' · còn '+Math.ceil(s.pending.endsInMs/1000)+' giây':'Không có');
kv('Thông báo chờ đọc',s.announcements.queued+' (đã bỏ '+s.announcements.dropped+')');kv('Thái Thượng Tông Chủ',s.hostSupreme?'Có':'Chưa');
$('seats').replaceChildren(...s.seats.map(x=>row([{t:{tongChu:'Tông Chủ',truongPhai:'Trưởng Phái',truongLao:'Trưởng Lão'}[x.role]},x.holder??'NPC'])));
$('lb').replaceChildren(...s.leaderboards.tuVi.map((x,i)=>row([i+1,x.name,{t:fmt(x.value),n:1}])));
$('flagged').replaceChildren(...s.flaggedNames.map(p=>{const b=el('button',p.hidden?'Bỏ ẩn':'Duyệt tên');b.onclick=()=>act(p.hidden?'unhideName':'approveName',{playerId:p.id});return row([p.name,el('span',p.rawName,'mute'),b])}));
$('words').textContent=[...s.blockedWords.tokens,...s.blockedWords.substrings].join(', ');
$('intact').textContent=s.auditIntact?'· nguyên vẹn':'· CẢNH BÁO: bị sửa';$('intact').style.color=s.auditIntact?'':'var(--bad)';
$('audit').replaceChildren(...s.audit.map(a=>row([new Date(a.at).toLocaleTimeString('vi-VN'),a.actor,LABEL[a.action]||a.action,el('span',JSON.stringify(a.detail),'mute'),a.ok?'✓':'✗'])));}
async function find(){const list=await api('/api/players?q='+encodeURIComponent($('q').value));$('players').replaceChildren(...list.map(p=>{const b=el('button',p.hidden?'Bỏ ẩn':'Ẩn tên',p.hidden?'':'danger');b.onclick=()=>act(p.hidden?'unhideName':'hideName',{playerId:p.id});return row([p.name,el('span',p.present?'đang xem':'đã rời','mute'),b])}))}
$('go').onclick=()=>{token=$('tok').value.trim();sessionStorage.setItem('opToken',token);refresh().catch(()=>{})};
$('pause').onclick=()=>act('pause');$('resume').onclick=()=>act('resume');$('find').onclick=find;
$('addw').onclick=()=>act('addBlockedWord',{word:$('word').value});$('rmw').onclick=()=>act('removeBlockedWord',{word:$('word').value});
if(!token)showLogin();else refresh().catch(()=>{});setInterval(()=>{if(token)refresh().catch(()=>{})},2000);
</script></body></html>`;
