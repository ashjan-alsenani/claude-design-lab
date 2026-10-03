/**
 * Lists which lessons have an animated explainer (src/data/explain/<subject>/<unit>/*.ts)
 * into src/data/explain/lessons.json, so buttons only appear where an explainer exists.
 * Runs before every build.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../src/data/explain/', import.meta.url).pathname;
const only = process.env.EXPLAIN_FILES ? new Set(process.env.EXPLAIN_FILES.split(',')) : null;
const lessons = new Set();
for (const subject of readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory()))
  for (const unit of readdirSync(join(ROOT, subject)).filter((d) => statSync(join(ROOT, subject, d)).isDirectory()))
    for (const f of readdirSync(join(ROOT, subject, unit)).filter((x) => x.endsWith('.ts'))) {
      if (only && !only.has(`${subject}/${unit}/${f}`)) continue;
      for (const m of readFileSync(join(ROOT, subject, unit, f), 'utf8').matchAll(/^\s{2,6}lesson:\s*'([^']+)'/gm)) lessons.add(m[1]);
    }
writeFileSync(join(ROOT, 'lessons.json'), JSON.stringify([...lessons].sort(), null, 1) + '\n');
console.log(`explainers: ${lessons.size} lesson(s)`);
