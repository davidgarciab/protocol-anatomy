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
  'glossary/tick/index.html',
  'start/index.html',
  'methodology/index.html',
  'sources/index.html',
  'search/index.html',
  'search-index.json',
  'privacy/index.html',
  'about/index.html',
  'changes/index.html',
  'rss.xml',
  '404.html',
  'robots.txt',
  'llms.txt',
  'llms-full.txt',
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
  for (const text of ['Protocol Anatomy', 'How DeFi protocols work, where the money sits, how they change.', 'https://protocols.davidgarciab.com']) {
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

if (existsSync(join(dist, 'search/index.html'))) {
  const search = read('search/index.html');
  if (!search.includes('noindex')) errors.push('Search page is indexable duplicate content');
  if (search.length > 80_000) errors.push(`Search page is ${search.length} bytes; the index belongs in search-index.json`);
}

if (existsSync(join(dist, 'rss.xml'))) {
  const feed = read('rss.xml');
  if (!feed.includes('<link>https://protocols.davidgarciab.com/concepts/constant-product/</link>')) {
    errors.push('rss.xml is missing published articles');
  }
  const guids = [...feed.matchAll(/<guid[^>]*>([^<]+)<\/guid>/g)].map((match) => match[1]);
  if (new Set(guids).size !== guids.length) errors.push('rss.xml has duplicate guids');
}

if (existsSync(join(dist, 'search-index.json'))) {
  const index = JSON.parse(read('search-index.json')) as { url: string; text: string }[];
  if (!index.some((entry) => entry.url === '/protocols/aave/' && entry.text.length > 1000)) {
    errors.push('search-index.json is missing the Aave overview text');
  }
}

if (existsSync(join(dist, 'protocols/aave/index.html'))) {
  const aave = read('protocols/aave/index.html');
  if (!aave.includes('datePublished')) errors.push('Article structured data is missing datePublished');
  if (!aave.includes('BreadcrumbList')) errors.push('Article structured data is missing BreadcrumbList');
  if (!/"author":\{"@type":"Person"/.test(aave)) errors.push('Article structured data is missing a Person author');
}

if (existsSync(dist)) {
  const sitemapFiles = readdirSync(dist).filter((entry) => entry.startsWith('sitemap') && entry.endsWith('.xml'));
  const sitemap = sitemapFiles.map((entry) => read(entry)).join('\n');
  if (!sitemap.includes('https://protocols.davidgarciab.com/protocols/aave/')) {
    errors.push('Sitemap is missing the Aave overview');
  }
  if (sitemap.includes('/search')) errors.push('Sitemap includes the search page');
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

if (existsSync(dist)) {
  const hasKey = Boolean(process.env.PUBLIC_POSTHOG_KEY);
  for (const file of walk(dist)) {
    const html = readFileSync(file, 'utf8');
    if (/<script[^>]+src="[^"]*posthog/i.test(html)) {
      errors.push(`${file} loads PostHog directly; it must load only after consent`);
    }
    const ogImage = html.match(/<meta property="og:image" content="https:\/\/protocols\.davidgarciab\.com\/([^"]+)"/)?.[1];
    if (!ogImage) errors.push(`${file} has no og:image on the production host`);
    else if (!existsSync(join(dist, ogImage))) errors.push(`${file} og:image ${ogImage} was not built`);
    if (!html.includes('content="summary_large_image"')) errors.push(`${file} is not a large-image Twitter card`);
    const csp = html.match(/<meta http-equiv="content-security-policy" content="([^"]*)"/)?.[1];
    if (!csp) errors.push(`${file} has no Content-Security-Policy meta tag`);
    else if (/script-src[^;]*'unsafe-inline'/.test(csp)) errors.push(`${file} allows inline scripts in its CSP`);
    const hasBanner =/<section[^>]+data-consent-banner/.test(html);
    if (hasKey !== hasBanner) {
      errors.push(`${file} ${hasKey ? 'is missing the consent banner' : 'has a consent banner but no PostHog key was set'}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Verified ${required.length} built routes.`);
