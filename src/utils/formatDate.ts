/**
 * Date formatting utilities.
 *
 * Formats dates to Indonesian locale format.
 */

const DATE_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const DATE_SHORT_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('id-ID', {
  numeric: 'auto',
});

/**
 * Format a date string or Date object to Indonesian long format.
 *
 * @example formatDate('2026-06-09') // "9 Juni 2026"
 */
export function formatDate(date: string | Date): string {
  return DATE_FORMATTER.format(new Date(date));
}

/**
 * Format to short date.
 *
 * @example formatDateShort('2026-06-09') // "9 Jun 2026"
 */
export function formatDateShort(date: string | Date): string {
  return DATE_SHORT_FORMATTER.format(new Date(date));
}

/**
 * Format with time.
 *
 * @example formatDateTime('2026-06-09T10:30:00') // "9 Juni 2026 10.30"
 */
export function formatDateTime(date: string | Date): string {
  return DATETIME_FORMATTER.format(new Date(date));
}

/**
 * Format as relative time (e.g., "2 jam yang lalu", "kemarin").
 */
export function formatRelativeTime(date: string | Date): string {
  const now = Date.now();
  const target = new Date(date).getTime();
  const diffMs = target - now;
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffMinutes) < 1) {
    return 'baru saja';
  }
  if (Math.abs(diffMinutes) < 60) {
    return RELATIVE_TIME_FORMATTER.format(diffMinutes, 'minute');
  }
  if (Math.abs(diffHours) < 24) {
    return RELATIVE_TIME_FORMATTER.format(diffHours, 'hour');
  }
  if (Math.abs(diffDays) < 30) {
    return RELATIVE_TIME_FORMATTER.format(diffDays, 'day');
  }

  return formatDateShort(date);
}
