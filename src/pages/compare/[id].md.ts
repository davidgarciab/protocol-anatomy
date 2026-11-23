import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';
import { articleMarkdown, markdownResponse } from '../../lib/markdown-export';

export const getStaticPaths: GetStaticPaths = async () =>
  (await getCollection('comparisons')).map((entry) => ({ params: { id: entry.id }, props: { entry } }));

/** The article as Markdown, at the page URL without the trailing slash plus .md. */
export const GET: APIRoute = ({ props }) => markdownResponse(articleMarkdown(props.entry, `/compare/${props.entry.id}`));
