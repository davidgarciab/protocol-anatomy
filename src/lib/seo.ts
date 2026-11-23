/** Search engines cut a title near 60 characters. Keep the brand only when it fits. */
export const TITLE_BUDGET = 60;

export function pageTitle(title: string, siteName: string): string {
  if (title.startsWith(siteName)) return title;
  const withBrand = `${title} · ${siteName}`;
  return withBrand.length <= TITLE_BUDGET ? withBrand : title;
}

/**
 * A snippet-sized description built from whole sentences. Search results show
 * about 155 characters, so the text stops at the last sentence that fits and
 * falls back to a word boundary with an ellipsis.
 */
export function snippet(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const sentences = clean.match(/[^.!?]+[.!?]+(?=\s|$)/g) ?? [];
  let out = '';
  for (const sentence of sentences) {
    const next = `${out}${out ? ' ' : ''}${sentence.trim()}`;
    if (next.length > max) break;
    out = next;
  }
  if (out.length >= 110) return out;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:]$/, '')}…`;
}
