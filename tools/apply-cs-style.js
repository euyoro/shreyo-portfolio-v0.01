// Inlines tools/cs-style.css into every case-studies/*.html between the
// /* cs:begin */ and /* cs:end */ markers. The overlay in index.html reads each
// page's inline <style>, so the shared stylesheet has to be inlined, not linked.
//
//   node tools/apply-cs-style.js            (all pages)
//   node tools/apply-cs-style.js id-protection rent-reporting
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(__dirname, 'cs-style.css'), 'utf8').trim();
const dir = path.join(root, 'case-studies');
const wanted = process.argv.slice(2);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && (!wanted.length || wanted.includes(f.replace('.html', ''))));

const block = '/* cs:begin: generated from tools/cs-style.css, do not edit here */\n' + css + '\n/* cs:end */';
let changed = 0;
for (const f of files) {
  const p = path.join(dir, f);
  const s = fs.readFileSync(p, 'utf8');
  if (!s.includes('/* cs:begin')) { console.log('skip (no markers):', f); continue; }
  const out = s.replace(/\/\* cs:begin[\s\S]*?\/\* cs:end \*\//, () => block);
  if (out !== s) { fs.writeFileSync(p, out); changed++; }
  console.log('styled:', f);
}
console.log(changed + ' file(s) updated');
