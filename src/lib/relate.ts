import type { CollectionEntry } from 'astro:content';
import { pagePath } from './site';
import { glossary } from '../data/glossary';
import type { RelatedLink } from '../components/Related.astro';

export interface Library {
  protocols: CollectionEntry<'protocols'>[];
  guides: CollectionEntry<'guides'>[];
  concepts: CollectionEntry<'concepts'>[];
}

function must<T extends { id: string }>(items: T[], id: string, label: string): T {
  const found = items.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown ${label} "${id}"`);
  return found;
}

export function protocolLinks(entry: CollectionEntry<'protocols'>, library: Library): RelatedLink[] {
  return [
    ...entry.data.guides.map((id) => {
      const guide = must(library.guides, id, 'guide');
      return { href: pagePath(`/guides/${guide.id}`), title: guide.data.title, kind: 'Guide' };
    }),
    ...entry.data.concepts.map((id) => {
      const concept = must(library.concepts, id, 'concept');
      return { href: pagePath(`/concepts/${concept.id}`), title: concept.data.title, kind: 'Concept' };
    }),
    ...entry.data.glossary.map((id) => {
      const term = glossary.find((item) => item.id === id);
      if (!term) throw new Error(`Unknown glossary id "${id}"`);
      return { href: pagePath(`/glossary#${term.id}`), title: term.term, kind: 'Glossary' };
    }),
  ];
}

export function guideLinks(entry: CollectionEntry<'guides'>, library: Library): RelatedLink[] {
  const protocol = must(library.protocols, entry.data.protocol, 'protocol');
  return [
    { href: pagePath(`/protocols/${protocol.id}`), title: protocol.data.title, kind: 'Protocol' },
    ...entry.data.relatedGuides.map((id) => {
      const guide = must(library.guides, id, 'guide');
      return { href: pagePath(`/guides/${guide.id}`), title: guide.data.title, kind: 'Guide' };
    }),
    ...entry.data.concepts.map((id) => {
      const concept = must(library.concepts, id, 'concept');
      return { href: pagePath(`/concepts/${concept.id}`), title: concept.data.title, kind: 'Concept' };
    }),
    ...entry.data.glossary.map((id) => {
      const term = glossary.find((item) => item.id === id);
      if (!term) throw new Error(`Unknown glossary id "${id}"`);
      return { href: pagePath(`/glossary#${term.id}`), title: term.term, kind: 'Glossary' };
    }),
  ];
}

export function conceptLinks(entry: CollectionEntry<'concepts'>, library: Library): RelatedLink[] {
  return [
    ...entry.data.protocols.map((id) => {
      const protocol = must(library.protocols, id, 'protocol');
      return { href: pagePath(`/protocols/${protocol.id}`), title: protocol.data.title, kind: 'Protocol' };
    }),
    ...entry.data.related.map((id) => {
      const concept = must(library.concepts, id, 'concept');
      return { href: pagePath(`/concepts/${concept.id}`), title: concept.data.title, kind: 'Concept' };
    }),
    ...entry.data.glossary.map((id) => {
      const term = glossary.find((item) => item.id === id);
      if (!term) throw new Error(`Unknown glossary id "${id}"`);
      return { href: pagePath(`/glossary#${term.id}`), title: term.term, kind: 'Glossary' };
    }),
  ];
}

export const groupLabel: Record<string, string> = {
  markets: 'Markets',
  credit: 'Credit',
  monetary: 'Monetary systems',
  engineering: 'Engineering',
};
