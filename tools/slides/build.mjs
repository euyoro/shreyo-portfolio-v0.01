// Render case-study carousel slides.
//
//   node tools/slides/build.mjs <specs.json> [--webp <case-study-key>]
//
// Each spec in the file is composed by tools/slides/compose.html, rendered by
// headless Chrome at exactly spec.w x spec.h, and written to tools/slides/out.
// With --webp, the render is also emitted as the -1200/-2000 pair that the
// carousel's {set:...} slides expect, straight into assets/case-studies/<key>/.
//
// No npm dependencies: Chrome does the compositing, ffmpeg does the encoding.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(ROOT, 'tools/slides/out');
const TEMPLATE = path.join(ROOT, 'tools/slides/compose.html');

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  path.join(os.homedir(), 'AppData/Local/Google/Chrome/Application/chrome.exe'),
].find(p => fs.existsSync(p));
if (!CHROME) { console.error('Chrome not found.'); process.exit(1); }

const [specPath, ...rest] = process.argv.slice(2);
if (!specPath) { console.error('usage: build.mjs <specs.json> [--webp <key>]'); process.exit(1); }
const webpKey = rest.includes('--webp') ? rest[rest.indexOf('--webp') + 1] : null;

const specs = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const list = Array.isArray(specs) ? specs : [specs];
const template = fs.readFileSync(TEMPLATE, 'utf8');
fs.mkdirSync(OUT, { recursive: true });

// Chrome loads the composed page from a temp file, so every image reference has
// to be absolute — relative paths in a spec are resolved against the spec file.
const specDir = path.dirname(path.resolve(specPath));
const fileUrl = p => 'file:///' + path.resolve(specDir, p).replace(/\\/g, '/');

for (const spec of list) {
  for (const key of ['devices', 'fragments', 'plates'])
    for (const item of spec[key] || []) item.src = fileUrl(item.src);

  // Deck slides keep their markup in a sibling .html fragment rather than as
  // an unreadable one-line string inside the JSON.
  if (spec.htmlFile)
    spec.html = fs.readFileSync(path.resolve(specDir, spec.htmlFile), 'utf8');

  const html = template.replace('__SPEC__', JSON.stringify(spec).replace(/</g, '\\u003c'));
  const tmp = path.join(os.tmpdir(), `slide-${spec.id}-${Date.now()}.html`);
  fs.writeFileSync(tmp, html, 'utf8');

  const png = path.join(OUT, `${spec.id}.png`);
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1',
    // advances virtual time until the page goes quiet, so webfonts and image
    // decodes are done before the frame is captured
    '--virtual-time-budget=15000',
    `--window-size=${spec.w},${spec.h}`,
    `--screenshot=${png}`,
    'file:///' + tmp.replace(/\\/g, '/'),
  ], { stdio: 'pipe' });
  fs.unlinkSync(tmp);

  let line = `${spec.id}.png  ${spec.w}x${spec.h}`;

  if (webpKey) {
    const dir = path.join(ROOT, 'assets/case-studies', webpKey);
    fs.mkdirSync(dir, { recursive: true });
    for (const width of [2000, 1200]) {
      const dest = path.join(dir, `${spec.id}-${width}.webp`);
      execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', png,
        '-vf', `scale=${width}:-1:flags=lanczos`,
        '-c:v', 'libwebp', '-quality', '84', '-compression_level', '6', dest], { stdio: 'pipe' });
    }
    // the slide entry expects intrinsic dimensions of the 2000-wide variant
    const h2000 = Math.round(2000 * spec.h / spec.w);
    line += `  ->  {set:'assets/case-studies/${webpKey}/${spec.id}',w:2000,h:${h2000},alt:"..."}`;
  }

  console.log(line);
}
