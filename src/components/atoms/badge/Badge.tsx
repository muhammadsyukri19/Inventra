import { cn } from '@/utils/cn';
import type { BadgeProps } from './Badge.types';

/**
 * Badge atom.
 *
 * Komponen label/tag kecil untuk menampilkan status atau kategori.
 *
 * @example
 * <Badge variant="success">Aktif</Badge>
 * <Badge variant="danger" size="sm">Habis</Badge>
 */
export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',

        // Variants
        variant === 'default' && 'bg-surface-tertiary text-text-secondary',
        variant === 'primary' && 'bg-primary-100 text-primary-700',
        variant === 'success' && 'bg-success-50 text-success-700',
        variant === 'warning' && 'bg-warning-50 text-warning-700',
        variant === 'danger' && 'bg-danger-50 text-danger-700',
        variant === 'info' && 'bg-info-50 text-info-700',

        // Sizes
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-2.5 py-0.5 text-xs',
        size === 'lg' && 'px-3 py-1 text-sm',

        className
      )}
    >
      {children}
    </span>
  );
}
