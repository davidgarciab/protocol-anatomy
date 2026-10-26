import { getCollection } from 'astro:content';
import { pagePath } from './site';
import type { ContentChange } from './changes';

export interface PublishedPage {
  title: string;
  url: string;
  description: string;
  data: { published: string; changes: ContentChange[] };
}

/** Every article with its site path, for the change log and the feed. */
export async function publishedPages(): Promise<PublishedPage[]> {
  const [protocols, guides, concepts, comparisons, site] = await Promise.all([
    getCollection('protocols'),
    getCollection('guides'),
    getCollection('concepts'),
    getCollection('comparisons'),
    getCollection('site'),
  ]);
  const page = (path: string, entry: { data: PublishedPage['data'] & { title: string; description: string } }) => ({
    title: entry.data.title,
    url: pagePath(path),
    description: entry.data.description,
    data: entry.data,
  });
  return [
    ...protocols.map((entry) => page(`/protocols/${entry.id}`, entry)),
    ...guides.map((entry) => page(`/guides/${entry.id}`, entry)),
    ...concepts.map((entry) => page(`/concepts/${entry.id}`, entry)),
    ...comparisons.map((entry) => page(`/compare/${entry.id}`, entry)),
    ...site.map((entry) => page(`/${entry.id}`, entry)),
  ];
}
