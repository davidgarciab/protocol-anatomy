import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { extractHttpsUrls, unexpectedDraftUrls } from '../src/lib/distribute';
import { canonicalUrl } from '../src/lib/site';

describe('distribution drafts', () => {
  it('ignores fenced URLs and strips trailing punctuation', () => {
    const markdown = 'See https://example.com/docs.\n```\nhttps://example.com/secret\n```';
    expect(extractHttpsUrls(markdown)).toEqual(['https://example.com/docs']);
  });

  it('rejects a URL that the article does not cite', () => {
    const allowed = new Set(['https://protocols.davidgarciab.com/concepts/concentrated-liquidity/']);
    expect(unexpectedDraftUrls('Read https://example.com/rumor', allowed)).toEqual(['https://example.com/rumor']);
  });

  it('accepts the concentrated-liquidity drafts', () => {
    const root = join(import.meta.dirname, '..');
    const article = readFileSync(join(root, 'src/content/concepts/concentrated-liquidity.md'), 'utf8');
    const frontmatter = article.match(/^---\n([\s\S]*?)\n---/);
    const data = parse(frontmatter?.[1] ?? '') as { sources: { url: string }[] };
    const allowed = new Set([
      canonicalUrl('/concepts/concentrated-liquidity'),
      ...data.sources.map((source) => source.url),
    ]);
    const draft = readFileSync(join(root, 'distribution/concentrated-liquidity.md'), 'utf8');
    expect(unexpectedDraftUrls(draft, allowed)).toEqual([]);
  });
});
