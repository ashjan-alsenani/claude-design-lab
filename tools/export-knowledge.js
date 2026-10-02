#!/usr/bin/env node
/* Writes server/knowledge.json from the site's own content, using the same
   src/app/knowledge.js the page runs. Node only, no packages.
   Usage: node tools/export-knowledge.js   (build.py runs it for you) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = path.join(__dirname, '..', 'src');
const FILES = ['i18n/core.js', 'content/core.js', 'content/lessons-1.js', 'content/lessons-2.js', 'content/lessons-3.js',
  'content/tour.js', 'content/kb.js', 'content/course.js', 'content/c4-deep-1.js', 'content/c4-deep-2.js', 'content/c4-deep-3.js', 'content/courses.js', 'content/en/core.js', 'content/en/lessons-1.js', 'content/en/lessons-2.js',
  'content/en/lessons-3.js', 'app/knowledge.js'];

const ctx = vm.createContext({ console });
// Top-level const/let become context properties so later files can see them.
const code = FILES.map(f => fs.readFileSync(path.join(SRC, f), 'utf8').replace(/^(const|let) /gm, 'var ')).join('\n;\n');
vm.runInContext(code, ctx, { filename: 'site-content.js' });

const out = path.join(__dirname, '..', 'server', 'knowledge.json');
fs.writeFileSync(out, JSON.stringify({ generated_from: 'src/ (lessons, tour, questions, answers, glossary)', records: ctx.Knowledge.records }, null, 1));
console.log('server/knowledge.json written (' + ctx.Knowledge.records.length + ' records)');
