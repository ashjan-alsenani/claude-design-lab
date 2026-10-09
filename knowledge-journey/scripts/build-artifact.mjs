// Builds one self-contained HTML file (CSS, JS and fonts inlined) for the claude.ai artifact viewer.
// Usage: npm run build:artifact -- <out-dir>   (default: dist-artifact)
import { build } from 'vite';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const root = process.cwd();
const out = process.argv[2] ?? join(root, 'dist-artifact');
process.env.VITE_ARTIFACT = '1';
const dist = join(out, 'dist');
await build({ root, configFile: join(root, 'vite.config.ts'), logLevel: 'warn',
  build: { outDir: dist, emptyOutDir: true, assetsInlineLimit: 100_000_000, cssCodeSplit: false, modulePreload: false } });
const assets = join(dist, 'assets');
const files = readdirSync(assets);
let css = files.filter(f => f.endsWith('.css')).map(f => readFileSync(join(assets, f), 'utf8')).join('\n');
// keep only the woff2 source of each face
css = css.replace(/,url\(data:font\/woff;base64,[^)]*\) format\("woff"\)/g, '');
const js = files.filter(f => f.endsWith('.js')).map(f => readFileSync(join(assets, f), 'utf8')).join('\n');
const favicon = readFileSync(join(root, 'public/favicon.svg'), 'utf8');
const html = `<title>رحلة إلى كنوز المعرفة</title>
<meta name="description" content="مغامرة تعليمية تفاعلية لدرس «من مصادر التشريع الإسلامي (1)».">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${Buffer.from(favicon).toString('base64')}">
<style>${css}</style>
<script>try{document.documentElement.lang='ar';document.documentElement.dir='rtl';}catch(e){}</script>
<div id="root" dir="rtl" lang="ar"></div>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>
`;
writeFileSync(join(out, 'knowledge-journey.html'), html);
console.log('bytes', html.length, 'css', css.length, 'js', js.length);
