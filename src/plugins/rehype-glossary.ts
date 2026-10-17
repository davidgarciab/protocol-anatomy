import type { Element, ElementContent, Root, Text } from 'hast';
import { glossary } from '../data/glossary';

/** Text under these elements is never linked: headings, code, existing links, tables, diagrams. */
const SKIP = new Set(['a', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'figure', 'svg', 'button']);

const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Links the first mention of each glossary term an article lists in its frontmatter to the term's page.
 * A term the author already linked by hand is left alone.
 */
export function rehypeGlossaryLinks() {
  return (tree: Root, file: { data: { astro?: { frontmatter?: { glossary?: string[] } } } }) => {
    const ids = file.data.astro?.frontmatter?.glossary ?? [];
    const terms = glossary.filter((entry) => ids.includes(entry.id));
    if (terms.length === 0) return;

    const done = new Set<string>();
    const manual = /\/glossary\/(?:#|)([a-z0-9-]+)/;
    (function collect(node: Root | Element) {
      for (const child of node.children) {
        if (child.type !== 'element') continue;
        const href = child.tagName === 'a' ? child.properties.href : undefined;
        const id = typeof href === 'string' ? href.match(manual)?.[1] : undefined;
        if (id) done.add(id);
        collect(child);
      }
    })(tree);

    const patterns = terms.map((entry) => ({
      id: entry.id,
      regex: new RegExp(`(^|[^\\w-])(${escape(entry.term)}s?)(?![\\w-])`, 'i'),
    }));

    function split(value: string): ElementContent[] | undefined {
      let best: { id: string; start: number; text: string } | undefined;
      for (const pattern of patterns) {
        if (done.has(pattern.id)) continue;
        const match = pattern.regex.exec(value);
        if (!match) continue;
        const start = match.index + match[1].length;
        if (!best || start < best.start) best = { id: pattern.id, start, text: match[2] };
      }
      if (!best) return undefined;
      done.add(best.id);
      const before = value.slice(0, best.start);
      const link: Element = {
        type: 'element',
        tagName: 'a',
        properties: { href: `/glossary/${best.id}/` },
        children: [{ type: 'text', value: best.text }],
      };
      const rest = value.slice(best.start + best.text.length);
      const nodes: ElementContent[] = [];
      if (before) nodes.push({ type: 'text', value: before });
      nodes.push(link);
      if (rest) nodes.push(...(split(rest) ?? [{ type: 'text', value: rest } as Text]));
      return nodes;
    }

    (function walk(node: Root | Element) {
      for (let index = 0; index < node.children.length; index += 1) {
        const child = node.children[index];
        if (child.type === 'element') {
          if (!SKIP.has(child.tagName) && !(child.properties.className as string[] | undefined)?.includes('diagram')) walk(child);
        } else if (child.type === 'text' && done.size < terms.length) {
          const replacement = split(child.value);
          if (replacement) {
            node.children.splice(index, 1, ...replacement);
            index += replacement.length - 1;
          }
        }
      }
    })(tree);
  };
}
