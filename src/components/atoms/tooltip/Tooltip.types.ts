import type { ReactNode } from 'react';

/**
 * Tooltip atom prop types.
 */
export interface TooltipProps {
  /** Elemen yang di-wrap oleh tooltip */
  children: ReactNode;
  /** Teks yang ditampilkan di dalam tooltip */
  content: string;
  /** Posisi tooltip relatif terhadap children */
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}
