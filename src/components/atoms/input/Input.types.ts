import type { InputHTMLAttributes, ReactNode } from 'react';

/**
 * Input atom prop types.
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Error message — triggers error styling when present */
  error?: string;
  /** Icon rendered inside the input on the left */
  leftIcon?: ReactNode;
  /** Icon rendered inside the input on the right */
  rightIcon?: ReactNode;
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
}
