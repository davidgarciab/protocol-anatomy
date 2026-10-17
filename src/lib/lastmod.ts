import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

const contentRoot = join(import.meta.dirname, '../content');
const collections = ['protocols', 'guides', 'concepts', 'site'] as const;

/** Last substantive change per site path, from the same rule as `lastModified` in changes.ts. */
export function lastModifiedByPath(): Map<string, string> {
  const dates = new Map<string, string>();
  const newest: Record<string, string> = {};
  let overall = '';
  for (const collection of collections) {
    const dir = join(contentRoot, collection);
    for (const file of readdirSync(dir).filter((name) => name.endsWith('.md'))) {
      const raw = readFileSync(join(dir, file), 'utf8');
      const end = raw.indexOf('\n---\n', 3);
      const data = parse(raw.slice(4, end)) as { published: string | Date; changes?: { date: string | Date }[] };
      const day = (value: string | Date) => (value instanceof Date ? value.toISOString().slice(0, 10) : value);
      const modified = [day(data.published), ...(data.changes ?? []).map((change) => day(change.date))].sort().at(-1) ?? '';
      const id = file.replace(/\.md$/, '');
      dates.set(collection === 'site' ? `/${id}/` : `/${collection}/${id}/`, modified);
      if (modified > (newest[collection] ?? '')) newest[collection] = modified;
      if (modified > overall) overall = modified;
    }
  }
  for (const collection of ['protocols', 'guides', 'concepts'] as const) dates.set(`/${collection}/`, newest[collection]);
  dates.set('/', overall);
  dates.set('/changes/', overall);
  return dates;
}
