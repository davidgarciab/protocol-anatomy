import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgImage, type OgCard } from '../../lib/og';
import { groupLabel } from '../../lib/relate';
import { SITE } from '../../lib/site';

/** One 1200×630 social preview per article, plus `default` for every other page. */
export async function getStaticPaths() {
  const protocols = await getCollection('protocols');
  const guides = await getCollection('guides');
  const concepts = await getCollection('concepts');
  const site = await getCollection('site');
  const card = (path: string, props: OgCard) => ({ params: { path }, props });

  return [
    card('default', { kicker: 'Technical field guide', title: SITE.name, description: SITE.tagline }),
    ...protocols.map((entry) =>
      card(`protocols/${entry.id}`, {
        kicker: `Protocol · ${entry.data.category}`,
        title: entry.data.title,
        description: entry.data.description,
      }),
    ),
    ...guides.map((entry) =>
      card(`guides/${entry.id}`, { kicker: 'Version guide', title: entry.data.title, description: entry.data.description }),
    ),
    ...concepts.map((entry) =>
      card(`concepts/${entry.id}`, {
        kicker: `Concept · ${groupLabel[entry.data.group]}`,
        title: entry.data.title,
        description: entry.data.description,
      }),
    ),
    ...site.map((entry) =>
      card(entry.id, { kicker: 'About this publication', title: entry.data.title, description: entry.data.description }),
    ),
  ];
}

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await renderOgImage(props as OgCard)), { headers: { 'Content-Type': 'image/png' } });
