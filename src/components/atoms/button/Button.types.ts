import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button atom prop types.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  /** Show loading spinner and disable interactions */
  loading?: boolean;
  /** Expand to full container width */
  fullWidth?: boolean;
  /** Icon rendered before children */
  leftIcon?: ReactNode;
  /** Icon rendered after children */
  rightIcon?: ReactNode;
}
