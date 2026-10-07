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

// Prefix redirects for leftover WordPress paths (checked after the exact matches above).
// Order matters: the first matching prefix wins.
export const prefixRedirects = [
  ['/wp-content/uploads/2025/07/2025-Humusolver-OMRI', '/products/humusolver-100/'], // old OMRI certificate link
  ['/wp-content/uploads/', '/photos/'], // old image URLs indexed by Google Images
  ['/wp-content/', '/'],
  ['/wp-admin', '/'],
  ['/wp-login.php', '/'],
  ['/wp-json/', '/'],
  ['/xmlrpc.php', '/'],
  ['/category/', '/'],
  ['/author/', '/about-us/'],
];

export function redirectFor(pathname) {
  if (redirects[pathname]) return redirects[pathname];
  // tolerate a missing trailing slash on legacy page URLs, e.g. /about-us → /about-us/
  if (!pathname.endsWith('/') && !pathname.includes('.') && redirects[pathname + '/']) return redirects[pathname + '/'];
  const hit = prefixRedirects.find(([prefix]) => pathname.startsWith(prefix));
  return hit ? hit[1] : null;
}
