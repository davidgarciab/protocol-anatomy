import { slug } from 'github-slugger';

/** Fragment id for a FAQ item, shared by the article that renders it and every page that links to it. */
export function faqAnchor(question: string): string {
  return slug(question);
}
