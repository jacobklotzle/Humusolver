// Placeholder syntax shared by content files, components, and the report script.
// Write `[[TYPE: note]]` anywhere in content; it renders as a highlighted marker
// in preview builds, and production builds refuse to run while any remain.
export const PLACEHOLDER_TYPES = [
  'TESTIMONIAL NEEDED',
  'PRICE NEEDED',
  'CITATION NEEDED',
  'PHOTO NEEDED',
  'ADDRESS NEEDED',
  'LABEL CHECK',
  'OWNER CONFIRM',
];

export const PLACEHOLDER_RE = new RegExp(`\\[\\[(${PLACEHOLDER_TYPES.join('|')}):?\\s*([^\\]]*)\\]\\]`, 'g');

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const placeholderHtml = (type, note) =>
  `<mark class="ph" data-ph="${escapeHtml(type)}"><span class="ph__type">${escapeHtml(type)}</span>${
    note ? ` <span class="ph__note">${escapeHtml(note.trim())}</span>` : ''
  }</mark>`;

/** Escape a plain string and turn any [[TYPE: note]] into placeholder markup. */
export function renderInline(text = '') {
  let out = '';
  let last = 0;
  for (const m of text.matchAll(PLACEHOLDER_RE)) {
    out += escapeHtml(text.slice(last, m.index));
    out += placeholderHtml(m[1], m[2]);
    last = m.index + m[0].length;
  }
  return out + escapeHtml(text.slice(last));
}

export const hasPlaceholder = (text = '') => new RegExp(PLACEHOLDER_RE.source).test(text);
