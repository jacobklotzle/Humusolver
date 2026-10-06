// Permanent (301) redirects, applied by server.mjs before anything else.
// Keep every old humusolver.com URL working so search rankings carry over.
export const redirects = {
  '/sample-page/': '/',
  '/feed/': '/',
  '/comments/feed/': '/',
  '/wp-sitemap.xml': '/sitemap-index.xml',
  '/sitemap.xml': '/sitemap-index.xml',
  '/testimonials/': '/contact-us/', // until real testimonials exist
};
