// C-002 PoC-2 — measurement runner for the Product Owner's Windows PC.
// Throwaway PoC tooling. Needs only Node.js (>= 22) and OBS Studio (>= 28, WebSocket server enabled).
//
//   node run.mjs --all                 full matrix: A/B/C x 40/60/80 (10 min each) + storm at 60 + 60 s videos
//   node run.mjs --config A --n 60     one run (A = Phaser web, B = Godot web, C = Godot native)
//   node run.mjs --minutes 2 --all     shorter runs (for a quick try)
//   node run.mjs --serve               only serve the builds (manual testing in a browser)
//
// What it does for each run:
//   1. switches OBS to the right scene and points the browser source at the build (or launches the Godot exe)
//   2. waits 20 s for warm-up, then records for N minutes:
//        - frame times sent by the game (every frame)
//        - OBS stats every second (render/encode skipped frames, OBS CPU)
//        - CPU % and RAM of OBS, browser-source and Godot processes + total CPU (PowerShell, every second)
//   3. writes results/<run>.json with the raw data and a summary, judged against POC_PLAN.md thresholds.
import http from 'node:http';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, createReadStream, statSync } from 'node:fs';
import { join, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const PORT = 8787;
const RESULTS = join(HERE, 'results');
mkdirSync(RESULTS, { recursive: true });

// ------------------------------------------------------------------ args
const argv = process.argv.slice(2);
const arg = (k, d) => {
  const i = argv.indexOf(`--${k}`);
  return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : d;
};
const MINUTES = Number(arg('minutes', 10));
const WARMUP_S = Number(arg('warmup', 20));
const OBS_URL = arg('obs', 'ws://127.0.0.1:4455');
const OBS_PASSWORD = arg('password', process.env.OBS_PASSWORD ?? '');

const BUILDS = {
  phaser: join(ROOT, 'builds', 'phaser'),
  godotWeb: join(ROOT, 'builds', 'godot-web'),
  godotExe: join(ROOT, 'builds', 'godot-windows', 'TuTienGioiPoC_Godot.exe'),
};
const CONFIGS = {
  A: { label: 'Phaser 4 (Web) - OBS Browser Source', scene: 'PoC-Web', url: (q) => `http://localhost:${PORT}/phaser/index.html?${q}` },
  B: { label: 'Godot 4 (Web export) - OBS Browser Source', scene: 'PoC-Web', url: (q) => `http://localhost:${PORT}/godot-web/index.html?${q}` },
  C: { label: 'Godot 4 (native exe) - OBS Window Capture', scene: 'PoC-Native', exe: true },
};

// ------------------------------------------------------------------ thresholds (POC_PLAN.md 5.3)
const T = { avgFps: 29.5, p95Ms: 40, hitchPct: 0.5, obsSkippedPct: 1, cpuAvg: 70, ramGrowthPct: 10, stormMinFps: 25 };

// ------------------------------------------------------------------ static server + frame collector
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.wasm': 'application/wasm', '.pck': 'application/octet-stream', '.ttf': 'font/ttf', '.css': 'text/css' };
let frameSink = null; // (payload) => void
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.end();
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === 'POST' && url.pathname === '/frames') {
    let body = '';
    req.on('data', (d) => (body += d));
    req.on('end', () => {
      try { frameSink?.(JSON.parse(body)); } catch { /* ignore malformed */ }
      res.end('ok');
    });
    return;
  }
  if (url.pathname === '/idle') {
    res.setHeader('Content-Type', 'text/html');
    return res.end('<html><body style="background:#000"></body></html>');
  }
  const map = { '/phaser/': BUILDS.phaser, '/godot-web/': BUILDS.godotWeb };
  for (const [prefix, dir] of Object.entries(map)) {
    if (url.pathname.startsWith(prefix)) {
      const file = resolve(dir, decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html');
      if (!file.startsWith(dir) || !existsSync(file) || statSync(file).isDirectory()) break;
      res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
      return createReadStream(file).pipe(res);
    }
  }
  res.statusCode = 404;
  res.end('not found');
});

