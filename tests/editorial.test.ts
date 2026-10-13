import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  findingFingerprint,
  formatReport,
  issueDecision,
  mergeBaseline,
  reviewSources,
  validateWatchSources,
  type Finding,
  type WatchSource,
} from '../src/lib/editorial';

const source: WatchSource = {
  id: 'example-file',
  kind: 'github-file',
  repo: 'example/protocol',
  path: 'src/Vat.sol',
  ref: 'master',
  articles: ['src/content/protocols/aave.md'],
  why: 'The safety check quoted on the protocol page comes from this file.',
};

function finding(current: string, previous = 'aaa'): Finding {
  return {
    sourceId: 'example-file',
    articles: source.articles,
    why: source.why,
    previous,
    current,
    url: 'https://example.com/commit',
    detectedOn: '2026-10-14',
    action: 'Read it.',
  };
}

describe('editorial review', () => {
  it('accepts the committed source inventory', () => {
    const root = join(import.meta.dirname, '..');
    const sources = JSON.parse(readFileSync(join(root, 'editorial/sources.json'), 'utf8')) as WatchSource[];
    const files = new Set<string>();
    const walk = (dir: string, prefix: string) => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) walk(path, `${prefix}${entry}/`);
        else if (entry.endsWith('.md')) files.add(`${prefix}${entry}`);
      }
    };
    walk(join(root, 'src/content'), 'src/content/');
    expect(validateWatchSources(sources, files)).toEqual([]);
  });

  it('reports a changed file and ignores an unchanged one', () => {
    const review = reviewSources(
      [source],
      { 'example-file': { observed: 'aaa', observedAt: '2026-10-01', url: 'https://example.com/a' } },
      [{ id: source.id, status: 'ok', observed: 'bbb', url: 'https://example.com/b' }],
      '2026-10-14',
    );
    expect(review.findings).toHaveLength(1);
    expect(review.findings[0]?.previous).toBe('aaa');
    expect(review.findings[0]?.current).toBe('bbb');
    expect(review.findings[0]?.articles).toEqual(source.articles);
    expect(review.unavailable).toEqual([]);
  });

  it('does not treat an unavailable source as an article change', () => {
    const review = reviewSources(
      [source],
      { 'example-file': { observed: 'aaa', observedAt: '2026-10-01', url: 'https://example.com/a' } },
      [{ id: source.id, status: 'unavailable', detail: 'HTTP 503' }],
      '2026-10-14',
    );
    expect(review.findings).toEqual([]);
    expect(review.unavailable[0]?.detail).toBe('HTTP 503');
    const kept = mergeBaseline(
      { 'example-file': { observed: 'aaa', observedAt: '2026-10-01', url: 'https://example.com/a' } },
      review.unavailable.map((note) => ({ id: note.sourceId, status: 'unavailable' as const, detail: note.detail })),
      '2026-10-14',
    );
    expect(kept['example-file']?.observed).toBe('aaa');
  });

  it('keeps the same fingerprint for the same diff in either order', () => {
    const first = findingFingerprint([finding('bbb', 'aaa'), { ...finding('ddd', 'ccc'), sourceId: 'other' }]);
    const second = findingFingerprint([{ ...finding('ddd', 'ccc'), sourceId: 'other' }, finding('bbb', 'aaa')]);
    expect(first).toBe(second);
    expect(findingFingerprint([finding('ccc', 'aaa')])).not.toBe(first);
  });

  it('formats the review action and the affected path', () => {
    const review = reviewSources(
      [source],
      {},
      [{ id: source.id, status: 'ok', observed: 'bbb', url: 'https://example.com/b' }],
      '2026-10-14',
    );
    const report = formatReport(review, [source]);
    expect(report).toContain('src/content/protocols/aave.md');
    expect(report).toContain('https://example.com/b');
    expect(report).toContain('Leave lastVerified unchanged');
    expect(report).toContain(`<!-- fingerprint:${review.fingerprint} -->`);
  });

  it('opens one issue and does not file the same fingerprint again', () => {
    expect(issueDecision([], 'abc', 0)).toEqual({ action: 'skip', reason: 'no upstream changes to review' });
    expect(issueDecision([], 'abc', 2)).toEqual({ action: 'create' });
    expect(issueDecision([{ number: 7, body: '<!-- fingerprint:abc -->' }], 'abc', 2)).toEqual({
      action: 'skip',
      reason: 'an open issue already records this diff',
    });
    expect(issueDecision([{ number: 7, body: '<!-- fingerprint:old -->' }], 'abc', 2)).toEqual({
      action: 'update',
      number: 7,
    });
  });
});
