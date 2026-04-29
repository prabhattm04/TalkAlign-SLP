/**
 * Format a date string to a human-readable format.
 * @param {string} dateStr - ISO date string e.g. "2026-04-25"
 * @param {object} options - Intl.DateTimeFormat options
 */
export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '—';
  const defaultOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Intl.DateTimeFormat('en-IN', { ...defaultOptions, ...options }).format(
    new Date(dateStr)
  );
}

/**
 * Get initials from a full name
 * @param {string} name
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate a string to a given length
 */
export function truncate(str = '', maxLen = 60) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen).trimEnd() + '…';
}

/**
 * Sleep for n milliseconds (useful for UI feedback)
 */
export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Generate a color class based on a status string
 */
export function statusBadgeClass(status) {
  switch (status) {
    case 'active':      return 'badge-green';
    case 'inactive':    return 'badge-yellow';
    case 'completed':   return 'badge-blue';
    case 'in-progress': return 'badge-purple';
    default:            return 'badge-blue';
  }
}

/**
 * Validate an email address
 */
export function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
