import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Typography atom.
 *
 * Komponen teks dengan variant heading dan body yang konsisten.
 *
 * @example
 * <Typography variant="h1">Judul Halaman</Typography>
 * <Typography variant="body" color="secondary">Deskripsi</Typography>
 */

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Text style variant */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'caption';
  /** Text color token */
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'danger' | 'success';
  /** Font weight override */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  /** Render as different HTML element */
  as?: React.ElementType;
  className?: string;
}

const VARIANT_MAP = {
  h1: 'text-2xl font-bold',
  h2: 'text-xl font-semibold',
  h3: 'text-lg font-semibold',
  h4: 'text-base font-semibold',
  body: 'text-sm',
  'body-sm': 'text-xs',
  caption: 'text-[11px]',
} as const;

const COLOR_MAP = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  inverse: 'text-text-inverse',
  danger: 'text-danger-600',
  success: 'text-success-600',
} as const;

const WEIGHT_MAP = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
} as const;

const DEFAULT_TAGS: Record<string, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
};

export function Typography({
  children,
  variant = 'body',
  color = 'primary',
  weight,
  as,
  className,
  ...props
}: TypographyProps) {
  const Component = as ?? DEFAULT_TAGS[variant] ?? 'p';

  return (
    <Component
      className={cn(
        VARIANT_MAP[variant],
        COLOR_MAP[color],
        weight && WEIGHT_MAP[weight],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
