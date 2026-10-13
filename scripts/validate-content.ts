import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import GithubSlugger from 'github-slugger';
import { glossary } from '../src/data/glossary';
import { diagramNames } from '../src/diagrams/registry';
import {
  REQUIRED_CONCEPTS,
  REQUIRED_GUIDES,
  REQUIRED_PROTOCOLS,
  missingRequired,
  validateDocument,
  type Catalog,
  type CheckedDocument,
} from '../src/lib/content-rules';

const root = join(import.meta.dirname, '..');
const contentRoot = join(root, 'src/content');

const collections = ['protocols', 'guides', 'concepts', 'site'] as const;

function normalizeYaml(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(normalizeYaml);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) out[key] = normalizeYaml(item);
    return out;
  }
  return value;
}

function readDocs(): CheckedDocument[] {
  const docs: CheckedDocument[] = [];
  for (const collection of collections) {
    const dir = join(contentRoot, collection);
    for (const file of readdirSync(dir).filter((name) => name.endsWith('.md'))) {
      const raw = readFileSync(join(dir, file), 'utf8');
      if (!raw.startsWith('---\n')) throw new Error(`${collection}/${file} is missing frontmatter`);
      const end = raw.indexOf('\n---\n', 3);
      if (end === -1) throw new Error(`${collection}/${file} has unclosed frontmatter`);
      const data = normalizeYaml(parse(raw.slice(4, end))) as Record<string, unknown>;
      docs.push({
        collection,
        id: file.replace(/\.md$/, ''),
        data,
        body: raw.slice(end + 5),
      });
    }
  }
  return docs;
}

function headingsFor(markdown: string): Set<string> {
  const slugger = new GithubSlugger();
  const headings = new Set<string>();
  const source = markdown.replace(/```[\s\S]*?```/g, '');
  for (const match of source.matchAll(/^#{2,3}\s+(.+)$/gm)) {
    const text = match[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
    headings.add(slugger.slug(text));
  }
  return headings;
}

function pathFor(doc: CheckedDocument): string {
  if (doc.collection === 'site') return `/${doc.id}`;
  return `/${doc.collection}/${doc.id}`;
}

const docs = readDocs();
const catalog: Catalog = {
  protocols: new Set(docs.filter((doc) => doc.collection === 'protocols').map((doc) => doc.id)),
  guides: new Set(docs.filter((doc) => doc.collection === 'guides').map((doc) => doc.id)),
  concepts: new Set(docs.filter((doc) => doc.collection === 'concepts').map((doc) => doc.id)),
  glossary: new Set(glossary.map((entry) => entry.id)),
  diagrams: diagramNames,
  paths: new Set(['/', '/protocols', '/guides', '/concepts', '/glossary', '/methodology', '/sources', '/search']),
  headings: new Map([['/glossary', new Set(glossary.map((entry) => entry.id))]]),
};

for (const doc of docs) {
  const path = pathFor(doc);
  catalog.paths.add(path);
  catalog.headings.set(path, headingsFor(doc.body));
}

const errors = [
  ...missingRequired(REQUIRED_PROTOCOLS, catalog.protocols, 'protocol'),
  ...missingRequired(REQUIRED_GUIDES, catalog.guides, 'guide'),
  ...missingRequired(REQUIRED_CONCEPTS, catalog.concepts, 'concept'),
  ...docs.flatMap((doc) => validateDocument(doc, catalog)),
];

const ids = docs.map((doc) => `${doc.collection}/${doc.id}`);
const seen = new Set<string>();
for (const id of ids) {
  if (seen.has(id)) errors.push(`Duplicate document ${id}`);
  seen.add(id);
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Validated ${docs.length} articles, ${glossary.length} glossary entries, and ${diagramNames.size} diagrams.`);
