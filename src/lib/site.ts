export const SITE = {
  name: 'Protocol Anatomy',
  tagline: 'Understand the code. Follow the money. Trace the evolution.',
  url: 'https://protocols.davidgarciab.com',
  author: 'David Garcia',
  authorUrl: 'https://github.com/davidgarciab',
  repoUrl: 'https://github.com/davidgarciab/protocol-anatomy',
  description:
    'A technical field guide to how major DeFi protocols account for assets, price trades, liquidate collateral, and change their contracts.',
} as const;

export const VERSION_STATUSES = [
  'released',
  'active',
  'historical',
  'deprecated',
  'proposed',
  'in-development',
] as const;

export type VersionStatus = (typeof VERSION_STATUSES)[number];

export const SOURCE_KINDS = [
  'docs',
  'whitepaper',
  'code',
  'governance',
  'security',
  'specification',
  'research',
] as const;

export type SourceKind = (typeof SOURCE_KINDS)[number];

export interface Source {
  title: string;
  url: string;
  kind: SourceKind;
  publisher: string;
}

export interface VersionNote {
  name: string;
  status: VersionStatus;
  note: string;
}

/** Cloudflare Pages serves each directory index at a trailing slash. */
export function pagePath(pathname: string): string {
  const hashAt = pathname.indexOf('#');
  const hash = hashAt >= 0 ? pathname.slice(hashAt) : '';
  const path = hashAt >= 0 ? pathname.slice(0, hashAt) : pathname;
  if (path === '' || path === '/') return `/${hash}`;
  if (/\.[a-z0-9]+$/i.test(path)) return `${path}${hash}`;
  return `${path.replace(/\/+$/, '')}/${hash}`;
}

export function canonicalUrl(pathname: string): string {
  return new URL(pagePath(pathname), SITE.url).href;
}

export function sourceKindLabel(kind: SourceKind): string {
  switch (kind) {
    case 'docs':
      return 'Documentation';
    case 'whitepaper':
      return 'Whitepaper';
    case 'code':
      return 'Source code';
    case 'governance':
      return 'Governance';
    case 'security':
      return 'Security';
    case 'specification':
      return 'Specification';
    case 'research':
      return 'Research';
    default:
      return kind;
  }
}
