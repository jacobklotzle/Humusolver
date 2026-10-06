// JSON-LD builders. Placeholders are stripped so structured data never contains [[...]].
import { business } from '../site.config';
import { PLACEHOLDER_RE } from './placeholders.mjs';

const SITE = (import.meta.env.SITE ?? 'https://humusolver.com').replace(/\/$/, '');
export const clean = (s = '') => s.replace(new RegExp(PLACEHOLDER_RE.source, 'g'), '').replace(/\s{2,}/g, ' ').trim();

export const orgId = `${SITE}/#organization`;

export function organizationSchema() {
  return {
    '@type': ['Organization', 'LocalBusiness'],
    '@id': orgId,
    name: business.name,
    legalName: business.legalName,
    url: `${SITE}/`,
    logo: `${SITE}/logo.png`,
    image: `${SITE}/og-default.jpg`,
    email: business.email,
    telephone: '+1-574-581-1989',
    description: 'Humic and fulvic acid concentrate for row crops, pasture, and soil systems. Family business in Monticello, Indiana. Ships nationwide.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    areaServed: { '@type': 'Country', name: 'United States' },
    contactPoint: business.people.map((p) => ({
      '@type': 'ContactPoint',
      contactType: p.role,
      name: p.name,
      telephone: p.phoneHref.replace('tel:', ''),
    })),
  };
}

export function websiteSchema() {
  return { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: business.name, publisher: { '@id': orgId } };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', href: '/' }, ...items].map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE}${c.href}`,
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs
      .filter((f) => clean(f.a))
      .map((f) => ({ '@type': 'Question', name: clean(f.q), acceptedAnswer: { '@type': 'Answer', text: clean(f.a) } })),
  };
}

export function productSchema(p: { name: string; summary: string; slug: string; image?: string; packages: { size: string; price: string }[] }) {
  // Only emit offers once real prices exist (a price is "real" if it has a digit and no placeholder).
  const priced = p.packages.filter((pk) => /\d/.test(pk.price) && clean(pk.price) === pk.price);
  return {
    '@type': 'Product',
    name: p.name,
    description: clean(p.summary),
    url: `${SITE}/products/${p.slug}/`,
    ...(p.image ? { image: `${SITE}${p.image}` } : {}),
    brand: { '@type': 'Brand', name: business.name },
    manufacturer: { '@id': orgId },
    category: 'Soil amendment',
    ...(priced.length
      ? {
          offers: priced.map((pk) => ({
            '@type': 'Offer',
            name: pk.size,
            price: pk.price.replace(/[^0-9.]/g, ''),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: { '@id': orgId },
          })),
        }
      : {}),
  };
}
