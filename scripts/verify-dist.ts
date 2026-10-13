import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(import.meta.dirname, '..', 'dist');
const required = [
  'index.html',
  'protocols/index.html',
  'protocols/aave/index.html',
  'protocols/uniswap/index.html',
  'protocols/maker-sky/index.html',
  'protocols/curve/index.html',
  'protocols/lido/index.html',
  'guides/aave-versions/index.html',
  'guides/uniswap-versions/index.html',
  'guides/maker-to-sky/index.html',
  'guides/curve-generations/index.html',
  'guides/lido-exits/index.html',
  'concepts/index.html',
  'concepts/constant-product/index.html',
  'glossary/index.html',
  'methodology/index.html',
  'sources/index.html',
  'search/index.html',
  '404.html',
  'robots.txt',
  'sitemap-index.xml',
];

const errors: string[] = [];
for (const file of required) {
  const path = join(dist, file);
  if (!existsSync(path)) errors.push(`Missing ${file}`);
}

function read(file: string): string {
  return readFileSync(join(dist, file), 'utf8');
}

if (existsSync(join(dist, 'index.html'))) {
  const home = read('index.html');
  for (const text of ['Protocol Anatomy', 'Understand the code. Follow the money. Trace the evolution.', 'https://protocols.davidgarciab.com']) {
    if (!home.includes(text)) errors.push(`Homepage is missing ${text}`);
  }
  if (/canonical" href="http:\/\/localhost/.test(home)) errors.push('Homepage canonical points at localhost');
}

for (const protocol of ['aave', 'uniswap', 'maker-sky', 'curve', 'lido']) {
  const file = `protocols/${protocol}/index.html`;
  if (!existsSync(join(dist, file))) continue;
  const html = read(file);
  if (!html.includes('Sources')) errors.push(`${file} is missing its source list`);
  if (html.includes('TODO') || html.includes('lorem ipsum')) errors.push(`${file} contains placeholder text`);
  const canonical = `https://protocols.davidgarciab.com/protocols/${protocol}/`;
  if (!html.includes(`rel="canonical" href="${canonical}"`)) {
    errors.push(`${file} canonical is not ${canonical}`);
  }
}

if (existsSync(join(dist, '404.html'))) {
  const missing = read('404.html');
  if (!missing.includes('noindex')) errors.push('404 page is not marked noindex');
}

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (entry.endsWith('.html')) files.push(path);
  }
  return files;
}

if (existsSync(dist)) {
  for (const file of walk(dist)) {
    const html = readFileSync(file, 'utf8');
    if (/rel="canonical" href="[^"]*localhost/.test(html)) {
      errors.push(`Canonical localhost URL in ${file}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Verified ${required.length} built routes.`);
