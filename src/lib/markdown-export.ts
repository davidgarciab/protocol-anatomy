import { lastModified, type ContentChange } from './changes';
import { pagePath, SITE } from './site';

interface ExportableData {
  title: string;
  summary: string;
  published: string;
  lastVerified: string;
  changes: ContentChange[];
  sources: { title: string; publisher: string; url: string }[];
  faq: { question: string; answer: string }[];
}

interface Exportable {
  data: ExportableData;
  body?: string;
}

/** An article as clean Markdown: header facts, summary, body, questions and sources. */
export function articleMarkdown(entry: Exportable, path: string): string {
  const { data } = entry;
  const url = new URL(pagePath(path), SITE.url).href;
  const body = (entry.body ?? '')
    .replace(/<diagram-placeholder[^>]*><\/diagram-placeholder>\n?/g, '')
    // Site-relative links become absolute so the text still works when read away from the site.
    .replace(/\]\(\//g, `](${SITE.url}/`)
    .trim();
  const lines = [
    `# ${data.title}`,
    '',
    `URL: ${url}`,
    `Published: ${data.published}. Updated: ${lastModified(data)}. Sources last verified: ${data.lastVerified}.`,
    '',
    `Summary: ${data.summary}`,
    '',
    body,
    '',
  ];
  if (data.faq.length > 0) {
    lines.push('## Questions', '');
    for (const item of data.faq) lines.push(`**${item.question}**`, '', item.answer, '');
  }
  lines.push('## Sources', '', ...data.sources.map((source) => `- ${source.title} (${source.publisher}): ${source.url}`), '');
  return lines.join('\n');
}

export function markdownResponse(text: string): Response {
  return new Response(text, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
