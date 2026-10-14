import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { unexpectedDraftUrls } from '../src/lib/distribute';
import { SITE, canonicalUrl } from '../src/lib/site';

const root = join(import.meta.dirname, '..');
const arg = process.argv.slice(2).find((item) => !item.startsWith('--'));

if (!arg || arg.split('/').length !== 2) {
  console.error('Usage: pnpm distribute -- <collection>/<id>');
  console.error('Example: pnpm distribute -- concepts/concentrated-liquidity');
  process.exit(1);
}

const [collection, id] = arg.split('/');
const articlePath = join(root, 'src/content', collection, `${id}.md`);
if (!existsSync(articlePath)) {
  console.error(`No article at ${articlePath}`);
  process.exit(1);
}

const raw = readFileSync(articlePath, 'utf8');
const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/);
if (!frontmatter) {
  console.error('Article is missing frontmatter.');
  process.exit(1);
}
const data = parse(frontmatter[1]) as {
  title?: string;
  description?: string;
  sources?: { title?: string; url?: string }[];
};
const body = raw.slice(frontmatter[0].length);
const headings = [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]);
const sourceUrls = (data.sources ?? []).map((source) => source.url).filter((url): url is string => Boolean(url));
const pageUrl = canonicalUrl(`/${collection}/${id}`);
const allowed = new Set([pageUrl, SITE.url, ...sourceUrls]);

console.log(`# Distribution brief: ${data.title ?? id}`);
console.log('');
console.log(`Page: ${pageUrl}`);
console.log(`Description: ${data.description ?? ''}`);
console.log('');
console.log('## Headings');
for (const heading of headings) console.log(`- ${heading}`);
console.log('');
console.log('## Sources the drafts may cite');
for (const source of data.sources ?? []) console.log(`- ${source.title}: ${source.url}`);
console.log('');

const draftPath = join(root, 'distribution', `${id}.md`);
if (!existsSync(draftPath)) {
  console.log(`No drafts at distribution/${id}.md.`);
  console.log('Write the posts there. Use only the page URL and the source URLs above. This command does not publish them.');
  process.exit(0);
}

const draft = readFileSync(draftPath, 'utf8');
const unexpected = unexpectedDraftUrls(draft, allowed);
if (unexpected.length > 0) {
  console.error('Draft URLs are not on the article or its source list:');
  for (const url of unexpected) console.error(`- ${url}`);
  process.exit(1);
}

console.log(draft.trim());
console.log('');
console.log('Drafts cite only this page and its sources. Review them before posting. This command does not publish.');
