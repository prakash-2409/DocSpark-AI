/* ------------------------------------------------------------------
   Citation formatting library
   Supports: APA 7th · MLA 9th · Chicago · Harvard · IEEE
   ------------------------------------------------------------------ */

/**
 * @typedef {Object} CitationInput
 * @property {string} type        – 'book' | 'journal' | 'website' | 'conference'
 * @property {string} authors     – Comma-separated list of authors, e.g. "Smith, J., Doe, A."
 * @property {string} title       – Title of the work
 * @property {string} [year]      – Year of publication
 * @property {string} [publisher] – Publisher name
 * @property {string} [journal]   – Journal name (for articles)
 * @property {string} [volume]    – Journal volume
 * @property {string} [issue]     – Journal issue
 * @property {string} [pages]     – Page range, e.g. "12-34"
 * @property {string} [url]       – URL for web sources
 * @property {string} [accessDate]– Date accessed (websites)
 * @property {string} [doi]       – DOI identifier
 * @property {string} [edition]   – Book edition
 * @property {string} [city]      – City of publication
 */

const FORMATS = ['APA 7th', 'MLA 9th', 'Chicago', 'Harvard', 'IEEE'];

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */
const italicise = (text) => `<i>${text}</i>`;

const ensurePeriod = (str) => {
  if (!str) return '';
  const trimmed = str.trim();
  return trimmed.endsWith('.') ? trimmed : `${trimmed}.`;
};

/* Abbreviate first-name initials for styles that need it */
const toInitials = (name) => {
  // If already formatted as "Smith, J." leave it
  if (/,\s*[A-Z]\./.test(name)) return name.trim();
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const last = parts.pop();
  const inits = parts.map(p => p.charAt(0).toUpperCase() + '.').join(' ');
  return `${last}, ${inits}`;
};

/* Split author string → array */
const splitAuthors = (authors) => {
  if (!authors) return [];
  return authors.split(/;\s*|,\s*and\s+|,\s*&\s*|\band\b/i)
    .map(a => a.trim())
    .filter(Boolean);
};

/* ------------------------------------------------------------------ */
/*  Format generators                                                  */
/* ------------------------------------------------------------------ */

function formatAPA(c) {
  const authors = splitAuthors(c.authors).map(toInitials);
  let authorStr = '';
  if (authors.length === 1) authorStr = authors[0];
  else if (authors.length === 2) authorStr = `${authors[0]}, & ${authors[1]}`;
  else if (authors.length > 2) authorStr = `${authors.slice(0, -1).join(', ')}, & ${authors[authors.length - 1]}`;

  const year = c.year ? ` (${c.year}). ` : '. ';

  if (c.type === 'journal') {
    const journal = c.journal ? `${italicise(c.journal)}` : '';
    const vol = c.volume ? `, ${italicise(c.volume)}` : '';
    const issue = c.issue ? `(${c.issue})` : '';
    const pages = c.pages ? `, ${c.pages}` : '';
    const doi = c.doi ? ` https://doi.org/${c.doi}` : '';
    return `${authorStr}${year}${c.title}. ${journal}${vol}${issue}${pages}.${doi}`;
  }

  if (c.type === 'website') {
    const url = c.url ? ` ${c.url}` : '';
    return `${authorStr}${year}${italicise(c.title)}.${url}`;
  }

  // Book / conference
  const edition = c.edition ? ` (${c.edition} ed.)` : '';
  const publisher = c.publisher ? ` ${c.publisher}.` : '';
  const doi = c.doi ? ` https://doi.org/${c.doi}` : '';
  return `${authorStr}${year}${italicise(c.title)}${edition}.${publisher}${doi}`;
}

