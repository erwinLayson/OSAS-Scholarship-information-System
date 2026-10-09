const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

// Tolerant date parser: returns a Date or null, never throws / never Invalid Date.
export const parseDate = (value) => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (value === null || value === undefined || value === '') return null;

  const str = String(value).trim();
  const match = str.match(DATE_ONLY_RE);
  if (match) {
    const [, y, m, d] = match.map(Number);
    const date = new Date(y, m - 1, d);
    const valid = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
    return valid ? date : null;
  }

  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? null : date;
};

const PRESETS = {
  short: { year: 'numeric', month: 'numeric', day: 'numeric' },
  medium: { year: 'numeric', month: 'short', day: '2-digit' },
  long: { year: 'numeric', month: 'long', day: 'numeric' },
  verbose: { year: 'numeric', month: 'long', day: '2-digit' },
};

// formatDate(value) -> '10/9/2026'
// formatDate(value, 'medium') -> 'Oct 09, 2026'
// formatDate(value, { month: 'long' }, 'N/A') -> custom options / fallback
export const formatDate = (value, options = 'short', fallback = '-') => {
  const date = parseDate(value);
  if (!date) return fallback;
  const opts = typeof options === 'string' ? PRESETS[options] || PRESETS.short : options;
  return new Intl.DateTimeFormat('en-US', opts).format(date);
};

// formatDateTime(value) -> 'Oct 9, 2026, 3:19 PM'
export const formatDateTime = (value, fallback = '-') => {
  const date = parseDate(value);
  if (!date) return fallback;
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};
