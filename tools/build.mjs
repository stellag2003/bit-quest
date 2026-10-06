// Bundles the ES modules and CSS into dist/bitquest.html — a single file that
// works when opened directly from disk (file://), with no server.
// Supports the subset used by this project: named imports and
// `export function|class|const|let`.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const ROOT = resolve('.');
const IMPORT_RE = /^import\s*\{([^}]*)\}\s*from\s*['"](.+?)['"];?\s*$/gm;
const EXPORT_RE = /^export\s+(?:async\s+)?(function\*?|class|const|let)\s+([A-Za-z_$][\w$]*)/gm;

const modules = new Map();
const order = [];

function load(file) {
  if (modules.has(file)) return;
  modules.set(file, null);
  const source = readFileSync(file, 'utf8');
  const deps = [];
  const body = source.replace(IMPORT_RE, (_, names, spec) => {
    const dep = resolve(dirname(file), spec);
    deps.push(dep);
    const bindings = names.split(',').map((n) => n.trim()).filter(Boolean)
      .map((n) => n.replace(/\s+as\s+/, ': '));
    return `const { ${bindings.join(', ')} } = __m[${JSON.stringify(id(dep))}];`;
  });
  deps.forEach(load);
  const exported = [];
  const code = body.replace(EXPORT_RE, (match, kind, name) => {
    exported.push(name);
    return match.replace(/^export\s+/, '');
  });
  if (/^export\s/m.test(code)) throw new Error(`Export não suportado em ${id(file)}`);
  modules.set(file, { code, exported });
  order.push(file);
}

const id = (file) => relative(ROOT, file).replaceAll('\\', '/');

load(join(ROOT, 'src/main.js'));

const bundle = [
  '"use strict";',
  'const __m = Object.create(null);',
  ...order.map((file) => {
    const { code, exported } = modules.get(file);
    return `// ── ${id(file)}\n__m[${JSON.stringify(id(file))}] = (() => {\n${code}\nreturn { ${exported.join(', ')} };\n})();`;
  }),
].join('\n');

let html = readFileSync(join(ROOT, 'index.html'), 'utf8');
html = html.replace(/<link rel="stylesheet" href="(styles\/[^"]+)">/g, (_, href) =>
  `<style>\n${readFileSync(join(ROOT, href), 'utf8')}\n</style>`);
html = html.replace(/<script type="module" src="src\/main\.js"><\/script>/,
  () => `<script>\n${bundle.replaceAll('</script', '<\\/script')}\n</script>`);

mkdirSync(join(ROOT, 'dist'), { recursive: true });
writeFileSync(join(ROOT, 'dist/bitquest.html'), html);
console.log(`dist/bitquest.html gerado (${order.length} módulos, ${(html.length / 1024).toFixed(0)} KB)`);

// Claude Artifact variant: the host supplies <html>/<head>/<body> and pads :root
// by the phone's safe-area insets, so the console sizes to 100% instead of 100dvh.
const head = html.slice(html.indexOf('<title>'), html.indexOf('</head>'));
const body = html.slice(html.indexOf('<body>') + '<body>'.length, html.indexOf('</body>'));
const artifactFixes = `<style>
html, body { height: 100%; }
.console { height: min(100%, 900px); padding-top: 8px; padding-bottom: 10px; }
@media (max-width: 480px) { .console { height: 100%; } }
@media (orientation: landscape) and (max-height: 540px) { .console { height: 100%; } }
</style>`;
writeFileSync(join(ROOT, 'dist/bitquest-artifact.html'), `${head}\n${artifactFixes}\n${body}`);
console.log('dist/bitquest-artifact.html gerado (versão para Claude Artifact)');
