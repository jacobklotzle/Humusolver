# Humusolver Site

Marketing and lead-generation site for **Humusolver**, a humic and fulvic acid concentrate sold by
Nuest Inc. (Monticello, IN). It's a rebuild of humusolver.com. Right now it's a **demo**, kept separate
from the live WordPress site, to show the owner what the site could be.

Main goal: **generate quote requests** from row-crop farmers (first) and pasture and livestock
operations (second). Every page must end with a clear next step.

## Stack

- **Astro** (static pages). Uses the `@astrojs/node` standalone adapter only so the single form
  endpoint can run on the server. Every page is prerendered.
- **Plain CSS** with design tokens in `src/styles/tokens.css`. No CSS framework.
- **Fonts**: self-hosted through Fontsource. No Google Fonts requests at runtime.
- **Leads**: `POST /api/quote/` (trailing slash) validates the form, then forwards it to a Google Apps Script web app.
  The script appends a row to a Google Sheet and emails a notification.
- **Hosting**: Railway, which auto-deploys the `main` branch from GitHub. `server.mjs` wraps
  Astro's Node handler to add 301s, security headers, noindex, and preview basic auth.

## Commands

```bash
npm run dev        # local dev server at http://localhost:4321
npm run build      # production build (fails if placeholders remain and SITE_MODE=production)
npm run preview    # serve the built site (Astro preview)
npm start          # run the production server (server.mjs) exactly as Railway does
npm run placeholders  # list every open [[PLACEHOLDER]]
npm run check      # astro check + placeholder report
```

## Project structure

```
src/
  content/           # ALL editable copy lives here (Markdown/YAML); the owner edits these
    uses/            # one .md per application or audience page
    products/        # one .yaml per product (rates, package sizes, prices)
    pages/           # benefits, about-us, services, privacy
    research.yaml    # verified study summaries (livestock entries are feature-flagged)
    faq.yaml
    photos.yaml      # gallery captions and alt text
  components/        # Astro components (CtaBand, LeadForm, Estimator, Placeholder, ...)
  lib/               # schema.ts (JSON-LD), leads.ts (form fields + validation), placeholders, redirects
  site.config.ts     # business facts: phone, address, people, OMRI flag
  layouts/           # BaseLayout handles <head>, SEO meta, JSON-LD, header/footer
  pages/             # routes; keep thin, pull content from src/content
  pages/api/quote.ts # the only server route
  styles/
public/              # static files: favicon, robots.txt, og images
scripts/             # placeholder report, Apps Script source + setup guide (apps-script/)
server.mjs           # Railway entry: redirects, compression, headers, preview auth
railway.json         # informational only: Railway deprecated config-as-code and ignores it for this service
```

## Content rules (non-negotiable)

- **Never invent** testimonials, statistics, yield numbers, prices, certifications, addresses, or
  citations. Use a placeholder tag instead.
- Placeholders use the `<Placeholder>` component, or the inline form `[[TYPE: note]]` in content
  files. Types: `TESTIMONIAL NEEDED`, `PRICE NEEDED`, `CITATION NEEDED`, `PHOTO NEEDED`,
  `ADDRESS NEEDED`, `LABEL CHECK`, `OWNER CONFIRM`. Placeholders render highlighted in preview mode.
  `npm run check` lists every one.
- **Claims must be modest** and should match the product label. Do not write:
  disease prevention or cure, "immunity," "detoxifies," pest control, guaranteed yields, or
  "nitrogen stabilizer" (EPA can treat that as a pesticide claim). Use "may," "can help," and "is
  associated with" for general humate science, and keep it separate from claims about Humusolver
  itself.
- **Livestock**: Humusolver's OMRI listing is for *crop fertilizers and soil amendments*. Never
  give feeding directions or say Humusolver is a feed or supplement. Livestock content is limited to
  (a) pasture and forage soil health, and (b) the Research page, which summarizes peer-reviewed work
  on humic substances in general. Every Research entry carries a "this is about humic substances
  broadly, not Humusolver" note. That page stays behind `FEATURE_LIVESTOCK_RESEARCH` until the owner
  confirms the product's regulatory status.
- **Citations**: only cite papers whose DOI or publisher URL was actually opened and checked.
  Record authors, year, journal, DOI, a one-line finding, and the study conditions (species, dose,
  duration). No paraphrased stats without the source.
