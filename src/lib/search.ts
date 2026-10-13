export interface SearchEntry {
  title: string;
  url: string;
  kind: string;
  summary: string;
  text: string;
  protocol?: string;
}

export function filterEntries(entries: SearchEntry[], query: string, kind: string): SearchEntry[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = entries.filter((entry) => kind === 'all' || entry.kind === kind);
  if (terms.length === 0) {
    return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }

  return filtered
    .map((entry) => ({ entry, score: scoreEntry(entry, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .map((item) => item.entry);
}

function scoreEntry(entry: SearchEntry, terms: string[]): number {
  const title = entry.title.toLowerCase();
  const summary = entry.summary.toLowerCase();
  const text = entry.text.toLowerCase();
  let score = 0;
  for (const term of terms) {
    const inTitle = title.includes(term);
    const inSummary = summary.includes(term);
    const inText = text.includes(term);
    if (!inTitle && !inSummary && !inText) return 0;
    if (inTitle) score += 5;
    else if (inSummary) score += 3;
    else score += 1;
  }
  return score;
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
