import { appendFileSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  formatReport,
  issueDecision,
  mergeBaseline,
  reviewSources,
  validateWatchSources,
  type BaselineEntry,
  type Observation,
  type OpenIssue,
  type WatchSource,
} from '../src/lib/editorial';

const root = join(import.meta.dirname, '..');
const editorialDir = join(root, 'editorial');
const sourcesPath = join(editorialDir, 'sources.json');
const baselinePath = join(editorialDir, 'baseline.json');
const cachePath = join(editorialDir, '.cache.json');
const reportPath = join(editorialDir, 'review.md');
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const args = new Set(process.argv.slice(2));
const writeBaseline = args.has('--write-baseline');
const refresh = args.has('--refresh') || writeBaseline;
const openIssue = args.has('--github-issue');

interface CacheFile {
  fetchedAt: string;
  observations: Observation[];
}

interface GitHubResponse {
  status: number;
  body: unknown;
  remaining: number;
}

function readJson<T>(path: string, fallback: T): T {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function articleFiles(): Set<string> {
  const files = new Set<string>();
  const walk = (dir: string, prefix: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      const relative = `${prefix}${entry}`;
      if (statSync(path).isDirectory()) walk(path, `${relative}/`);
      else if (entry.endsWith('.md')) files.add(relative);
    }
  };
  walk(join(root, 'src/content'), 'src/content/');
  return files;
}

function utcDate(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

async function githubGet(path: string, token: string | undefined): Promise<GitHubResponse> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'protocol-anatomy-editorial-review',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`https://api.github.com${path}`, {
    headers,
    signal: AbortSignal.timeout(20_000),
  });
  const remaining = Number(response.headers.get('x-ratelimit-remaining') ?? '99');
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = null;
    }
  }
  return { status: response.status, body, remaining: Number.isFinite(remaining) ? remaining : 99 };
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
}

async function observe(source: WatchSource, token: string | undefined): Promise<Observation> {
  try {
    if (source.kind === 'github-release') {
      const response = await githubGet(`/repos/${source.repo}/releases/latest`, token);
      if (response.status === 403 || response.status === 429) {
        return { id: source.id, status: 'unavailable', detail: `GitHub rate limit (HTTP ${response.status})` };
      }
      const record = asRecord(response.body);
      const tag = typeof record?.tag_name === 'string' ? record.tag_name : '';
      const url = typeof record?.html_url === 'string' ? record.html_url : '';
      if (response.status !== 200 || !tag || !url) {
        return { id: source.id, status: 'unavailable', detail: `HTTP ${response.status}` };
      }
      return { id: source.id, status: 'ok', observed: tag, url };
    }

    const params = new URLSearchParams({
      path: source.path ?? '',
      sha: source.ref ?? 'main',
      per_page: '1',
    });
    const response = await githubGet(`/repos/${source.repo}/commits?${params}`, token);
    if (response.status === 403 || response.status === 429) {
      return { id: source.id, status: 'unavailable', detail: `GitHub rate limit (HTTP ${response.status})` };
    }
    if (response.status !== 200 || !Array.isArray(response.body) || response.body.length === 0) {
      return { id: source.id, status: 'unavailable', detail: `HTTP ${response.status}` };
    }
    const commit = asRecord(response.body[0]);
    const sha = typeof commit?.sha === 'string' ? commit.sha : '';
    const url = typeof commit?.html_url === 'string' ? commit.html_url : '';
    if (!sha || !url) return { id: source.id, status: 'unavailable', detail: 'commit response had no sha' };
    return { id: source.id, status: 'ok', observed: sha, url };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'request failed';
    return { id: source.id, status: 'unavailable', detail: message };
  }
}

function loadCache(): CacheFile | undefined {
  if (refresh || !existsSync(cachePath)) return undefined;
  try {
    const cache = readJson<CacheFile>(cachePath, { fetchedAt: '', observations: [] });
    const age = Date.now() - Date.parse(cache.fetchedAt);
    if (!Number.isFinite(age) || age > CACHE_TTL_MS) return undefined;
    return cache;
  } catch {
    return undefined;
  }
}

async function fetchObservations(sources: WatchSource[], token: string | undefined): Promise<Observation[]> {
  const cache = loadCache();
  if (cache && sources.every((source) => cache.observations.some((item) => item.id === source.id))) {
    console.log('Using editorial cache from the last 6 hours. Pass --refresh to fetch again.');
    return cache.observations;
  }
  const observations: Observation[] = [];
  let limited = false;
  for (const source of sources) {
    if (limited) {
      observations.push({ id: source.id, status: 'unavailable', detail: 'skipped after GitHub rate limit' });
      continue;
    }
    const observation = await observe(source, token);
    if (observation.detail?.includes('rate limit')) limited = true;
    observations.push(observation);
  }
  writeFileSync(cachePath, `${JSON.stringify({ fetchedAt: new Date().toISOString(), observations }, null, 2)}\n`);
  return observations;
}

