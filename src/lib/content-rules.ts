import { SOURCE_KINDS, VERSION_STATUSES, type SourceKind, type VersionStatus } from './site';

export const REQUIRED_PROTOCOLS = ['aave', 'uniswap', 'maker-sky', 'curve', 'lido'] as const;
export const REQUIRED_GUIDES = [
  'aave-versions',
  'uniswap-versions',
  'maker-to-sky',
  'curve-generations',
  'lido-exits',
] as const;
export const REQUIRED_CONCEPTS = [
  'automated-market-makers',
  'liquidity-pools',
  'constant-product',
  'concentrated-liquidity',
  'lending-utilization',
  'interest-rate-models',
  'collateral-and-liquidation',
  'stablecoin-mechanisms',
  'governance-and-upgrades',
  'oracles-and-dependencies',
  'liquid-staking',
  'proxies',
  'on-chain-accounting',
  'composability',
  'flash-liquidity',
  'security-assumptions',
] as const;

const PLACEHOLDER = /\b(TODO|TBD|PLACEHOLDER)\b|lorem ipsum|coming soon/i;

export interface Catalog {
  protocols: Set<string>;
  guides: Set<string>;
  concepts: Set<string>;
  glossary: Set<string>;
  diagrams: Set<string>;
  paths: Set<string>;
  headings: Map<string, Set<string>>;
}

export interface CheckedDocument {
  collection: 'protocols' | 'guides' | 'concepts' | 'site';
  id: string;
  data: Record<string, unknown>;
  body: string;
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !/localhost|127\.0\.0\.1/i.test(url.hostname);
  } catch {
    return false;
  }
}

export function extractLinks(markdown: string): string[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '');
  const links: string[] = [];
  const markdownLink = /\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const htmlLink = /href="([^"]+)"/g;
  for (const match of withoutCode.matchAll(markdownLink)) links.push(match[1]);
  for (const match of withoutCode.matchAll(htmlLink)) links.push(match[1]);
  return links;
}

export function extractDiagrams(markdown: string): string[] {
  const names: string[] = [];
  const pattern = /<diagram-placeholder\s+name="([a-z0-9-]+)"\s*>\s*<\/diagram-placeholder>/g;
  for (const match of markdown.matchAll(pattern)) names.push(match[1]);
  return names;
}

export function findPlaceholders(markdown: string): string[] {
  const withoutCode = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<diagram-placeholder\b[^>]*>[\s\S]*?<\/diagram-placeholder>/g, '');
  const match = withoutCode.match(PLACEHOLDER);
  return match ? [match[0]] : [];
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) return undefined;
  return value;
}

function requireString(errors: string[], data: Record<string, unknown>, key: string, min = 1): string | undefined {
  const value = asString(data[key]);
  if (!value || value.trim().length < min) {
    errors.push(`Missing or short ${key}`);
    return undefined;
  }
  return value;
}

