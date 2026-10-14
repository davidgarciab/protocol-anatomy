export interface ContentChange {
  date: string;
  summary: string;
}

export interface ChangeLogEntry {
  date: string;
  kind: 'published' | 'updated';
  title: string;
  url: string;
  summary: string;
  /** Unique per page: the feed guid is the page URL plus this id. */
  id: string;
}

interface Dated {
  published: string;
  changes?: ContentChange[];
}

/** The last substantive content change. A new lastVerified date alone does not count. */
export function lastModified(data: Dated): string {
  return (data.changes ?? []).reduce((latest, change) => (change.date > latest ? change.date : latest), data.published);
}

/** One entry per publication and per recorded change, newest first. */
export function changeLog(pages: { title: string; url: string; description: string; data: Dated }[]): ChangeLogEntry[] {
  const entries: ChangeLogEntry[] = [];
  for (const page of pages) {
    entries.push({
      date: page.data.published,
      kind: 'published',
      title: page.title,
      url: page.url,
      summary: page.description,
      id: `published-${page.data.published}`,
    });
    const seen = new Map<string, number>();
    for (const change of page.data.changes ?? []) {
      const count = (seen.get(change.date) ?? 0) + 1;
      seen.set(change.date, count);
      const id = `updated-${change.date}${count > 1 ? `-${count}` : ''}`;
      entries.push({ date: change.date, kind: 'updated', title: page.title, url: page.url, summary: change.summary, id });
    }
  }
  return entries.sort(
    (a, b) => b.date.localeCompare(a.date) || (a.kind === b.kind ? a.title.localeCompare(b.title) : a.kind === 'updated' ? -1 : 1),
  );
}