// ------------------------------------------------------------------ OBS WebSocket v5 (minimal client)
class Obs {
  constructor() { this.ws = null; this.pending = new Map(); this.id = 0; this.ok = false; }
  async connect() {
    if (typeof WebSocket === 'undefined') throw new Error('Node.js >= 22 is required (built-in WebSocket)');
    this.ws = new WebSocket(OBS_URL);
    await new Promise((res, rej) => {
      const timer = setTimeout(() => rej(new Error('OBS WebSocket: no answer (is OBS open and the WebSocket server enabled?)')), 5000);
      this.ws.onerror = () => { clearTimeout(timer); rej(new Error('OBS WebSocket: cannot connect to ' + OBS_URL)); };
      this.ws.onmessage = (m) => {
        const msg = JSON.parse(m.data);
        if (msg.op === 0) {
          const d = { rpcVersion: 1 };
          const a = msg.d.authentication;
          if (a) {
            if (!OBS_PASSWORD) { clearTimeout(timer); rej(new Error('OBS WebSocket needs a password: run with --password <pass> or disable authentication')); return; }
            const secret = createHash('sha256').update(OBS_PASSWORD + a.salt).digest('base64');
            d.authentication = createHash('sha256').update(secret + a.challenge).digest('base64');
          }
          this.ws.send(JSON.stringify({ op: 1, d }));
        } else if (msg.op === 2) { clearTimeout(timer); this.ok = true; res(); }
        else if (msg.op === 7) {
          const p = this.pending.get(msg.d.requestId);
          if (p) { this.pending.delete(msg.d.requestId); msg.d.requestStatus.result ? p.res(msg.d.responseData ?? {}) : p.rej(new Error(`${msg.d.requestType}: ${msg.d.requestStatus.comment ?? msg.d.requestStatus.code}`)); }
        }
      };
      this.ws.onclose = () => { this.ok = false; };
    });
  }
  call(requestType, requestData = {}) {
    const requestId = String(++this.id);
    return new Promise((res, rej) => {
      this.pending.set(requestId, { res, rej });
      this.ws.send(JSON.stringify({ op: 6, d: { requestType, requestId, requestData } }));
      setTimeout(() => { if (this.pending.delete(requestId)) rej(new Error(requestType + ': timeout')); }, 10000);
    });
  }
  async tryCall(t, d) { try { return await this.call(t, d); } catch (e) { return { error: e.message }; } }
}

async function setupObs(obs) {
  // canvas and output 1080x1920 @ 30 fps (only possible while not recording/streaming)
  await obs.tryCall('SetVideoSettings', { baseWidth: 1080, baseHeight: 1920, outputWidth: 1080, outputHeight: 1920, fpsNumerator: 30, fpsDenominator: 1 });
  const { scenes = [] } = await obs.call('GetSceneList');
  const names = scenes.map((s) => s.sceneName);
  if (!names.includes('PoC-Web')) await obs.call('CreateScene', { sceneName: 'PoC-Web' });
  if (!names.includes('PoC-Native')) await obs.call('CreateScene', { sceneName: 'PoC-Native' });
  const { inputs = [] } = await obs.call('GetInputList');
  const inputNames = inputs.map((i) => i.inputName);
  if (!inputNames.includes('PoC Browser')) {
    await obs.call('CreateInput', {
      sceneName: 'PoC-Web', inputName: 'PoC Browser', inputKind: 'browser_source',
      inputSettings: { url: `http://localhost:${PORT}/idle`, width: 1080, height: 1920, fps_custom: true, fps: 30, shutdown: false, restart_when_active: false },
      sceneItemEnabled: true,
    });
  }
  if (!inputNames.includes('PoC Godot Window')) {
    await obs.call('CreateInput', {
      sceneName: 'PoC-Native', inputName: 'PoC Godot Window', inputKind: 'window_capture',
      inputSettings: { window: 'TuTienGioi PoC Godot:Engine:TuTienGioiPoC_Godot.exe', cursor: false, method: 2 },
      sceneItemEnabled: true,
    });
  }
  // stretch the window capture to fill the 1080x1920 canvas
  const item = await obs.tryCall('GetSceneItemId', { sceneName: 'PoC-Native', sourceName: 'PoC Godot Window' });
  if (item.sceneItemId) {
    await obs.tryCall('SetSceneItemTransform', {
      sceneName: 'PoC-Native', sceneItemId: item.sceneItemId,
      sceneItemTransform: { boundsType: 'OBS_BOUNDS_SCALE_INNER', boundsWidth: 1080, boundsHeight: 1920, positionX: 0, positionY: 0 },
    });
  }
}

