import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { redirectedHome } from '../src/lib/links';

const root = join(import.meta.dirname, '..');
const content = join(root, 'src/content');
const urls = new Set<string>();

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!entry.endsWith('.md')) continue;
    const text = readFileSync(path, 'utf8');
    for (const match of text.matchAll(/https:\/\/[^\s)"']+/g)) {
      const url = match[0];
      if (url) urls.add(url.replace(/[.,]$/, ''));
    }
  }
}

walk(content);

const results: { url: string; status: string }[] = [];
const queue = [...urls];
const workers = Array.from({ length: 4 }, async () => {
  while (queue.length > 0) {
    const url = queue.shift();
    if (!url) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'ProtocolAnatomyLinkCheck/1.0' },
      });
      const landed = new URL(response.url || url);
      const sentHome = response.ok && redirectedHome(url, landed.href);
      const kind = sentHome
        ? 'broken'
        : response.status === 404 || response.status === 410
          ? 'broken'
          : response.status === 401 || response.status === 403
            ? 'restricted'
            : response.status === 429
              ? 'rate-limited'
              : response.ok
                ? 'ok'
                : `http-${response.status}`;
      results.push({ url, status: sentHome ? `broken redirected to ${landed.origin}/` : `${kind} ${response.status}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'network error';
      results.push({ url, status: `temporary ${message}` });
    } finally {
      clearTimeout(timer);
    }
  }
});

await Promise.all(workers);
results.sort((a, b) => a.status.localeCompare(b.status) || a.url.localeCompare(b.url));
const report = join(root, 'link-report.json');
writeFileSync(report, JSON.stringify(results, null, 2));
const broken = results.filter((item) => item.status.startsWith('broken'));
console.log(`Checked ${results.length} URLs. Broken: ${broken.length}. Report: link-report.json`);
for (const item of results) console.log(`${item.status}\t${item.url}`);
if (broken.length > 0) process.exit(1);