async function githubIssue(report: string, reviewFindingCount: number, fingerprint: string, token: string, repository: string) {
  const list = await githubGet(`/repos/${repository}/issues?state=open&labels=${encodeURIComponent('editorial-review')}&per_page=20`, token);
  let issues: OpenIssue[] = [];
  if (list.status === 200 && Array.isArray(list.body)) {
    issues = list.body.flatMap((item) => {
      const record = asRecord(item);
      if (!record || record.pull_request) return [];
      const number = typeof record.number === 'number' ? record.number : 0;
      const body = typeof record.body === 'string' ? record.body : '';
      return number ? [{ number, body }] : [];
    });
  } else if (list.status !== 404) {
    throw new Error(`Could not list editorial issues (HTTP ${list.status})`);
  }

  const decision = issueDecision(issues, fingerprint, reviewFindingCount);
  if (decision.action === 'skip') {
    console.log(decision.reason);
    return;
  }

  if (list.status === 404) {
    const created = await githubSend(`/repos/${repository}/labels`, token, {
      name: 'editorial-review',
      color: '1f4b99',
      description: 'Upstream changes that may affect published articles',
    });
    if (created.status !== 201 && created.status !== 422) {
      throw new Error(`Could not create the editorial-review label (HTTP ${created.status})`);
    }
  }

  if (decision.action === 'update') {
    const updated = await githubSend(`/repos/${repository}/issues/${decision.number}`, token, {
      title: issueTitle(reviewFindingCount),
      body: report,
    }, 'PATCH');
    if (updated.status !== 200) throw new Error(`Could not update issue #${decision.number} (HTTP ${updated.status})`);
    console.log(`Updated issue #${decision.number}`);
    return;
  }

  const created = await githubSend(`/repos/${repository}/issues`, token, {
    title: issueTitle(reviewFindingCount),
    body: report,
    labels: ['editorial-review'],
  });
  if (created.status !== 201) throw new Error(`Could not create an editorial issue (HTTP ${created.status})`);
  const record = asRecord(created.body);
  console.log(`Created issue #${typeof record?.number === 'number' ? record.number : '?'}`);
}

function issueTitle(count: number): string {
  return `Editorial review: ${count} upstream change${count === 1 ? '' : 's'}`;
}

async function githubSend(path: string, token: string, payload: unknown, method = 'POST'): Promise<GitHubResponse> {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'protocol-anatomy-editorial-review',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = null;
    }
  }
  return { status: response.status, body, remaining: 99 };
}

async function main() {
  const sources = readJson<WatchSource[]>(sourcesPath, []);
  const errors = validateWatchSources(sources, articleFiles());
  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  const token = process.env.GITHUB_TOKEN || undefined;
  const observations = await fetchObservations(sources, token);
  const detectedOn = utcDate();
  const baseline = readJson<Record<string, BaselineEntry>>(baselinePath, {});
  const review = reviewSources(sources, baseline, observations, detectedOn);
  const report = formatReport(review, sources);
  writeFileSync(reportPath, report);
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) appendFileSync(summaryPath, `${report}\n`);
  console.log(`changes=${review.findings.length} unavailable=${review.unavailable.length} fingerprint=${review.fingerprint}`);
  console.log(`Wrote ${reportPath}`);

  if (writeBaseline) {
    const next = mergeBaseline(baseline, observations, detectedOn);
    writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`);
    const kept = observations.filter((item) => item.status !== 'ok').map((item) => item.id);
    console.log(kept.length > 0 ? `Baseline updated. Kept previous entries for: ${kept.join(', ')}` : 'Baseline updated.');
  }

  if (!openIssue || review.findings.length === 0) {
    if (openIssue) console.log('No upstream changes to review.');
    return;
  }
  const repository = process.env.GITHUB_REPOSITORY;
  if (!token || !repository) {
    console.error('GITHUB_TOKEN and GITHUB_REPOSITORY are required for --github-issue.');
    process.exit(1);
  }
  try {
    await githubIssue(report, review.findings.length, review.fingerprint, token, repository);
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'GitHub issue request failed');
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'editorial review failed');
  process.exit(1);
});
