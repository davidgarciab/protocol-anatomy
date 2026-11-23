import { describe, expect, it } from 'vitest';
import { pageTitle, snippet, TITLE_BUDGET } from '../src/lib/seo';

describe('pageTitle', () => {
  it('keeps the brand when the title fits in the budget', () => {
    expect(pageTitle('How Aave works', 'Protocol Anatomy')).toBe('How Aave works · Protocol Anatomy');
  });
  it('drops the brand when it would push the title past the budget', () => {
    const title = 'How Safe works: multisig smart accounts, modules and guards';
    expect(pageTitle(title, 'Protocol Anatomy')).toBe(title);
    expect(pageTitle(title, 'Protocol Anatomy').length).toBeLessThanOrEqual(TITLE_BUDGET);
  });
  it('does not repeat a brand the title already starts with', () => {
    expect(pageTitle('Protocol Anatomy: how DeFi works', 'Protocol Anatomy')).toBe('Protocol Anatomy: how DeFi works');
  });
});

describe('snippet', () => {
  it('returns short text unchanged', () => {
    expect(snippet('Wrapped stETH.')).toBe('Wrapped stETH.');
  });
  it('stops at the last whole sentence that fits', () => {
    const text = `${'A'.repeat(70)}. ${'B'.repeat(70)}. ${'C'.repeat(70)}.`;
    expect(snippet(text, 158)).toBe(`${'A'.repeat(70)}. ${'B'.repeat(70)}.`);
  });
  it('prefers a longer word-boundary cut to a very short first sentence', () => {
    const text = `Short first sentence. ${'more words here '.repeat(20)}end.`;
    const out = snippet(text, 158);
    expect(out.length).toBeGreaterThan(100);
    expect(out.endsWith('…')).toBe(true);
  });
  it('falls back to a word boundary with an ellipsis for one long sentence', () => {
    const out = snippet(`${'word '.repeat(60)}end.`, 100);
    expect(out.length).toBeLessThanOrEqual(100);
    expect(out.endsWith('…')).toBe(true);
  });
});
