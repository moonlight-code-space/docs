import assert from 'node:assert/strict';
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import {join, dirname, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const read = p => readFileSync(join(root, p), 'utf8');
const config = JSON.parse(read('docs.json'));
const pages = config.navigation.languages.flatMap(l => l.groups.flatMap(g => g.pages));
assert.equal(new Set(pages).size, pages.length, 'duplicate navigation page');
const problems = [];
const python = process.env.FARO_DOCS_PYTHON || 'python3.11';
let links = 0, jsonBlocks = 0, pythonBlocks = 0, tomlBlocks = 0;
const report = (page, message) => problems.push(`${page}: ${message}`);
const excluded = new Set(['node_modules', '.git', '.mintlify', 'drafts']);
const scan = (dir = '') => readdirSync(join(root, dir), {withFileTypes:true}).flatMap(entry => {
  if (excluded.has(entry.name)) return [];
  const path = join(dir, entry.name);
  return entry.isDirectory() ? scan(path) : entry.name.endsWith('.mdx') && !entry.name.endsWith('.draft.mdx') ? [path.slice(0, -4)] : [];
});
const publishedPages = scan();
for (const page of pages) if (!publishedPages.includes(page)) report(page, 'missing navigation page');
for (const page of publishedPages) {
  const file = `${page}.mdx`;
  if (!existsSync(join(root, file))) { report(file, 'missing page'); continue; }
  const body = read(file);
  if (/your-package|your-cli|support@yourcompany|Requirement one|Describe how someone/.test(body)) report(file, 'starter template content');
  if (!/^---\n[\s\S]*?title: "[^"\n]+"[\s\S]*?\n---\n/.test(body)) report(file, 'missing title/frontmatter');
  if (!/^description: "[^"\n]+"$/m.test(body)) report(file, 'missing description');
  if ((body.match(/^```/gm) || []).length % 2) report(file, 'unclosed code fence');
  for (const match of body.matchAll(/(?:href="|\]\()((?:\/|\.\/|\.\.\/)[^"\s)#]+)(?:#[^"\s)]*)?["\)]/g)) {
    const href = match[1]; links++;
    const p = href.startsWith('/') ? href.slice(1) : join(dirname(file), href);
    if (![p, `${p}.mdx`, join(p, 'index.mdx')].some(candidate => existsSync(join(root, candidate)))) report(file, `missing local link: ${href}`);
  }
  // Only synthetic placeholders belong in published docs.
  if (/sk-[A-Za-z0-9_-]{20,}/.test(body)) report(file, 'possible API credential');
  if (/154\.37\.|207\.57\.|lyj030107|BEGIN.*PRIVATE KEY|\/opt\/new-api/.test(body)) report(file, 'private operations information');
  for (const [_, indent, lang, raw] of body.matchAll(/^([ \t]*)```(json|python|toml)\n([\s\S]*?)^\1```/gm)) {
    const code = raw.split('\n').map(line => line.startsWith(indent) ? line.slice(indent.length) : line).join('\n');
    try {
      if (lang === 'json') { JSON.parse(code); jsonBlocks++; }
      if (lang === 'python') {
        pythonBlocks++;
        const result = spawnSync(python, ['-c', 'import ast,sys; ast.parse(sys.stdin.read())'], {input: code, encoding:'utf8'});
        if (result.status !== 0) throw Error(result.stderr);
      }
      if (lang === 'toml') {
        tomlBlocks++;
        const result = spawnSync(python, ['-c', 'import tomllib,sys; tomllib.loads(sys.stdin.read())'], {input: code, encoding:'utf8'});
        if (result.status !== 0) throw Error(result.stderr);
      }
    } catch (e) { report(file, `${lang} syntax: ${e.message}`); }
  }
}
for (const asset of [config.logo.light, config.logo.dark, config.favicon]) assert(existsSync(join(root,asset.slice(1))), `missing asset ${asset}`);
console.log(JSON.stringify({navigationPages:pages.length, publishedPages:publishedPages.length, localLinks:links, jsonBlocks, pythonBlocks, tomlBlocks, problems},null,2));
process.exitCode = problems.length ? 1 : 0;
