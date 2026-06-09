import type { ReactNode } from 'react';

/**
 * Badge atom prop types.
 */
export interface BadgeProps {
  children: ReactNode;
  /** Color variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
