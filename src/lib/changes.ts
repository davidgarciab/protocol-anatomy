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
    entries.push({ date: page.data.published, kind: 'published', title: page.title, url: page.url, summary: page.description });
    for (const change of page.data.changes ?? []) {
      entries.push({ date: change.date, kind: 'updated', title: page.title, url: page.url, summary: change.summary });
    }
  }
  return entries.sort(
    (a, b) => b.date.localeCompare(a.date) || (a.kind === b.kind ? a.title.localeCompare(b.title) : a.kind === 'updated' ? -1 : 1),
  );
}
