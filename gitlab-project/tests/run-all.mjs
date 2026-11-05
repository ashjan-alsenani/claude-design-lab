// Runs every check in this folder against BASE_URL (default http://127.0.0.1:8080/employee-directory/).
// Each check uses its own fresh browser profile with fictional sample data, so it never touches real data.
import {readdirSync} from 'fs';import {spawnSync} from 'child_process';
const files=readdirSync(new URL('.',import.meta.url)).filter(f=>f.endsWith('.mjs')&&f!=='run-all.mjs').sort();let failed=[];
for(const f of files){process.stdout.write(`\n== ${f}\n`);const r=spawnSync(process.execPath,[f],{cwd:new URL('.',import.meta.url),encoding:'utf8',env:process.env});
 const out=(r.stdout||'')+(r.stderr||'');const fails=out.split('\n').filter(l=>/^FAIL|FAILED|Error/.test(l));process.stdout.write(fails.length?fails.join('\n')+'\n':'all checks passed\n');if(fails.length||r.status)failed.push(f)}
console.log(failed.length?`\n${failed.length} file(s) with failures: ${failed.join(', ')}`:'\nALL FILES PASSED');process.exit(failed.length?1:0);
