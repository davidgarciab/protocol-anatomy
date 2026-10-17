import type { APIRoute } from 'astro';
import { glossary } from '../data/glossary';
import { publishedPages } from '../lib/published-pages';
import { SITE } from '../lib/site';

const SECTIONS = [
  { prefix: '/protocols/', heading: 'Protocols' },
  { prefix: '/guides/', heading: 'Version guides' },
  { prefix: '/concepts/', heading: 'Concepts' },
  { prefix: '/methodology', heading: 'About the publication' },
];

/** llms.txt: a plain-text map of the publication for language-model crawlers. */
export const GET: APIRoute = async () => {
  const pages = await publishedPages();
  const abs = (path: string) => new URL(path, SITE.url).href;
  const lines = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description} Every claim is sourced to protocol documentation, contract code, or governance records, and each page shows the date its sources were last read.`,
    '',
    `Written by ${SITE.authorFullName} (${abs('/about/')}). Content is licensed as described at ${SITE.repoUrl}/blob/main/CONTENT_LICENSE.md. Cite the page URL and its "Last verified" date.`,
    '',
  ];
  for (const section of SECTIONS) {
    const entries = pages.filter((page) => page.url.startsWith(section.prefix));
    if (entries.length === 0) continue;
    lines.push(`## ${section.heading}`, '');
    for (const page of entries) lines.push(`- [${page.title}](${abs(page.url)}): ${page.description}`);
    lines.push('');
  }
  lines.push(
    '## Optional',
    '',
    `- [Full text of every article](${abs('/llms-full.txt')}): all pages as one plain-text file`,
    `- [Glossary](${abs('/glossary/')}): ${glossary.length} short definitions`,
    `- [Source index](${abs('/sources/')}): every primary source cited`,
    `- [What changed](${abs('/changes/')}): dated corrections and additions`,
    '',
  );
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
