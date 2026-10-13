export function readingMinutes(markdown: string | undefined): number {
  if (!markdown) return 1;
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, ' ');
  const words = withoutCode.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
