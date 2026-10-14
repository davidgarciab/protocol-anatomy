import { getCollection } from 'astro:content';
import { glossary } from '../data/glossary';
import { pagePath } from './site';
import { stripMarkdown, type SearchEntry } from './search';

/** Every published page and glossary term, with article text for the client-side filter. */
export async function buildSearchEntries(): Promise<SearchEntry[]> {
  const protocols = await getCollection('protocols');
  const guides = await getCollection('guides');
  const concepts = await getCollection('concepts');

  return [
    ...protocols.map((entry) => ({
      title: entry.data.title,
      url: pagePath(`/protocols/${entry.id}`),
      kind: 'Protocol',
      summary: entry.data.summary,
      text: stripMarkdown(`${entry.data.title} ${entry.data.summary} ${entry.data.tags.join(' ')} ${entry.body ?? ''}`),
      protocol: entry.data.title,
    })),
    ...guides.map((entry) => ({
      title: entry.data.title,
      url: pagePath(`/guides/${entry.id}`),
      kind: 'Guide',
      summary: entry.data.summary,
      text: stripMarkdown(`${entry.data.title} ${entry.data.summary} ${entry.data.tags.join(' ')} ${entry.body ?? ''}`),
      protocol: entry.data.protocol,
    })),
    ...concepts.map((entry) => ({
      title: entry.data.title,
      url: pagePath(`/concepts/${entry.id}`),
      kind: 'Concept',
      summary: entry.data.summary,
      text: stripMarkdown(`${entry.data.title} ${entry.data.summary} ${entry.data.tags.join(' ')} ${entry.body ?? ''}`),
    })),
    ...glossary.map((entry) => ({
      title: entry.term,
      url: pagePath(`/glossary#${entry.id}`),
      kind: 'Glossary',
      summary: entry.definition,
      text: `${entry.term} ${entry.definition}`,
    })),
  ];
}
