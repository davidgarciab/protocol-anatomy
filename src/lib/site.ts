export const SITE = {
  name: 'Protocol Anatomy',
  tagline: 'Understand the code. Follow the money. Trace the evolution.',
  url: 'https://protocols.davidgarciab.com',
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

export function canonicalUrl(pathname: string): string {
  const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return new URL(path, SITE.url).href;
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
