# Humusolver website

Marketing and lead-generation site for **Humusolver** humic and fulvic acid concentrate (Nuest Inc., Monticello, IN).
It's built with [Astro](https://astro.build), stored on GitHub, and hosted on [Railway](https://railway.com).

> **Status:** demo/preview. Placeholders like `PRICE NEEDED` are highlighted on the site and must be filled in
> before launch. Run `npm run placeholders` to list them.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:4321. To run the production server exactly as Railway does:

```bash
npm run build && npm start
```

That serves the site at http://localhost:8080.

## Editing content (no coding needed)

All of the site's text lives in `src/content/`. Edit a file on GitHub (open it, click the pencil, then
**Commit changes**), and Railway republishes the site in about 2 minutes.

| To change… | Edit this file |
|---|---|
| Prices, package sizes, application rates | `src/content/products/humusolver-100.yaml` or `fs-granular.yaml` |
| Phone, email, address, hours, OMRI status | `src/site.config.ts` |
| FAQ questions | `src/content/faq.yaml` |
| Row crops, pasture, and application pages | `src/content/uses/*.md` |
| How It Works, About, Services, Privacy | `src/content/pages/*.md` |
| Research summaries | `src/content/research.yaml` |
| Photo captions | `src/content/photos.yaml` |

**Placeholders:** text like `[[PRICE NEEDED: 50 lb bag]]` shows as a yellow tag on the preview site. Replace the
whole tag, brackets included, with the real value. Example: `price: "$95.00"`.

## Lead inbox

Quote requests and questions are saved to a Google Sheet and emailed to you. Setup:
[`scripts/apps-script/README.md`](scripts/apps-script/README.md).

## Environment variables

See [`.env.example`](.env.example). Set them in Railway under **Service → Variables**, and never commit real values.

## Going live

1. Fill every placeholder (`npm run placeholders` should report 0).
2. In Railway, set `SITE_MODE=production` and remove `PREVIEW_PASSWORD`.
3. Point humusolver.com at Railway. Old URLs like `/about-us/` already match, and `/sample-page/` redirects.
