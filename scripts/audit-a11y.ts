import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import axe from 'axe-core';

const dist = join(import.meta.dirname, '..', 'dist');
const pages = [
  'index.html',
  'protocols/aave/index.html',
  'guides/uniswap-versions/index.html',
  'concepts/collateral-and-liquidation/index.html',
  'glossary/index.html',
  'search/index.html',
  'questions/index.html',
  'compare/index.html',
  'compare/amm-pricing-curves/index.html',
  'methodology/index.html',
  'about/index.html',
  'changes/index.html',
  '404.html',
];

function css(): string {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (entry.endsWith('.css')) files.push(readFileSync(path, 'utf8'));
    }
  };
  walk(dist);
  return files.join('\n');
}

const styles = css();
const failures: string[] = [];

for (const page of pages) {
  const path = join(dist, page);
  if (!existsSync(path)) {
    failures.push(`${page} was not built`);
    continue;
  }
  const dom = new JSDOM(readFileSync(path, 'utf8'), { url: 'https://protocols.davidgarciab.com/', runScripts: 'outside-only' });
  const style = dom.window.document.createElement('style');
  style.textContent = styles;
  dom.window.document.head.append(style);
  const results = await axe.run(dom.window.document.documentElement, {
    rules: {
      'color-contrast': { enabled: false },
      region: { enabled: false },
    },
  });
  for (const violation of results.violations) {
    failures.push(`${page}: ${violation.id} — ${violation.help} (${violation.nodes.length})`);
  }
  dom.window.close();
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Accessibility scan passed for ${pages.length} pages (contrast checked separately in the browser).`);
