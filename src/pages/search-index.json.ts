import type { APIRoute } from 'astro';
import { buildSearchEntries } from '../lib/search-index';

/** Fetched by /search/ on load, so the article text is not inlined into the search page's HTML. */
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildSearchEntries()), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
