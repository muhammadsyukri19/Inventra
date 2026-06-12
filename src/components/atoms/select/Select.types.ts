import type { SelectHTMLAttributes } from 'react';

/**
 * Select atom prop types.
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Daftar opsi yang ditampilkan */
  options: SelectOption[];
  /** Teks placeholder (rendered as disabled first option) */
  placeholder?: string;
  /** Pesan error — memicu error styling saat ada nilai */
  error?: string;
  /** Label yang ditampilkan di atas select */
  label?: string;
}
