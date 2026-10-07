// POST /api/quote/ (trailing slash required, see trailingSlash in astro.config): the only server route.
// Validates a quote request or question, filters spam, then forwards it to the
// Google Apps Script web app, which appends a row to the Sheet and emails a notification.
import type { APIRoute } from 'astro';
import { parseLead, labelFor, OPERATIONS, PRODUCTS, DELIVERY, CONTACT_PREF, type Lead } from '../../lib/leads';

export const prerender = false;

// Forgiving read: ignore surrounding whitespace, quotes, and <angle brackets> picked up when
// pasting into Railway's Raw Editor (a bracketed secret silently breaks the Apps Script auth).
const env = (k: string) => (process.env[k] ?? '').trim().replace(/^(['"<])(.*)(['">])$/, '$2').trim();
const MIN_FILL_MS = 3000;

// Tiny in-memory rate limit: 6 submissions per IP per 10 minutes.
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 6;
}

const wantsJson = (req: Request) => (req.headers.get('accept') ?? '').includes('application/json');

function respond(req: Request, status: number, body: Record<string, unknown>, redirectTo?: string) {
  if (wantsJson(req)) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  }
  if (redirectTo) return new Response(null, { status: 303, headers: { Location: redirectTo } });
  // No-JS fallback error page
  const msg = String(body.message ?? 'Something went wrong.');
  const list = body.errors ? `<ul>${Object.values(body.errors as Record<string, string>).map((e) => `<li>${e}</li>`).join('')}</ul>` : '';
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Please check your request | Humusolver</title><style>body{font-family:system-ui,sans-serif;max-width:40rem;margin:3rem auto;padding:0 1rem;line-height:1.6;color:#231b14;background:#f6f1e7}a{color:#2f4a2c}</style></head><body><h1>Please check your request</h1><p>${msg}</p>${list}<p><a href="javascript:history.back()">Go back and fix it</a>, or call <a href="tel:+15745811989">574-581-1989</a>.</p></body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

function toRow(lead: Lead) {
  return {
    submittedAt: new Date().toISOString(),
    type: lead.type,
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    farm: lead.farm,
    state: lead.state,
    zip: lead.zip,
    operation: lead.operation ? labelFor(OPERATIONS, lead.operation) : '',
    acres: lead.acres,
    product: lead.product ? labelFor(PRODUCTS, lead.product) : '',
    packageSize: lead.packageSize,
    quantity: lead.quantity,
    delivery: lead.delivery ? labelFor(DELIVERY, lead.delivery) : '',
    neededBy: lead.neededBy,
    contactPref: lead.contactPref ? labelFor(CONTACT_PREF, lead.contactPref) : '',
    estimate: lead.estimate,
    message: lead.message,
    sourcePage: lead.sourcePage,
  };
}

// CSRF guard: a browser POST must come from a page on this same host.
function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return true; // non-browser clients; spam checks still apply
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!sameOrigin(request)) {
    return respond(request, 403, { ok: false, message: 'Cross-site submissions are not allowed.' });
  }
  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return respond(request, 400, { ok: false, message: 'We couldn\'t read that submission.' });
  }

  // Spam checks: honeypot field must be empty, and the form must have been open a few seconds.
  const honeypot = String(fd.get('website') ?? '');
  const startedAt = Number(fd.get('t') ?? 0);
  if (honeypot || !startedAt || Date.now() - startedAt < MIN_FILL_MS) {
    // Pretend success so bots learn nothing.
    return respond(request, 200, { ok: true }, '/thank-you/');
  }
  // Railway sits behind a proxy, so prefer the forwarded client IP.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'unknown';
  if (rateLimited(ip)) {
    return respond(request, 429, { ok: false, message: 'Too many submissions. Please call us at 574-581-1989.' });
  }

  const { lead, errors } = parseLead(fd);
  if (Object.keys(errors).length) {
    return respond(request, 422, { ok: false, message: 'Please fix the highlighted fields.', errors });
  }

  const row = toRow(lead);
  const url = env('APPS_SCRIPT_URL');
  const production = env('SITE_MODE') === 'production';

  if (!url) {
    console.warn('[lead] APPS_SCRIPT_URL not set. Lead logged only:', JSON.stringify(row));
    if (production) {
      return respond(request, 503, { ok: false, message: 'Our form is temporarily unavailable. Please call 574-581-1989.' });
    }
    return respond(request, 200, { ok: true, demo: true }, '/thank-you/');
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env('APPS_SCRIPT_SECRET'), notifyTo: env('LEAD_NOTIFY_TO'), lead: row }),
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      const hint = data.error === 'unauthorized' ? ` (APPS_SCRIPT_SECRET in Railway is ${env('APPS_SCRIPT_SECRET').length} chars; the script's secret is 64)` : '';
      throw new Error(`Apps Script responded ${res.status}: ${data.error ?? 'unknown error'}${hint}`);
    }
  } catch (err) {
    // Keep the lead in the Railway logs so it's never lost.
    console.error('[lead] Failed to forward lead:', err, JSON.stringify(row));
    return respond(request, 502, {
      ok: false,
      message: 'We couldn\'t send your request just now. Please call 574-581-1989 and we\'ll take care of you.',
    });
  }

  return respond(request, 200, { ok: true }, '/thank-you/');
};
