import { fromHtml } from 'hast-util-from-html';
import { visit, SKIP } from 'unist-util-visit';
import type { Element, ElementContent, Root } from 'hast';
import { diagrams } from '../diagrams/registry';

interface Parent extends Element {
  children: Element['children'];
}

export function rehypeDiagrams() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'th' && !node.properties.scope) {
        node.properties.scope = 'col';
      }
      if (node.tagName === 'a' && typeof node.properties.href === 'string') {
        node.properties.href = trailingPageHref(node.properties.href);
      }
    });

    visit(tree, 'element', (node: Element, index, parent) => {
      if (!parent || index === undefined || node.tagName !== 'table') return;
      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['table-wrap'],
          tabIndex: 0,
          ariaLabel: 'Scrollable table',
        },
        children: [node],
      };
      (parent as Parent).children[index] = wrapper;
      // Skip the wrapper. Revisiting this index would wrap the same table again.
      return [SKIP, index + 1];
    });

    replaceDiagrams(tree);
  };
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function diagramNodes(name: string): ElementContent[] {
  const html = diagrams[name];
  if (!html) throw new Error(`Unknown diagram "${name}"`);
  const fragment = fromHtml(html, { fragment: true });
  return fragment.children.filter((child): child is ElementContent => child.type !== 'doctype');
}

function diagramName(value: string): string | undefined {
  return value.trim().match(/^<diagram-placeholder\s+name="([a-z0-9-]+)"\s*><\/diagram-placeholder>$/)?.[1];
}

function replaceDiagrams(node: HastNode) {
  if (!node.children) return;
  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];
    if (!child) continue;
    const rawName = child.type === 'raw' && child.value ? diagramName(child.value) : undefined;
    const paragraphName =
      child.type === 'element' && child.tagName === 'p' ? onlyDiagram(child.children ?? []) : undefined;
    const name = rawName ?? paragraphName;
    if (name) {
      const replacement = diagramNodes(name);
      node.children.splice(index, 1, ...(replacement as HastNode[]));
      index += replacement.length - 1;
      continue;
    }
    if (child.type === 'element') replaceDiagrams(child);
  }
}

function trailingPageHref(href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const hashAt = href.indexOf('#');
  const hash = hashAt >= 0 ? href.slice(hashAt) : '';
  const path = hashAt >= 0 ? href.slice(0, hashAt) : href;
  if (path === '' || path === '/' || /\.[a-z0-9]+$/i.test(path)) return href;
  return `${path.replace(/\/+$/, '')}/${hash}`;
}

function onlyDiagram(children: HastNode[]): string | undefined {
  const meaningful = children.filter((child) => !(child.type === 'text' && !child.value?.trim()));
  if (meaningful.length === 0 || meaningful.some((child) => child.type !== 'raw')) return undefined;
  return diagramName(meaningful.map((child) => child.value ?? '').join(''));
}
