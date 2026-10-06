// Business facts used across the site. Edit here, not in individual pages.
// Anything wrapped in [[...]] is a placeholder that must be confirmed before launch.

export const SITE_MODE = (import.meta.env.SITE_MODE ?? process.env.SITE_MODE ?? 'preview') as
  | 'preview'
  | 'production';
export const IS_PREVIEW = SITE_MODE !== 'production';
export const FEATURE_LIVESTOCK_RESEARCH =
  (import.meta.env.FEATURE_LIVESTOCK_RESEARCH ?? process.env.FEATURE_LIVESTOCK_RESEARCH) === 'true';

export const business = {
  name: 'Humusolver',
  legalName: 'Nuest Inc.',
  tagline: 'Balanced soil makes healthy plants and animals.',
  phone: '574-581-1989',
  phoneHref: 'tel:+15745811989',
  email: 'humusolver@gmail.com',
  people: [
    { name: 'Lenard Nuest', role: 'Operations Manager', phone: '574-581-1989', phoneHref: 'tel:+15745811989' },
    { name: 'Elvin Nuest', role: 'Founder / Owner', phone: '219-863-5216', phoneHref: 'tel:+12198635216' },
  ],
  address: {
    street: '2507 E 375 N',
    city: 'Monticello',
    region: 'IN',
    postalCode: '47960',
    country: 'US',
    note: '[[OWNER CONFIRM: street address shown publicly? (taken from OMRI certificate)]]',
  },
  hours: '[[OWNER CONFIRM: business hours and will-call pickup hours]]',
  serviceArea: 'Ships nationwide · Custom spreading near Monticello, Indiana',
  spreadingArea: '[[OWNER CONFIRM: custom spreading radius or counties]]',
  experience: 'More than 50 years in agriculture and 20 years in the humate industry',
  omri: {
    // The certificate on the old site expired 2026-06-01. Flip `confirmed` to true only after
    // seeing a current certificate at omri.org.
    confirmed: false,
    product: 'Humusolver-100',
    note: '[[OWNER CONFIRM: current OMRI listing for Humusolver-100 (old certificate expired June 1, 2026); is FS Granular listed?]]',
  },
  dealerLines: ['GroPal SeaMineral', 'Maxicrop Seaweed'],
};

export const nav = [
  { href: '/products/', label: 'Products' },
  { href: '/uses/', label: 'Uses' },
  { href: '/benefits/', label: 'How It Works' },
  { href: '/research/', label: 'Research' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/about-us/', label: 'About' },
  { href: '/contact-us/', label: 'Contact' },
];
