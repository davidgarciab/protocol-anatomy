import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { lastModified } from '../lib/changes';
import { pagePath, SITE } from '../lib/site';

/** The full article text as one plain-text file, for language-model ingestion. */
export const GET: APIRoute = async () => {
  const [protocols, guides, concepts] = await Promise.all([
    getCollection('protocols'),
    getCollection('guides'),
    getCollection('concepts'),
  ]);
  const byOrder = <T extends { data: { order: number } }>(list: T[]) => [...list].sort((a, b) => a.data.order - b.data.order);
  const docs = [
    ...byOrder(protocols).map((entry) => ({ entry, path: `/protocols/${entry.id}` })),
    ...byOrder(guides).map((entry) => ({ entry, path: `/guides/${entry.id}` })),
    ...byOrder(concepts).map((entry) => ({ entry, path: `/concepts/${entry.id}` })),
  ];
  const parts = [`# ${SITE.name}: full text`, '', `> ${SITE.description}`, ''];
  for (const { entry, path } of docs) {
    const { data } = entry;
    parts.push(
      '---',
      '',
      `# ${data.title}`,
      '',
      `URL: ${new URL(pagePath(path), SITE.url).href}`,
      `Published: ${data.published}. Updated: ${lastModified(data)}. Sources last verified: ${data.lastVerified}.`,
      '',
      `Summary: ${data.summary}`,
      '',
      (entry.body ?? '').replace(/<diagram-placeholder[^>]*><\/diagram-placeholder>\n?/g, '').trim(),
      '',
      'Sources:',
      ...data.sources.map((source) => `- ${source.title} (${source.publisher}): ${source.url}`),
      '',
    );
  }
  return new Response(parts.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
