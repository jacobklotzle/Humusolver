// Production entry point for Railway.
// Wraps Astro's standalone Node handler to add: 301 redirects, canonical host,
// compression, security headers, and (in preview mode) noindex + optional basic auth.
import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import compression from 'compression';
import { redirectFor } from './src/lib/redirects.mjs';

process.env.ASTRO_NODE_AUTOSTART = 'disabled';
const { handler } = await import('./dist/server/entry.mjs');

const compress = compression(); // gzip/brotli for HTML, CSS, JS, JSON, SVG

const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const PREVIEW = process.env.SITE_MODE !== 'production';
// Forgiving compare: ignore surrounding whitespace, quotes, and <angle brackets> (easy to paste
// into Railway's Raw Editor from a template), on both the stored and the typed password.
const clean = (v = '') => v.trim().replace(/^(['"<])(.*)(['">])$/, '$2').trim();
const PASSWORD = clean(process.env.PREVIEW_PASSWORD);
const CANONICAL = process.env.SITE_URL ? new URL(process.env.SITE_URL) : null;

function safeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

function authorized(req) {
  if (!PREVIEW || !PASSWORD) return true;
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;
  const decoded = Buffer.from(header.slice(6), 'base64').toString();
  const pass = clean(decoded.slice(decoded.indexOf(':') + 1)); // username is ignored
  return safeEqual(pass, PASSWORD);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');

  // www → apex (only once a real domain is configured in production)
  const host = req.headers.host || '';
  if (!PREVIEW && CANONICAL && host && host !== CANONICAL.host && host === `www.${CANONICAL.host}`) {
    res.writeHead(301, { Location: `${CANONICAL.origin}${url.pathname}${url.search}` });
    return res.end();
  }

  const target = redirectFor(url.pathname);
  if (target) {
    res.writeHead(301, { Location: target + url.search });
    return res.end();
  }

  if (url.pathname !== '/healthz' && !authorized(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Humusolver preview"' });
    return res.end('Preview is password protected.');
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (PREVIEW) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (url.pathname.startsWith('/_astro/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  if (url.pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('ok');
  }

  compress(req, res, () => handler(req, res));
});

server.listen(PORT, HOST, () => {
  console.log(`Humusolver site listening on http://${HOST}:${PORT} (${PREVIEW ? 'preview' : 'production'})`);
  if (PREVIEW) console.log(PASSWORD ? `Preview password gate ON (${PASSWORD.length} characters)` : 'Preview password gate OFF (PREVIEW_PASSWORD not set)');
});
