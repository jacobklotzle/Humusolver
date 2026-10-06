// Shared lead definitions used by the form UI and the /api/quote endpoint.

export const OPERATIONS = [
  { value: 'row-crop', label: 'Row crops (corn, soybeans, small grains)' },
  { value: 'pasture-livestock', label: 'Pasture, hay, or livestock ground' },
  { value: 'greenhouse', label: 'Greenhouse, hydroponics, or market garden' },
  { value: 'turf-garden', label: 'Turf, landscape, or home garden' },
  { value: 'dealer', label: 'Dealer or retailer' },
  { value: 'other', label: 'Other' },
] as const;

export const PRODUCTS = [
  { value: 'humusolver-100', label: 'Humusolver-100 Soluble Powder' },
  { value: 'fs-granular', label: 'Humusolver FS Granular' },
  { value: 'not-sure', label: 'Not sure, help me choose' },
  { value: 'dealer-lines', label: 'GroPal SeaMineral / Maxicrop Seaweed' },
] as const;

export const DELIVERY = [
  { value: 'ship', label: 'Ship it to me (freight)' },
  { value: 'will-call', label: 'Will-call pickup in Monticello, IN' },
  { value: 'spreading', label: 'Custom spreading' },
] as const;

export const CONTACT_PREF = [
  { value: 'call', label: 'Phone call' },
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
] as const;

export const US_STATES =
  'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(
    ' ',
  );

export type LeadType = 'quote' | 'question';

export interface Lead {
  type: LeadType;
  name: string;
  phone: string;
  email: string;
  farm: string;
  state: string;
  zip: string;
  operation: string;
  acres: string;
  product: string;
  packageSize: string;
  quantity: string;
  delivery: string;
  neededBy: string;
  contactPref: string;
  message: string;
  estimate: string;
  sourcePage: string;
}

type Errors = Partial<Record<keyof Lead, string>>;

const str = (v: FormDataEntryValue | null, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const oneOf = (v: string, list: readonly { value: string }[]) => (list.some((o) => o.value === v) ? v : '');

export function parseLead(fd: FormData): { lead: Lead; errors: Errors } {
  const type: LeadType = str(fd.get('type')) === 'question' ? 'question' : 'quote';
  const lead: Lead = {
    type,
    name: str(fd.get('name'), 120),
    phone: str(fd.get('phone'), 40),
    email: str(fd.get('email'), 160),
    farm: str(fd.get('farm'), 160),
    state: US_STATES.includes(str(fd.get('state'))) ? str(fd.get('state')) : '',
    zip: str(fd.get('zip'), 10),
    operation: oneOf(str(fd.get('operation')), OPERATIONS),
    acres: str(fd.get('acres'), 12),
    product: oneOf(str(fd.get('product')), PRODUCTS),
    packageSize: str(fd.get('packageSize'), 80),
    quantity: str(fd.get('quantity'), 12),
    delivery: oneOf(str(fd.get('delivery')), DELIVERY),
    neededBy: str(fd.get('neededBy'), 20),
    contactPref: oneOf(str(fd.get('contactPref')), CONTACT_PREF),
    message: str(fd.get('message'), 3000),
    estimate: str(fd.get('estimate'), 300),
    sourcePage: str(fd.get('sourcePage'), 200),
  };

  const errors: Errors = {};
  if (lead.name.length < 2) errors.name = 'Please enter your name.';
  const digits = lead.phone.replace(/\D/g, '');
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email);
  if (lead.phone && digits.length < 10) errors.phone = 'Please enter a 10-digit phone number.';
  if (lead.email && !emailOk) errors.email = 'Please check your email address.';
  if (!lead.phone && !lead.email) errors.phone = 'Please give us a phone number or email so we can reach you.';

  if (type === 'quote') {
    if (!lead.operation) errors.operation = 'Please choose your type of operation.';
    if (!lead.product) errors.product = 'Please choose a product (or "Not sure").';
    if (!lead.delivery) errors.delivery = 'Please choose shipping, pickup, or spreading.';
    if (lead.delivery === 'ship' && !/^\d{5}$/.test(lead.zip)) errors.zip = 'We need a 5-digit ZIP code to quote freight.';
    if (lead.acres && !(Number(lead.acres) >= 0)) errors.acres = 'Acres should be a number.';
    if (lead.quantity && !(Number(lead.quantity) >= 0)) errors.quantity = 'Quantity should be a number.';
  } else if (lead.message.length < 5) {
    errors.message = 'Please type your question.';
  }

  return { lead, errors };
}

export const labelFor = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((o) => o.value === v)?.label ?? v;
