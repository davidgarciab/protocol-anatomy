const FENCE = /```[\s\S]*?```/g;
const URL = /https:\/\/[^\s)>\]]+/g;

export function extractHttpsUrls(markdown: string): string[] {
  const withoutFences = markdown.replace(FENCE, '');
  return [...withoutFences.matchAll(URL)].map((match) => match[0].replace(/[.,;:]+$/, ''));
}

export function unexpectedDraftUrls(draft: string, allowed: Set<string>): string[] {
  return [...new Set(extractHttpsUrls(draft).filter((url) => !allowed.has(url)))];
}
