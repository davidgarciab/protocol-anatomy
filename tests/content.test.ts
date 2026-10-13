import { describe, expect, it } from 'vitest';
import { filterEntries, stripMarkdown, type SearchEntry } from '../src/lib/search';
import {
  extractDiagrams,
  extractLinks,
  findPlaceholders,
  isHttpsUrl,
  isIsoDate,
  validateDocument,
  type Catalog,
} from '../src/lib/content-rules';
import { readingMinutes } from '../src/lib/reading';
import { canonicalUrl } from '../src/lib/site';

const catalog: Catalog = {
  protocols: new Set(['aave']),
  guides: new Set(['aave-versions']),
  concepts: new Set(['lending-utilization']),
  glossary: new Set(['health-factor']),
  diagrams: new Set(['lending-flow']),
  paths: new Set(['/protocols/aave', '/glossary']),
  headings: new Map([['/glossary', new Set(['health-factor'])]]),
};

describe('content rules', () => {
  it('accepts real dates and rejects impossible ones', () => {
    expect(isIsoDate('2026-10-13')).toBe(true);
    expect(isIsoDate('2026-02-31')).toBe(false);
    expect(isIsoDate('13-10-2026')).toBe(false);
  });

  it('rejects localhost and non-https source URLs', () => {
    expect(isHttpsUrl('https://aave.com/docs')).toBe(true);
    expect(isHttpsUrl('http://aave.com/docs')).toBe(false);
    expect(isHttpsUrl('https://localhost/docs')).toBe(false);
  });

  it('extracts internal links and ignores fenced code', () => {
    const markdown = 'See [Aave](/protocols/aave) and [health](/glossary#health-factor).\n```\n[skip](/nope)\n```';
    expect(extractLinks(markdown)).toEqual(['/protocols/aave', '/glossary#health-factor']);
  });

  it('flags placeholders outside code and unknown diagrams', () => {
    expect(findPlaceholders('This is TODO later')).toEqual(['TODO']);
    expect(findPlaceholders('```\nTODO\n```\nDone')).toEqual([]);
    expect(extractDiagrams('<diagram-placeholder name="lending-flow"></diagram-placeholder>')).toEqual(['lending-flow']);
  });

  it('reports an unresolved internal link', () => {
    const errors = validateDocument(
      {
        collection: 'concepts',
        id: 'example',
        data: {
          title: 'Example concept title',
          description: 'A long enough description for the example concept used in the unit test.',
          summary: 'A summary that is certainly longer than eighty characters so the required field check can pass cleanly.',
          status: 'published',
          published: '2026-10-13',
          lastVerified: '2026-10-13',
          tags: ['test'],
          sources: [{ title: 'Docs', url: 'https://example.com/docs', kind: 'docs', publisher: 'Example' }],
          group: 'credit',
          protocols: ['aave'],
          glossary: ['health-factor'],
          related: ['lending-utilization'],
        },
        body: `${'word '.repeat(400)}\n\nSee [missing](/protocols/missing) and [health](/glossary#health-factor).`,
      },
      catalog,
    );
    expect(errors.some((error) => error.includes('/protocols/missing'))).toBe(true);
    expect(errors.some((error) => error.includes('health-factor'))).toBe(false);
  });
});

describe('search and reading helpers', () => {
  const entries: SearchEntry[] = [
    { title: 'Aave', url: '/protocols/aave', kind: 'Protocol', summary: 'Lending pool', text: 'aave liquidation health factor' },
    { title: 'Ticks', url: '/concepts/concentrated-liquidity', kind: 'Concept', summary: 'Price ticks', text: 'uniswap tick spacing' },
  ];

  it('returns every entry of the selected kind when the query is empty', () => {
    expect(filterEntries(entries, '  ', 'all')).toHaveLength(2);
    expect(filterEntries(entries, '', 'Protocol').map((entry) => entry.title)).toEqual(['Aave']);
  });

  it('requires every term to match and ranks title matches first', () => {
    expect(filterEntries(entries, 'liquidation missing', 'all')).toHaveLength(0);
    expect(filterEntries(entries, 'tick', 'all')[0]?.title).toBe('Ticks');
  });

  it('strips markdown before indexing', () => {
    expect(stripMarkdown('See [Aave](/protocols/aave).\n```\ncode\n```')).toContain('Aave');
    expect(stripMarkdown('See [Aave](/protocols/aave).\n```\ncode\n```')).not.toContain('code');
  });

  it('estimates reading time from prose rather than code fences', () => {
    expect(readingMinutes(`${'word '.repeat(220)}\n\`\`\`\n${'code '.repeat(500)}\n\`\`\``)).toBe(1);
  });
});

describe('canonical URLs', () => {
  it('uses the production origin and the trailing slash Pages serves', () => {
    expect(canonicalUrl('/protocols/aave/')).toBe('https://protocols.davidgarciab.com/protocols/aave/');
    expect(canonicalUrl('/glossary#health-factor')).toBe('https://protocols.davidgarciab.com/glossary/#health-factor');
    expect(canonicalUrl('/')).toBe('https://protocols.davidgarciab.com/');
    expect(canonicalUrl('/protocols/aave')).not.toContain('localhost');
  });
});
