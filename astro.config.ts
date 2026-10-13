import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { rehypeDiagrams } from './src/plugins/rehype-diagrams';

export default defineConfig({
  site: 'https://protocols.davidgarciab.com',
  output: 'static',
  trailingSlash: 'never',
  compressHTML: true,
  integrations: [mdx(), sitemap()],
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
