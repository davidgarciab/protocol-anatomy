import { describe, expect, it } from 'vitest';
import type { Element, ElementContent, Properties, Root } from 'hast';
import { rehypeGlossaryLinks } from '../src/plugins/rehype-glossary';
import { learningPaths } from '../src/data/paths';

const text = (value: string): ElementContent => ({ type: 'text', value });
const el = (tagName: string, children: ElementContent[], properties: Properties = {}): Element => ({
  type: 'element',
  tagName,
  properties,
  children,
});

function run(children: Root['children'], glossary: string[]) {
  const tree: Root = { type: 'root', children };
  rehypeGlossaryLinks()(tree, { data: { astro: { frontmatter: { glossary } } } });
  return tree;
}

describe('glossary auto-links', () => {
  it('links only the first mention of a listed term', () => {
    const tree = run([el('p', [text('A tick is a boundary. Each tick is one basis point.')])], ['tick']);
    const links = JSON.stringify(tree).match(/"href":"\/glossary\/tick\/"/g);
    expect(links).toHaveLength(1);
  });

  it('skips headings, code and terms the author linked by hand', () => {
    const heading = run([el('h2', [text('What a tick is')])], ['tick']);
    expect(JSON.stringify(heading)).not.toContain('/glossary/');
    const code = run([el('p', [el('code', [text('tick')])])], ['tick']);
    expect(JSON.stringify(code)).not.toContain('/glossary/');
    const manual = run(
      [el('p', [el('a', [text('ticks')], { href: '/glossary/#tick' }), text(' and a tick again')])],
      ['tick'],
    );
    expect(JSON.stringify(manual).match(/\/glossary\//g)).toHaveLength(1);
  });

  it('ignores terms the article does not list', () => {
    expect(JSON.stringify(run([el('p', [text('The tick moved.')])], []))).not.toContain('/glossary/');
  });
});

describe('learning paths', () => {
  it('have unique ids and no repeated step within a path', () => {
    expect(new Set(learningPaths.map((path) => path.id)).size).toBe(learningPaths.length);
    for (const path of learningPaths) expect(new Set(path.steps).size).toBe(path.steps.length);
  });
});