// ------------------------------------------------------------------ process sampler (PowerShell, language independent)
function startSampler(onSample) {
  if (process.platform !== 'win32') return { stop() {} };
  const script = `
$names = @('obs64','obs-browser-page','TuTienGioiPoC_Godot','node')
$cores = (Get-CimInstance Win32_ComputerSystem).NumberOfLogicalProcessors
$prev = @{}
while ($true) {
  $t = Get-Date
  $procs = Get-Process -ErrorAction SilentlyContinue | Where-Object { $names -contains $_.ProcessName }
  $out = @{}
  foreach ($p in $procs) {
    $key = $p.ProcessName
    $cpu = $p.TotalProcessorTime.TotalMilliseconds
    $pk = "$($p.Id)"
    $d = 0
    if ($prev.ContainsKey($pk)) { $d = $cpu - $prev[$pk] }
    $prev[$pk] = $cpu
    if (-not $out.ContainsKey($key)) { $out[$key] = @{ cpuMs = 0; ramMB = 0; count = 0 } }
    $out[$key].cpuMs += $d
    $out[$key].ramMB += [math]::Round($p.WorkingSet64 / 1MB, 1)
    $out[$key].count += 1
  }
  $total = (Get-CimInstance Win32_PerfFormattedData_PerfOS_Processor -Filter "Name='_Total'").PercentProcessorTime
  $os = Get-CimInstance Win32_OperatingSystem
  $line = @{ t = $t.ToString('o'); totalCpu = $total; freeRamMB = [math]::Round($os.FreePhysicalMemory / 1024, 0); cores = $cores; procs = $out } | ConvertTo-Json -Compress -Depth 4
  [Console]::Out.WriteLine($line)
  [Console]::Out.Flush()
  Start-Sleep -Milliseconds (1000 - ((Get-Date) - $t).TotalMilliseconds % 1000)
}`;
  const ps = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], { stdio: ['ignore', 'pipe', 'ignore'] });
  let buf = '';
  ps.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (line.startsWith('{')) try { onSample(JSON.parse(line)); } catch { /* skip */ }
    }
  });
  return { stop() { ps.kill(); } };
}

async function machineInfo(obs) {
  const info = { node: process.version, platform: process.platform };
  if (process.platform === 'win32') {
    const ps = `$c=Get-CimInstance Win32_Processor | Select-Object -First 1 Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed
$g=Get-CimInstance Win32_VideoController | Select-Object Name,DriverVersion,AdapterRAM,CurrentHorizontalResolution,CurrentVerticalResolution,CurrentRefreshRate
$m=Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory
$o=Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,BuildNumber
$b=Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue | Select-Object BatteryStatus,EstimatedChargeRemaining
@{cpu=$c;gpu=$g;ramGB=[math]::Round($m.TotalPhysicalMemory/1GB,1);os=$o;battery=$b} | ConvertTo-Json -Compress -Depth 4`;
    info.hardware = await new Promise((res) => {
      const p = spawn('powershell.exe', ['-NoProfile', '-Command', ps], { stdio: ['ignore', 'pipe', 'ignore'] });
      let out = '';
      p.stdout.on('data', (d) => (out += d));
      p.on('exit', () => { try { res(JSON.parse(out)); } catch { res({ raw: out.slice(0, 2000) }); } });
    });
  }
  if (obs?.ok) {
    info.obs = await obs.tryCall('GetVersion');
    info.obsVideo = await obs.tryCall('GetVideoSettings');
    info.obsRecordDir = await obs.tryCall('GetRecordDirectory');
  }
  return info; // deliberately no computer name / user name
}