- OMRI: say "OMRI Listed" only once a current certificate is confirmed (the copy on the old site
  expired 2026-06-01). Until then: `[[OWNER CONFIRM: OMRI status]]`.

## SEO conventions

- Every page's frontmatter needs `title` (≤ 60 chars, format `Topic | Humusolver`) and
  `description` (≤ 155 chars). The build warns when either is missing.
- One `<h1>` per page. Logical heading order.
- JSON-LD from `src/lib/schema.ts` (placeholders are stripped automatically): `Organization` + `LocalBusiness` site-wide,
  `Product` on product pages, `FAQPage` on /faq/, `BreadcrumbList` on nested pages.
- Keep the legacy URLs (`/about-us/`, `/benefits/`, `/products/`, `/services/`, `/photos/`,
  `/contact-us/`). Real 301 redirects live in `src/lib/redirects.mjs` and are applied by
  `server.mjs` (the Railway entry point), e.g. `/sample-page/` → `/`.
- Trailing slashes everywhere. Canonical host: `https://humusolver.com` (non-www).
- While `SITE_MODE=preview`: send `noindex, nofollow` on every page, return a disallow-all
  robots.txt, and require HTTP basic auth if `PREVIEW_PASSWORD` is set.

## Quality bar

- Mobile-first. Lighthouse 90+ in every category on mobile.
- WCAG 2.2 AA: 4.5:1 text contrast, visible focus, labelled inputs, field-level error messages
  tied with `aria-describedby`, `prefers-reduced-motion` respected, and pinch-zoom never disabled.
- Images: use Astro `<Image>` with AVIF/WebP and explicit sizes. Alt text describes the photo's
  content (crop, stage, place), not just "photo."
- No client JS unless it earns its place. Islands only for the quote calculator and form UX.
- Phone numbers are always `tel:` links. A sticky "Call · Get a quote" bar shows on mobile.

## Environment variables

Never commit secrets. Keep `.env.example` up to date when adding a variable. Set values in Railway.

| Var | Purpose |
|---|---|
| `SITE_MODE` | `preview` (noindex + placeholders visible) or `production` |
| `SITE_URL` | canonical origin, e.g. `https://humusolver.com` |
| `PREVIEW_PASSWORD` | optional basic-auth password while in preview |
| `APPS_SCRIPT_URL` | Google Apps Script web-app URL that stores leads and sends email |
| `APPS_SCRIPT_SECRET` | shared secret the script checks on every request |
| `LEAD_NOTIFY_TO` | notification recipient (demo: Cob's email; launch: humusolver@gmail.com) |
| `FEATURE_LIVESTOCK_RESEARCH` | `true` to publish the livestock research section |

## Git workflow

- `main` deploys to Railway automatically, so keep it buildable.
- Make small, focused commits using Conventional Commits: `feat: add quote form endpoint`,
  `content: draft row-crop page`, `fix: focus ring contrast`.
- Run `npm run build` before committing anything that touches layouts, config, or the API route.

## Gotchas

- Astro scoped styles don't reach child components. To style an `<Icon>` SVG from a parent, use `:global(svg)`.
- YAML values containing `[[TYPE: note]]` must be quoted, because the colon breaks plain YAML.
- The `file()` loader doesn't preserve order, so `faq.yaml` and `photos.yaml` entries carry an `order` field.
- Astro 7 uses the `unified()` Markdown processor from `@astrojs/markdown-remark` so the placeholder remark plugin runs.
- Railway uses its defaults (`npm run build`, then `npm start`). Settings like the healthcheck path (`/healthz`) are set in the
  Railway dashboard, not `railway.json`. Auto-deploy depends on the **Railway App GitHub installation** (repo access:
  Humusolver only). If it says "Could not load branches", check github.com/settings/installations.
- Env values are read leniently (surrounding whitespace, quotes, and `<>` are stripped) because brackets pasted from
  docs caused real outages. Still, never write `<placeholder>` in paste-ready instructions.
- Debug secrets by length: the server logs `Preview password gate ON (N characters)`, and on a lead auth failure it
  logs the length of `APPS_SCRIPT_SECRET` (the expected length is 64).
