import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { rehypeDiagrams } from './src/plugins/rehype-diagrams';

export default defineConfig({
  site: 'https://protocols.davidgarciab.com',
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
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
