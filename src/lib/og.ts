import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import sharp from 'sharp';
import { OG_HEIGHT, OG_WIDTH } from './og-size';
import { SITE } from './site';

export interface OgCard {
  kicker: string;
  title: string;
  description: string;
}

const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFileSync(require.resolve(`${pkg}/files/${file}`));

// Satori turns text into paths, so the PNG does not depend on fonts installed on the build machine.
const fonts = [
  { name: 'Serif', data: font('@fontsource/source-serif-4', 'source-serif-4-latin-600-normal.woff'), weight: 600 as const },
  { name: 'Sans', data: font('@fontsource/source-sans-3', 'source-sans-3-latin-400-normal.woff'), weight: 400 as const },
  { name: 'Sans', data: font('@fontsource/source-sans-3', 'source-sans-3-latin-600-normal.woff'), weight: 600 as const },
];

// Light theme tokens from global.css.
const color = { bg: '#f3f0e8', raised: '#fffdf8', ink: '#1b1914', muted: '#4a463e', line: '#d9d1c3', accent: '#0f5f5b' };

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

const mark = h(
  'svg',
  { width: 44, height: 44 },
  [
    h('circle', {}, undefined, { cx: 16, cy: 16, r: 11, fill: 'none', stroke: color.accent, 'stroke-width': 1.7 }),
    h('path', {}, undefined, { d: 'M4 16h24', fill: 'none', stroke: color.accent, 'stroke-width': 1.7 }),
    h('circle', {}, undefined, { cx: 16, cy: 16, r: 2.1, fill: color.accent }),
  ],
  { viewBox: '0 0 32 32' },
);

function titleSize(title: string): number {
  if (title.length <= 28) return 76;
  if (title.length <= 48) return 64;
  return 54;
}

export async function renderOgImage(card: OgCard): Promise<Buffer> {
  const tree = h(
    'div',
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 72px',
      background: color.bg,
      borderLeft: `16px solid ${color.accent}`,
      fontFamily: 'Sans',
      color: color.ink,
    },
    [
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h(
          'div',
          { fontSize: 26, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: color.accent, marginBottom: 28 },
          card.kicker,
        ),
        h(
          'div',
          { fontFamily: 'Serif', fontSize: titleSize(card.title), fontWeight: 600, lineHeight: 1.1, marginBottom: 28 },
          card.title,
        ),
        h('div', { fontSize: 32, lineHeight: 1.4, color: color.muted, maxWidth: 980 }, card.description),
      ]),
      h(
        'div',
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `2px solid ${color.line}`,
          paddingTop: 28,
          fontSize: 28,
          flexShrink: 0,
        },
        [
          h('div', { display: 'flex', alignItems: 'center', gap: 16, fontWeight: 600 }, [mark, SITE.name]),
          h('div', { color: color.muted }, new URL(SITE.url).hostname),
        ],
      ),
    ],
  );

  const svg = await satori(tree as Parameters<typeof satori>[0], { width: OG_WIDTH, height: OG_HEIGHT, fonts });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
}