export function validateDocument(doc: CheckedDocument, catalog: Catalog): string[] {
  const errors: string[] = [];
  const prefix = `${doc.collection}/${doc.id}`;
  const data = doc.data;

  if (data.status !== 'published') errors.push(`${prefix}: status must be "published"`);

  const title = requireString(errors, data, 'title', 3);
  const description = requireString(errors, data, 'description', 40);
  if (description && description.length > 180) {
    errors.push(`${prefix}: description is ${description.length} characters; keep it under 180`);
  }
  requireString(errors, data, 'summary', 80);

  for (const key of ['published', 'lastVerified'] as const) {
    const value = asString(data[key]);
    if (!value || !isIsoDate(value)) errors.push(`${prefix}: ${key} must be YYYY-MM-DD`);
  }

  if (data.changes !== undefined) {
    const published = asString(data.published);
    if (!Array.isArray(data.changes)) errors.push(`${prefix}: changes must be a list`);
    else
      data.changes.forEach((change, index) => {
        const record = (change ?? {}) as Record<string, unknown>;
        const date = asString(record.date);
        if (!date || !isIsoDate(date)) errors.push(`${prefix}: change ${index} date must be YYYY-MM-DD`);
        else if (published && date < published) errors.push(`${prefix}: change ${index} predates publication`);
        const summary = asString(record.summary);
        if (!summary || summary.trim().length < 20) errors.push(`${prefix}: change ${index} needs a summary of what changed`);
      });
  }

  const tags = asStringArray(data.tags);
  if (!tags || tags.length === 0) errors.push(`${prefix}: tags must be a non-empty list`);

  const sources = data.sources;
  if (!Array.isArray(sources) || sources.length === 0) {
    errors.push(`${prefix}: sources must be a non-empty list`);
  } else {
    sources.forEach((source, index) => {
      if (!source || typeof source !== 'object') {
        errors.push(`${prefix}: source ${index} is not an object`);
        return;
      }
      const record = source as Record<string, unknown>;
      if (!asString(record.title)) errors.push(`${prefix}: source ${index} is missing a title`);
      const url = asString(record.url);
      if (!url || !isHttpsUrl(url)) errors.push(`${prefix}: source ${index} needs an https URL`);
      if (!SOURCE_KINDS.includes(record.kind as SourceKind)) {
        errors.push(`${prefix}: source ${index} has an unknown kind`);
      }
      if (!asString(record.publisher)) errors.push(`${prefix}: source ${index} is missing a publisher`);
    });
  }

  if (doc.collection === 'protocols') {
    requireString(errors, data, 'category', 3);
    requireString(errors, data, 'mechanism', 12);
    requireString(errors, data, 'versionContext', 20);
    checkIdList(errors, prefix, data.concepts, catalog.concepts, 'concept');
    checkIdList(errors, prefix, data.guides, catalog.guides, 'guide');
    checkIdList(errors, prefix, data.glossary, catalog.glossary, 'glossary');
    checkVersions(errors, prefix, data.versions);
  }

  if (doc.collection === 'guides') {
    if (!catalog.protocols.has(String(data.protocol))) {
      errors.push(`${prefix}: protocol "${String(data.protocol)}" does not exist`);
    }
    requireString(errors, data, 'versionContext', 20);
    checkIdList(errors, prefix, data.concepts, catalog.concepts, 'concept');
    checkIdList(errors, prefix, data.glossary, catalog.glossary, 'glossary');
    checkVersions(errors, prefix, data.versions);
    const related = asStringArray(data.relatedGuides) ?? [];
    for (const id of related) {
      if (!catalog.guides.has(id)) errors.push(`${prefix}: unknown guide "${id}"`);
    }
  }

  if (doc.collection === 'concepts') {
    const groups = new Set(['markets', 'credit', 'monetary', 'engineering']);
    if (!groups.has(String(data.group))) errors.push(`${prefix}: unknown concept group`);
    checkIdList(errors, prefix, data.protocols, catalog.protocols, 'protocol');
    checkIdList(errors, prefix, data.glossary, catalog.glossary, 'glossary');
    checkIdList(errors, prefix, data.related, catalog.concepts, 'concept');
  }

  const minBody = doc.collection === 'site' ? 800 : 1500;
  if (doc.body.trim().length < minBody) {
    errors.push(`${prefix}: body is too short to be a finished article`);
  }

  for (const hit of findPlaceholders(doc.body)) {
    errors.push(`${prefix}: placeholder text "${hit}"`);
  }
  if (title && findPlaceholders(title).length > 0) errors.push(`${prefix}: placeholder title`);

  for (const name of extractDiagrams(doc.body)) {
    if (!catalog.diagrams.has(name)) errors.push(`${prefix}: unknown diagram "${name}"`);
  }

  for (const raw of extractLinks(doc.body)) {
    if (raw.startsWith('http://') || /localhost|127\.0\.0\.1/i.test(raw)) {
      errors.push(`${prefix}: disallowed link ${raw}`);
      continue;
    }
    if (!raw.startsWith('/')) continue;
    const [path, hash] = raw.split('#');
    const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
    if (!catalog.paths.has(normalized)) {
      errors.push(`${prefix}: unresolved internal link ${raw}`);
      continue;
    }
    if (hash) {
      const headings = catalog.headings.get(normalized);
      if (headings && !headings.has(hash)) {
        errors.push(`${prefix}: unresolved anchor ${raw}`);
      }
    }
  }

  return errors;
}

function checkIdList(
  errors: string[],
  prefix: string,
  value: unknown,
  known: Set<string>,
  label: string,
): void {
  const ids = asStringArray(value);
  if (!ids) {
    errors.push(`${prefix}: ${label} references must be a list of strings`);
    return;
  }
  for (const id of ids) {
    if (!known.has(id)) errors.push(`${prefix}: unknown ${label} "${id}"`);
  }
}

function checkVersions(errors: string[], prefix: string, value: unknown): void {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${prefix}: versions must be a non-empty list`);
    return;
  }
  for (const version of value) {
    if (!version || typeof version !== 'object') {
      errors.push(`${prefix}: malformed version entry`);
      continue;
    }
    const record = version as Record<string, unknown>;
    if (!asString(record.name)) errors.push(`${prefix}: version is missing a name`);
    if (!VERSION_STATUSES.includes(record.status as VersionStatus)) {
      errors.push(`${prefix}: version status "${String(record.status)}" is not in the controlled vocabulary`);
    }
    if (!asString(record.note) || String(record.note).length < 8) {
      errors.push(`${prefix}: version "${String(record.name)}" needs a note`);
    }
  }
}

export function missingRequired(ids: readonly string[], present: Set<string>, label: string): string[] {
  return ids.filter((id) => !present.has(id)).map((id) => `Missing required ${label} "${id}"`);
}