function formatMLA(c) {
  const authors = splitAuthors(c.authors);
  let authorStr = '';
  if (authors.length === 1) authorStr = `${authors[0]}. `;
  else if (authors.length === 2) authorStr = `${authors[0]}, and ${authors[1]}. `;
  else if (authors.length > 2) authorStr = `${authors[0]}, et al. `;

  const title = c.type === 'journal' || c.type === 'website'
    ? `"${c.title}." `
    : `${italicise(c.title)}. `;

  if (c.type === 'journal') {
    const journal = c.journal ? `${italicise(c.journal)}, ` : '';
    const vol = c.volume ? `vol. ${c.volume}, ` : '';
    const issue = c.issue ? `no. ${c.issue}, ` : '';
    const year = c.year ? `${c.year}, ` : '';
    const pages = c.pages ? `pp. ${c.pages}.` : '';
    return `${authorStr}${title}${journal}${vol}${issue}${year}${pages}`;
  }

  if (c.type === 'website') {
    const url = c.url ? ` ${c.url}.` : '.';
    const accessed = c.accessDate ? ` Accessed ${c.accessDate}.` : '';
    return `${authorStr}${title}${italicise('Web')}.${url}${accessed}`;
  }

  const publisher = c.publisher || '';
  const year = c.year || '';
  return `${authorStr}${title}${publisher}${publisher && year ? ', ' : ''}${year}.`;
}

function formatChicago(c) {
  const authors = splitAuthors(c.authors);
  let authorStr = authors.join(', ');
  if (authorStr) authorStr += '. ';

  if (c.type === 'journal') {
    const title = `"${c.title}." `;
    const journal = c.journal ? `${italicise(c.journal)} ` : '';
    const vol = c.volume || '';
    const issue = c.issue ? `, no. ${c.issue}` : '';
    const year = c.year ? ` (${c.year})` : '';
    const pages = c.pages ? `: ${c.pages}` : '';
    return `${authorStr}${title}${journal}${vol}${issue}${year}${pages}.`;
  }

  const title = `${italicise(c.title)}. `;
  const city = c.city ? `${c.city}: ` : '';
  const publisher = c.publisher ? `${c.publisher}, ` : '';
  const year = c.year || '';
  return `${authorStr}${title}${city}${publisher}${year}.`;
}

function formatHarvard(c) {
  const authors = splitAuthors(c.authors).map(toInitials);
  let authorStr = '';
  if (authors.length === 1) authorStr = authors[0];
  else if (authors.length === 2) authorStr = `${authors[0]} and ${authors[1]}`;
  else authorStr = `${authors.slice(0, -1).join(', ')} and ${authors[authors.length - 1]}`;

  const year = c.year ? ` (${c.year}) ` : ' ';

  if (c.type === 'journal') {
    const journal = c.journal ? ` ${italicise(c.journal)}` : '';
    const vol = c.volume ? `, ${c.volume}` : '';
    const issue = c.issue ? `(${c.issue})` : '';
    const pages = c.pages ? `, pp. ${c.pages}` : '';
    return `${authorStr}${year}'${c.title}',${journal}${vol}${issue}${pages}.`;
  }

  const publisher = c.publisher ? ` ${c.publisher}.` : '.';
  return `${authorStr}${year}${italicise(c.title)}.${publisher}`;
}

function formatIEEE(c) {
  const authors = splitAuthors(c.authors).map(a => {
    const parts = a.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const last = parts.pop();
    const inits = parts.map(p => p.charAt(0).toUpperCase() + '.').join(' ');
    return `${inits} ${last}`;
  });
  let authorStr = authors.join(', ');

  if (c.type === 'journal') {
    const journal = c.journal ? ` ${italicise(c.journal)}` : '';
    const vol = c.volume ? `, vol. ${c.volume}` : '';
    const issue = c.issue ? `, no. ${c.issue}` : '';
    const pages = c.pages ? `, pp. ${c.pages}` : '';
    const year = c.year ? `, ${c.year}` : '';
    return `${authorStr}, "${c.title},"${journal}${vol}${issue}${pages}${year}.`;
  }

  const city = c.city ? ` ${c.city}:` : '';
  const publisher = c.publisher ? ` ${c.publisher}` : '';
  const year = c.year ? `, ${c.year}` : '';
  return `${authorStr}, ${italicise(c.title)}.${city}${publisher}${year}.`;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function generateCitation(input, format) {
  switch (format) {
    case 'APA 7th':  return formatAPA(input);
    case 'MLA 9th':  return formatMLA(input);
    case 'Chicago':  return formatChicago(input);
    case 'Harvard':  return formatHarvard(input);
    case 'IEEE':     return formatIEEE(input);
    default:         return formatAPA(input);
  }
}

export { FORMATS };
