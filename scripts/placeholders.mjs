#!/usr/bin/env node
// Lists every open placeholder in src/. With --gate, exits non-zero when
// SITE_MODE=production and any placeholder remains, so an unfinished site can't ship.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PLACEHOLDER_RE } from '../src/lib/placeholders.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const SKIP = new Set(['placeholders.mjs', 'remark-placeholders.mjs']);
const found = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(astro|md|mdx|ya?ml|json|ts|mjs)$/.test(name) && !SKIP.has(name)) {
      readFileSync(path, 'utf8').split('\n').forEach((line, i) => {
        for (const m of line.matchAll(PLACEHOLDER_RE)) {
          found.push({ file: relative(ROOT, path), line: i + 1, type: m[1], note: m[2].trim() });
        }
      });
    }
  }
}
walk(join(ROOT, 'src'));

const gate = process.argv.includes('--gate');
const production = process.env.SITE_MODE === 'production';

if (!gate || production) {
  const byType = Object.groupBy(found, (f) => f.type);
  console.log(`\n${found.length} open placeholder(s)\n`);
  for (const [type, items] of Object.entries(byType)) {
    console.log(`■ ${type} (${items.length})`);
    for (const f of items) console.log(`   ${f.file}:${f.line}  ${f.note}`);
  }
}

if (gate && production && found.length) {
  console.error('\n✖ SITE_MODE=production but placeholders remain. Fill them in or build in preview mode.\n');
  process.exit(1);
}
