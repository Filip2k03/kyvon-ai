// Dependency-free checks for the maintained engineering documentation graph.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
function markdownFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(dir, entry.name);
    return entry.isDirectory() ? markdownFiles(path) : entry.name.endsWith('.md') ? [path] : [];
  });
}
const files = ['AGENTS.md', 'CLAUDE.md', 'CODEX.md', 'SKILLS.md', 'readme.md',
  'chat/CLAUDE.md', 'chat/README.md', 'chat/V2_RELEASE.md', 'chat/deploy/TURN.md', 'meet/CLAUDE.md', 'meet/AGENTS.md'].map(p => resolve(root, p))
  .concat(markdownFiles(resolve(root, 'docs')), markdownFiles(resolve(root, '.agent')));
const errors = [];
let links = 0;
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const label = relative(root, file);
  const fences = content.match(/^```/gm) ?? [];
  if (fences.length % 2) errors.push(`${label}: unmatched code fence`);
  if (/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/.test(content)
      || /\b(?:ghp_|glpat-)[A-Za-z0-9_-]{16,}/.test(content)
      || /postgres(?:ql)?:\/\/[^\s/:]+:[^\s@]+@/.test(content)) {
    errors.push(`${label}: credential-like content; review privately`);
  }
  for (const match of content.matchAll(/\[[^\]\n]*\]\((<[^>]+>|[^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = match[1].replace(/^<|>$/g, '');
    if (/^(?:https?:|mailto:)/.test(target)) continue;
    links++;
    const [path, fragment] = target.split('#');
    const absolute = path ? resolve(dirname(file), decodeURIComponent(path)) : file;
    if (!existsSync(absolute)) {
      errors.push(`${label}: missing link ${target}`);
      continue;
    }
    if (fragment && statSync(absolute).isFile() && absolute.endsWith('.md')) {
      const headings = [...readFileSync(absolute, 'utf8').matchAll(/^#{1,6}\s+(.+)$/gm)]
        .map(m => m[1].toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-'));
      if (!headings.includes(decodeURIComponent(fragment))) errors.push(`${label}: missing fragment ${target}`);
    }
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else console.log(`VERIFIED: ${files.length} Markdown files, ${links} local links, balanced fences, no matched credential patterns.`);
