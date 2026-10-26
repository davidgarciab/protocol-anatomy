export const SITE = {
  name: 'Protocol Anatomy',
  tagline: 'How DeFi protocols work, where the money sits, how they change.',
  url: 'https://protocols.davidgarciab.com',
  author: 'David Garcia',
  authorFullName: 'David Garcia Berenguer',
  authorUrl: 'https://davidgarciab.com/',
  authorBio:
    'Engineering leader and hands-on engineer with 20+ years building teams, scalable systems and reliable products across SaaS, payments, AI and blockchain.',
  authorProfiles: [
    'https://davidgarciab.com/',
    'https://github.com/davidgarciab',
    'https://www.linkedin.com/in/davidgarciab/',
    'https://x.com/davidgarciab',
  ],
  repoUrl: 'https://github.com/davidgarciab/protocol-anatomy',
  description:
    'An independent educational resource for understanding how DeFi protocols work: how they account for assets, price trades, liquidate collateral, and change across versions.',
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

/** schema.org Person for the author, shared by article and About page structured data. */
export function authorJsonLd(): Record<string, unknown> {
  return {
    '@type': 'Person',
    '@id': `${SITE.url}/about/#author`,
    name: SITE.authorFullName,
    alternateName: SITE.author,
    url: SITE.authorUrl,
    description: SITE.authorBio,
    sameAs: SITE.authorProfiles,
  };
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

const CONTENT_LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

/** The publication as one entity, referenced by `@id` from every page. */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@type': 'Organization',
    '@id': `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    founder: authorJsonLd(),
    sameAs: [SITE.repoUrl],
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    inLanguage: 'en',
    license: CONTENT_LICENSE_URL,
    publisher: { '@id': `${SITE.url}/#organization` },
  };
}

export const glossarySetJsonLd = {
  '@type': 'DefinedTermSet',
  '@id': `${SITE.url}/glossary/#set`,
  name: `${SITE.name} glossary`,
  url: `${SITE.url}/glossary/`,
  inLanguage: 'en',
};

export { CONTENT_LICENSE_URL };
