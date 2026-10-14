import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { changeLog } from '../lib/changes';
import { publishedPages } from '../lib/published-pages';
import { SITE } from '../lib/site';

/** New articles and recorded content changes, newest first. */
export const GET: APIRoute = async () => {
  const entries = changeLog(await publishedPages());
  return rss({
    title: SITE.name,
    description: `New articles and corrections from ${SITE.name}. ${SITE.description}`,
    site: SITE.url,
    trailingSlash: true,
    customData: '<language>en</language>',
    items: entries.map((entry) => ({
      title: entry.kind === 'published' ? entry.title : `Updated: ${entry.title}`,
      link: entry.url,
      pubDate: new Date(`${entry.date}T00:00:00Z`),
      description: entry.summary.replaceAll('`', ''),
      customData: `<guid isPermaLink="false">${new URL(entry.url, SITE.url).href}#${entry.id}</guid>`,
    })),
  });
};
