import { getCollection } from 'astro:content';
import { faqAnchor } from './anchors';
import { pagePath } from './site';

export interface FeaturedQuestion {
  question: string;
  href: string;
  page: string;
}

/** FAQ items marked `featured`, protocols first and then concepts, each in article order. */
export async function featuredQuestions(): Promise<FeaturedQuestion[]> {
  const [protocols, concepts] = await Promise.all([getCollection('protocols'), getCollection('concepts')]);
  const entries = [
    ...protocols.sort((a, b) => a.data.order - b.data.order).map((entry) => ({ entry, base: '/protocols' })),
    ...concepts.sort((a, b) => a.data.order - b.data.order).map((entry) => ({ entry, base: '/concepts' })),
  ];
  return entries.flatMap(({ entry, base }) =>
    entry.data.faq
      .filter((item) => item.featured)
      .map((item) => ({
        question: item.question,
        href: `${pagePath(`${base}/${entry.id}`)}#${faqAnchor(item.question)}`,
        page: entry.data.title,
      })),
  );
}

export interface QuestionGroup {
  id: string;
  title: string;
  kind: 'Protocol' | 'Guide' | 'Concept' | 'Comparison';
  href: string;
  items: { question: string; answer: string; anchor: string }[];
}

/** Every FAQ item, grouped by the article that answers it: protocols, then guides, then concepts, then comparisons. */
export async function questionGroups(): Promise<QuestionGroup[]> {
  const [protocols, guides, concepts, comparisons] = await Promise.all([
    getCollection('protocols'),
    getCollection('guides'),
    getCollection('concepts'),
    getCollection('comparisons'),
  ]);
  const byOrder = <T extends { data: { order: number } }>(entries: T[]) =>
    [...entries].sort((a, b) => a.data.order - b.data.order);
  const sources = [
    ...byOrder(protocols).map((entry) => ({ entry, base: '/protocols', kind: 'Protocol' as const })),
    ...byOrder(guides).map((entry) => ({ entry, base: '/guides', kind: 'Guide' as const })),
    ...byOrder(concepts).map((entry) => ({ entry, base: '/concepts', kind: 'Concept' as const })),
    ...byOrder(comparisons).map((entry) => ({ entry, base: '/compare', kind: 'Comparison' as const })),
  ];
  return sources
    .filter(({ entry }) => entry.data.faq.length > 0)
    .map(({ entry, base, kind }) => ({
      id: `${base.slice(1)}-${entry.id}`,
      title: entry.data.title,
      kind,
      href: pagePath(`${base}/${entry.id}`),
      items: entry.data.faq.map((item) => ({
        question: item.question,
        answer: item.answer,
        anchor: faqAnchor(item.question),
      })),
    }));
}