// ------------------------------------------------------------------ one run
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))] : null; };

async function runOne(obs, configKey, n, scenario, minutes, machine, opts = {}) {
  const cfg = CONFIGS[configKey];
  const runId = `${configKey}-n${n}-${scenario}-${Date.now()}`;
  const query = `n=${n}&scenario=${scenario}&log=http://localhost:${PORT}&run=${runId}`;
  console.log(`\n=== ${runId}: ${cfg.label}, ${n} characters, ${scenario}, ${minutes} min ===`);
  const frames = [];
  const batches = [];
  let measuring = false;
  frameSink = (p) => { if (p.run !== runId) return; batches.push({ ...p, frameMs: undefined, frames: p.frameMs?.length ?? 0, at: Date.now() }); if (measuring) frames.push(...p.frameMs); };
  let exeProc = null;
  if (cfg.exe) {
    if (!existsSync(BUILDS.godotExe)) throw new Error('missing ' + BUILDS.godotExe);
    exeProc = spawn(BUILDS.godotExe, ['--', ...query.split('&')], { stdio: 'ignore' });
    await sleep(3000);
  }
  if (obs?.ok) {
    await obs.tryCall('SetCurrentProgramScene', { sceneName: cfg.scene });
    if (!cfg.exe) await obs.tryCall('SetInputSettings', { inputName: 'PoC Browser', inputSettings: { url: cfg.url(query) } });
  } else if (!cfg.exe) {
    console.log('OBS is not connected. Open this URL in an OBS Browser Source (1080x1920, 30 fps):\n  ' + cfg.url(query));
  }
  console.log(`warm-up ${WARMUP_S} s ...`);
  await sleep(WARMUP_S * 1000);
  const obsStats = [];
  const samples = [];
  const sampler = startSampler((s) => { if (measuring) samples.push(s); });
  const s0 = obs?.ok ? await obs.tryCall('GetStats') : null;
  if (opts.record && obs?.ok) await obs.tryCall('StartRecord');
  measuring = true;
  const t0 = Date.now();
  const end = t0 + minutes * 60_000;
  while (Date.now() < end) {
    if (obs?.ok) { const st = await obs.tryCall('GetStats'); if (!st.error) obsStats.push({ t: Date.now() - t0, ...st }); }
    process.stdout.write(`\r  ${Math.round((Date.now() - t0) / 1000)} / ${minutes * 60} s   frames: ${frames.length}   `);
    await sleep(1000);
  }
  measuring = false;
  let recording = null;
  if (opts.record && obs?.ok) recording = await obs.tryCall('StopRecord');
  sampler.stop();
  const s1 = obs?.ok ? await obs.tryCall('GetStats') : null;
  if (obs?.ok && !cfg.exe) await obs.tryCall('SetInputSettings', { inputName: 'PoC Browser', inputSettings: { url: `http://localhost:${PORT}/idle` } });
  if (exeProc) exeProc.kill();
  await sleep(2000);
  process.stdout.write('\n');

  // ---- summary
  const totalMs = frames.reduce((a, b) => a + b, 0);
  const avgFps = frames.length ? (frames.length / (totalMs / 1000)) : null;
  const hitches = frames.filter((x) => x > 50).length;
  const sec = (k) => (s0 && s1 && !s0.error && !s1.error ? s1[k] - s0[k] : null);
  const renderTotal = sec('renderTotalFrames');
  const renderSkipped = sec('renderSkippedFrames');
  const outTotal = sec('outputTotalFrames');
  const outSkipped = sec('outputSkippedFrames');
  const obsSkippedPct = renderTotal || outTotal
    ? +(((renderSkipped ?? 0) + (outSkipped ?? 0)) / Math.max(1, (renderTotal ?? 0) + (outTotal ?? 0)) * 100).toFixed(3) : null;
  const totalCpu = samples.map((s) => s.totalCpu).filter((x) => typeof x === 'number');
  const cores = samples[0]?.cores ?? 1;
  const procCpu = {};
  const procRam = {};
  for (const s of samples) for (const [k, v] of Object.entries(s.procs ?? {})) {
    (procCpu[k] ??= []).push(v.cpuMs / 10 / cores); // % of whole machine
    (procRam[k] ??= []).push(v.ramMB);
  }
  const avg = (a) => (a?.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(1) : null);
  const ramGrowth = {};
  for (const [k, a] of Object.entries(procRam)) {
    const q = Math.max(1, Math.floor(a.length / 10));
    const first = avg(a.slice(0, q));
    const last = avg(a.slice(-q));
    ramGrowth[k] = first ? +(((last - first) / first) * 100).toFixed(1) : null;
  }
  // worst 1 s window (storm check): fps per second
  let minFps1s = null;
  { let acc = 0; let cnt = 0; for (const f of frames) { acc += f; cnt++; if (acc >= 1000) { const fps = cnt / (acc / 1000); minFps1s = minFps1s === null ? fps : Math.min(minFps1s, fps); acc = 0; cnt = 0; } } }
  const gameProc = cfg.exe ? 'TuTienGioiPoC_Godot' : 'obs-browser-page';
  const summary = {
    frames: frames.length,
    avgFps: avgFps && +avgFps.toFixed(2),
    frameMs: { p50: pct(frames, 50), p95: pct(frames, 95), p99: pct(frames, 99), max: pct(frames, 100) },
    hitchesOver50ms: hitches, hitchPct: frames.length ? +((hitches / frames.length) * 100).toFixed(3) : null,
    minFps1s: minFps1s && +minFps1s.toFixed(1),
    obs: { renderTotal, renderSkipped, outputTotal: outTotal, outputSkipped: outSkipped, skippedPct: obsSkippedPct,
      avgCpu: avg(obsStats.map((s) => s.cpuUsage)), avgRenderMs: avg(obsStats.map((s) => s.averageFrameRenderTime)) },
    cpu: { totalAvg: avg(totalCpu), totalMax: totalCpu.length ? Math.max(...totalCpu) : null, byProcessAvg: Object.fromEntries(Object.entries(procCpu).map(([k, a]) => [k, avg(a)])) },
    ramMB: { byProcessAvg: Object.fromEntries(Object.entries(procRam).map(([k, a]) => [k, avg(a)])), growthPct: ramGrowth },
  };
  const checks = {
    avgFps: summary.avgFps !== null && summary.avgFps >= T.avgFps,
    p95: summary.frameMs.p95 !== null && summary.frameMs.p95 <= T.p95Ms,
    hitches: summary.hitchPct !== null && summary.hitchPct <= T.hitchPct,
    obsSkipped: obsSkippedPct === null ? 'not measured' : obsSkippedPct < T.obsSkippedPct,
    cpu: summary.cpu.totalAvg === null ? 'not measured' : summary.cpu.totalAvg < T.cpuAvg,
    ramGrowth: ramGrowth[gameProc] === undefined || ramGrowth[gameProc] === null ? 'not measured' : ramGrowth[gameProc] < T.ramGrowthPct,
  };
  if (scenario === 'storm') checks.stormMinFps = summary.minFps1s !== null && summary.minFps1s >= T.stormMinFps;
  const out = { runId, config: configKey, label: cfg.label, n, scenario, minutes, warmupS: WARMUP_S, thresholds: T, summary, checks,
    pass: Object.values(checks).every((v) => v === true || v === 'not measured'),
    machine, recording, batches: batches.slice(0, 5), obsStats, samples, frameMs: frames };
  const file = join(RESULTS, `${runId}.json`);
  writeFileSync(file, JSON.stringify(out));
  console.log(`  avg ${summary.avgFps} fps | p95 ${summary.frameMs.p95} ms | hitches ${summary.hitchPct}% | OBS skipped ${obsSkippedPct}% | CPU ${summary.cpu.totalAvg}% -> ${out.pass ? 'PASS' : 'FAIL'}`);
  if (!frames.length) console.log('  WARNING: no frame data received. Check that the scene is visible in OBS.');
  return out;
}

