import { createHash } from 'node:crypto';

export const SOURCE_BOUND = 20;

export const REVIEW_ACTION =
  'Read the linked change. Update an article only if a claim that cites this source no longer matches. A new commit or release can be formatting, a deployment script, or an unrelated feature. Leave lastVerified unchanged until the sources have actually been read.';

const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export interface WatchSource {
  id: string;
  kind: 'github-file' | 'github-release';
  repo: string;
  path?: string;
  ref?: string;
  articles: string[];
  why: string;
}

export interface Observation {
  id: string;
  status: 'ok' | 'unavailable';
  observed?: string;
  url?: string;
  detail?: string;
}

export interface BaselineEntry {
  observed: string;
  observedAt: string;
  url: string;
}

export interface Finding {
  sourceId: string;
  articles: string[];
  why: string;
  previous: string;
  current: string;
  url: string;
  detectedOn: string;
  action: string;
}

export interface UnavailableNote {
  sourceId: string;
  articles: string[];
  detail: string;
}

export interface Review {
  detectedOn: string;
  findings: Finding[];
  unavailable: UnavailableNote[];
  fingerprint: string;
}

export interface OpenIssue {
  number: number;
  body: string;
}

export type IssueDecision =
  | { action: 'skip'; reason: string }
  | { action: 'create' }
  | { action: 'update'; number: number };

export function validateWatchSources(sources: WatchSource[], files: Set<string>): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  if (sources.length === 0) errors.push('source list is empty');
  if (sources.length > SOURCE_BOUND) errors.push(`source list exceeds the bound of ${SOURCE_BOUND}`);
  for (const source of sources) {
    if (!source.id || ids.has(source.id)) errors.push(`duplicate or empty source id "${source.id}"`);
    ids.add(source.id);
    if (source.kind !== 'github-file' && source.kind !== 'github-release') {
      errors.push(`${source.id}: kind must be github-file or github-release`);
    }
    if (!REPO.test(source.repo)) errors.push(`${source.id}: repo must be owner/name`);
    if (source.kind === 'github-file' && !source.path) errors.push(`${source.id}: file watch needs a path`);
    if (source.kind === 'github-release' && source.path) {
      errors.push(`${source.id}: release watch does not use a path`);
    }
    if (!source.why || source.why.trim().length < 40) errors.push(`${source.id}: why is too short to explain a review`);
    if (!Array.isArray(source.articles) || source.articles.length === 0) {
      errors.push(`${source.id}: needs at least one article`);
    } else {
      for (const article of source.articles) {
        if (!files.has(article)) errors.push(`${source.id}: missing article ${article}`);
      }
    }
  }
  return errors;
}

export function findingFingerprint(findings: Finding[]): string {
  const body = findings
    .map((finding) => `${finding.sourceId}\t${finding.previous}\t${finding.current}`)
    .sort()
    .join('\n');
  return createHash('sha256').update(body).digest('hex').slice(0, 16);
}

export function reviewSources(
  sources: WatchSource[],
  baseline: Record<string, BaselineEntry>,
  observations: Observation[],
  detectedOn: string,
): Review {
  const byId = new Map(observations.map((observation) => [observation.id, observation]));
  const findings: Finding[] = [];
  const unavailable: UnavailableNote[] = [];
  for (const source of sources) {
    const observation = byId.get(source.id);
    if (!observation || observation.status !== 'ok' || !observation.observed) {
      unavailable.push({
        sourceId: source.id,
        articles: source.articles,
        detail: observation?.detail ?? 'no observation',
      });
      continue;
    }
    const previous = baseline[source.id]?.observed;
    if (previous === observation.observed) continue;
    findings.push({
      sourceId: source.id,
      articles: source.articles,
      why: source.why,
      previous: previous ?? '(not recorded)',
      current: observation.observed,
      url: observation.url ?? '',
      detectedOn,
      action: REVIEW_ACTION,
    });
  }
  return { detectedOn, findings, unavailable, fingerprint: findingFingerprint(findings) };
}

export function mergeBaseline(
  baseline: Record<string, BaselineEntry>,
  observations: Observation[],
  detectedOn: string,
): Record<string, BaselineEntry> {
  const next: Record<string, BaselineEntry> = { ...baseline };
  for (const observation of observations) {
    if (observation.status !== 'ok' || !observation.observed || !observation.url) continue;
    next[observation.id] = {
      observed: observation.observed,
      observedAt: detectedOn,
      url: observation.url,
    };
  }
  return Object.fromEntries(Object.entries(next).sort(([left], [right]) => left.localeCompare(right)));
}

export function issueDecision(openIssues: OpenIssue[], fingerprint: string, findingCount: number): IssueDecision {
  if (findingCount === 0) return { action: 'skip', reason: 'no upstream changes to review' };
  const marker = fingerprintMarker(fingerprint);
  if (openIssues.some((issue) => issue.body.includes(marker))) {
    return { action: 'skip', reason: 'an open issue already records this diff' };
  }
  const existing = openIssues[0];
  if (existing) return { action: 'update', number: existing.number };
  return { action: 'create' };
}

export function fingerprintMarker(fingerprint: string): string {
  return `<!-- fingerprint:${fingerprint} -->`;
}

export function formatReport(review: Review, sources: WatchSource[]): string {
  const why = new Map(sources.map((source) => [source.id, source.why]));
  const lines = [
    '# Editorial review',
    '',
    fingerprintMarker(review.fingerprint),
    '',
    `Detected: ${review.detectedOn} (UTC)`,
    '',
    'This report lists upstream changes that may affect published articles. It does not edit those articles. A new commit or release is not, by itself, an error. Unavailable sources are omitted from the GitHub issue so a network failure is not filed again every week.',
    '',
  ];
  if (review.findings.length === 0) {
    lines.push('## Changes', '', 'No cited source moved relative to the baseline.', '');
  } else {
    lines.push('## Changes', '');
    for (const finding of review.findings) {
      lines.push(
        `### ${finding.sourceId}`,
        '',
        `- Source: ${finding.url || '(no URL returned)'}`,
        `- Previous: \`${finding.previous}\``,
        `- Current: \`${finding.current}\``,
        `- Why it might matter: ${why.get(finding.sourceId) ?? finding.why}`,
        '- Articles:',
        ...finding.articles.map((article) => `  - \`${article}\``),
        `- Review: ${finding.action}`,
        '',
      );
    }
  }
  lines.push('## Unavailable sources', '');
  if (review.unavailable.length === 0) {
    lines.push('None.', '');
  } else {
    for (const note of review.unavailable) {
      lines.push(
        `### ${note.sourceId}`,
        '',
        `- Detail: ${note.detail}`,
        '- Articles:',
        ...note.articles.map((article) => `  - \`${article}\``),
        '- The previous baseline entry was left in place.',
        '',
      );
    }
  }
  return lines.join('\n');
}
