/**
 * Database tasks (uses DATABASE_URL):
 *
 *   npm run db:migrate                          apply migrations
 *   npm run db:seed -- --sample                 load the fictional sample data into an EMPTY database
 *   npm run db:seed -- --empty                  start an EMPTY database with no employees (settings only)
 *   npm run db:seed -- --file backup.json       load a backup downloaded from the old site into an EMPTY database
 *   npm run db:seed -- --file backup.json --replace --yes
 *                                               replace what's there (the change is recorded in change_log)
 *   npm run db:export -- --out backup.json      write the current data in the same backup format
 *   node server-dist/tools/db.js reset --yes    drop all tables (local and test databases only)
 *
 * Add --doc vendors to work on the vendors workspace instead of the main directory.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { migrate, pool } from '../server/src/db.js';
import { DOCS, emptyData, sampleData, seed, type DocId } from '../server/src/state.js';
import { join } from '../src/shared/parts.js';
import { config } from '../server/src/config.js';

const [cmd, ...rest] = process.argv.slice(2);
const flag = (k: string) => rest.includes(k);
const opt = (k: string) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : undefined; };
const doc = (opt('--doc') || 'main') as DocId;
if (!(DOCS as readonly string[]).includes(doc)) throw new Error('--doc must be main or vendors');

async function main() {
  if (cmd === 'migrate') { console.log('applied:', (await migrate()).join(', ') || 'nothing new'); return; }

  if (cmd === 'seed') {
    await migrate();
    let data, label;
    if (flag('--sample')) { data = sampleData(); label = 'sample'; }
    else if (flag('--empty')) { data = emptyData(); label = 'empty'; }
    else if (opt('--file')) {
      const raw = JSON.parse(readFileSync(opt('--file')!, 'utf8'));
      data = raw && raw.data && raw.app === 'dtd-directory' ? raw.data : raw;
      if (!data || !Array.isArray(data.employees)) throw new Error('This file is not a directory backup (no employees list).');
      label = `backup (${data.employees.length} employees)`;
    } else throw new Error('choose --sample, --empty or --file <backup.json>');
    const replace = flag('--replace');
    if (replace && !flag('--yes')) throw new Error('--replace deletes the current data for this workspace; add --yes to confirm');
    const ok = await seed(doc, data, 'tools/db seed', replace);
    console.log(ok ? `loaded ${label} into "${doc}"` : `"${doc}" already has data; nothing changed (use --replace --yes to overwrite)`);
    return;
  }

  if (cmd === 'export') {
    const r = await pool.query('SELECT part, value FROM doc_parts WHERE doc = $1', [doc]);
    const data = join(new Map(r.rows.map(x => [x.part, x.value])));
    const out = opt('--out') || `employee-directory-${doc}-${new Date().toISOString().slice(0, 10)}.json`;
    writeFileSync(out, JSON.stringify({ app: 'dtd-directory', version: 1, savedAt: new Date().toISOString(), data }));
    console.log(`wrote ${out} (${r.rowCount} parts). It contains confidential HR data: store it accordingly.`);
    return;
  }

  if (cmd === 'reset') {
    if (!flag('--yes')) throw new Error('reset drops every table; add --yes to confirm');
    if (config.production) throw new Error('reset is refused when NODE_ENV=production');
    await pool.query('DROP TABLE IF EXISTS doc_parts, change_log, "session", schema_migrations CASCADE');
    console.log('all tables dropped');
    return;
  }
  throw new Error('usage: db.js migrate | seed | export | reset (see the top of tools/db.ts)');
}

main().then(() => pool.end()).catch(e => { console.error(e.message); pool.end(); process.exit(1); });
