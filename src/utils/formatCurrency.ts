/**
 * Currency formatting utility.
 *
 * Formats numbers to Indonesian Rupiah (IDR) format.
 */

const IDR_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const IDR_COMPACT_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  notation: 'compact',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/**
 * Format a number as Indonesian Rupiah.
 *
 * @param amount - The amount to format
 * @param compact - Use compact notation (e.g., Rp 1,5 jt)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1500000) // "Rp 1.500.000"
 * formatCurrency(1500000, true) // "Rp 1,5 jt"
 */
export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    return IDR_COMPACT_FORMATTER.format(amount);
  }
  return IDR_FORMATTER.format(amount);
}
