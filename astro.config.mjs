// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { remarkPlaceholders } from './src/lib/remark-placeholders.mjs';

const SITE_URL = process.env.SITE_URL || 'https://humusolver.com';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  output: 'static', // every page is prerendered; /api/quote opts out with `prerender = false`
  adapter: node({ mode: 'standalone' }),
  integrations: [
    sitemap({
      filter: (page) => !/\/(thank-you|testimonials)\/$/.test(page),
    }),
  ],
  markdown: {
    processor: unified({ remarkPlugins: [remarkPlaceholders] }),
  },
  image: {
    responsiveStyles: true,
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