// ------------------------------------------------------------------ main
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
console.log(`server: http://localhost:${PORT}/phaser/index.html  |  http://localhost:${PORT}/godot-web/index.html`);
if (arg('serve', false)) {
  console.log('serve-only mode. Press Ctrl+C to stop.');
} else {
  let obs = new Obs();
  try {
    await obs.connect();
    await setupObs(obs);
    console.log('OBS connected and configured (scenes PoC-Web / PoC-Native, 1080x1920 @ 30 fps).');
  } catch (e) {
    console.log('OBS: ' + e.message + '\n -> continuing without OBS stats (game frame times and CPU/RAM are still recorded).');
    obs = null;
  }
  const machine = await machineInfo(obs);
  writeFileSync(join(RESULTS, `machine-${Date.now()}.json`), JSON.stringify(machine, null, 2));
  const plan = [];
  if (arg('all', false)) {
    for (const c of ['A', 'B', 'C']) for (const n of [40, 60, 80]) plan.push({ c, n, scenario: 'normal', minutes: MINUTES });
    for (const c of ['A', 'B', 'C']) plan.push({ c, n: 60, scenario: 'storm', minutes: Math.min(MINUTES, 2) });
    if (!arg('no-video', false)) for (const c of ['A', 'B', 'C']) plan.push({ c, n: 60, scenario: 'normal', minutes: 1, record: true });
  } else {
    const c = String(arg('config', 'A')).toUpperCase();
    for (const n of String(arg('n', '60')).split(',').map(Number)) plan.push({ c, n, scenario: String(arg('scenario', 'normal')), minutes: MINUTES, record: !!arg('record', false) });
  }
  const est = plan.reduce((a, p) => a + p.minutes + WARMUP_S / 60 + 0.2, 0);
  console.log(`${plan.length} runs, about ${Math.round(est)} minutes. Keep the PC plugged in and do not use it during the runs.`);
  const results = [];
  for (const p of plan) {
    try { results.push(await runOne(obs, p.c, p.n, p.scenario, p.minutes, machine, { record: p.record })); }
    catch (e) { console.log(`  ERROR: ${e.message}`); results.push({ runId: `${p.c}-n${p.n}-${p.scenario}`, error: e.message }); }
  }
  const table = results.map((r) => r.error ? `${r.runId}: ERROR ${r.error}` :
    `${r.config} n=${r.n} ${r.scenario}${r.recording ? ' (video)' : ''}: ${r.summary.avgFps} fps, p95 ${r.summary.frameMs.p95} ms, OBS skipped ${r.summary.obs.skippedPct}%, CPU ${r.summary.cpu.totalAvg}% -> ${r.pass ? 'PASS' : 'FAIL'}`);
  writeFileSync(join(RESULTS, `summary-${Date.now()}.txt`), table.join('\n') + '\n');
  console.log('\n' + table.join('\n'));
  console.log(`\nDone. Results are in ${RESULTS}. Run 4_collect.bat and send the zip.`);
  server.close();
  process.exit(0);
}
