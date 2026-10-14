import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { rehypeDiagrams } from './src/plugins/rehype-diagrams';
import { DEFAULT_POSTHOG_HOST } from './src/lib/analytics';

// Cloudflare Pages passes build variables through process.env; a local .env only matters for the default host.
const posthogHost = new URL(process.env.PUBLIC_POSTHOG_HOST || DEFAULT_POSTHOG_HOST).origin;
// installPostHogStub loads array.js from the matching -assets host.
const posthogAssets = posthogHost.replace('.i.posthog.com', '-assets.i.posthog.com');

export default defineConfig({
  site: 'https://protocols.davidgarciab.com',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        `connect-src 'self' ${posthogHost} ${posthogAssets}`,
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: { resources: ["'self'", posthogAssets] },
      // Shiki writes inline style attributes, so style-src cannot be hash-only.
      styleDirective: { resources: ["'self'", "'unsafe-inline'"] },
    },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return path !== '/search' && path !== '/search/';
      },
    }),
  ],
  markdown: {
    processor: unified({ rehypePlugins: [rehypeDiagrams] }),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      wrap: true,
    },
  },
});
