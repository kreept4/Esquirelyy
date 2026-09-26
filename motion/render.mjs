// Render index.html with Playwright.
//
//   node render.mjs beats              one frame per beat -> out/beats/, plus per-bar strips
//   node render.mjs frames 3.2 3.25    specific times -> out/frames/
//   node render.mjs full [workers]     60 fps, 4 subframes per frame blended with
//                                      ffmpeg tmix for motion blur -> out/video.mp4
//
// Frames are pure functions of time (see seek() in index.html), so workers can
// render disjoint ranges in any order and the result is identical.
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright'))); }

const HERE = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(HERE, 'out');
const FPS = 60, SUB = 4, SIZE = 1440;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.json': 'application/json', '.png': 'image/png' };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(HERE, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!p.startsWith(HERE) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(rsp);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}

async function openPage(browser, port) {
  const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html?render=1`);
  await page.evaluate(() => window.ready);
  return page;
}

async function shoot(page, t, file) {
  await page.evaluate(t => window.seek(t), t);
  return page.screenshot({ type: 'png', path: file, animations: 'disabled', caret: 'hide' });
}

function ffmpeg(args) {
  const proc = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => proc.on('exit', c => (c === 0 ? res() : rej(new Error('ffmpeg exited ' + c)))));
  proc.stdin.on('error', () => {});
  done.proc = proc;
  return done;
}

async function main() {
  const [mode = 'beats', ...rest] = process.argv.slice(2);
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve();
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'] });
  try {
    const page = await openPage(browser, port);
    const meta = await page.evaluate(() => ({ cues: window.CUES, loop: window.LOOP, beats: window.BEATS }));
    fs.writeFileSync(path.join(HERE, 'audio', 'cues.json'), JSON.stringify(meta.cues, null, 1));

    if (mode === 'beats') {
      const dir = path.join(OUT, 'beats'); fs.mkdirSync(dir, { recursive: true });
      const B = meta.beats.beat, D0 = ((meta.beats.offset % (4 * B)) + 6 * B) % (4 * B) - 2 * B;
      const settle = parseFloat(rest[0] ?? '0.4');
      for (let k = 1; k <= meta.beats.beats; k++) {
        await shoot(page, D0 + (k - 1) * B + settle, path.join(dir, `beat${String(k).padStart(2, '0')}.png`));
      }
      for (let bar = 0; bar < meta.beats.bars; bar++) {
        const ins = [0, 1, 2, 3].flatMap(i => ['-i', path.join(dir, `beat${String(bar * 4 + i + 1).padStart(2, '0')}.png`)]);
        await ffmpeg([...ins, '-filter_complex', '[0][1][2][3]hstack=4,scale=2400:-1', path.join(dir, `bar${bar + 1}.png`)]);
      }
      console.log('beats ->', dir);
    } else if (mode === 'frames') {
      const dir = path.join(OUT, 'frames'); fs.mkdirSync(dir, { recursive: true });
      for (const t of rest.map(Number)) await shoot(page, t, path.join(dir, `t${t.toFixed(3)}.png`));
      console.log('frames ->', dir);
    } else if (mode === 'full') {
      const workers = parseInt(rest[0] ?? String(Math.max(1, os.cpus().length)), 10);
      const frames = Math.round(meta.loop * FPS);
      const per = Math.ceil(frames / workers);
      const t0 = Date.now();
      let done = 0;
      await Promise.all(Array.from({ length: workers }, async (_, w) => {
        const f0 = w * per, f1 = Math.min(frames, f0 + per);
        if (f0 >= f1) return;
        const pg = w === 0 ? page : await openPage(browser, port);
        const chunk = path.join(OUT, `chunk${w}.mkv`);
        // tmix averages the last SUB inputs; keep every SUB-th output so each
        // frame is the mean of exactly its own subframes.
        const ff = ffmpeg(['-f', 'image2pipe', '-framerate', String(FPS * SUB), '-i', '-',
          '-vf', `tmix=frames=${SUB},select='not(mod(n+1\\,${SUB}))',setpts=N/${FPS}/TB`,
          '-r', String(FPS), '-c:v', 'libx264rgb', '-preset', 'veryfast', '-crf', '0', chunk]);
        for (let f = f0; f < f1; f++) {
          for (let k = 0; k < SUB; k++) {
            // subframes straddle the frame time symmetrically: a 360° shutter
            const t = (f + (k - (SUB - 1) / 2) / SUB) / FPS;
            await pg.evaluate(t => window.seek(t), t);
            const buf = await pg.screenshot({ type: 'png' });
            if (!ff.proc.stdin.write(buf)) await new Promise(r => ff.proc.stdin.once('drain', r));
          }
          if (++done % 60 === 0) process.stdout.write(`\r${done}/${frames} frames  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
        }
        ff.proc.stdin.end();
        await ff;
      }));
      console.log(`\nrendered ${frames} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      const list = path.join(OUT, 'chunks.txt');
      fs.writeFileSync(list, Array.from({ length: workers }, (_, w) => `file 'chunk${w}.mkv'`).filter((_, w) => w * per < frames).join('\n'));
      await ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', path.join(OUT, 'video.mkv')]);
      console.log('video ->', path.join(OUT, 'video.mkv'));
    }
  } finally {
    await browser.close();
    srv.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
