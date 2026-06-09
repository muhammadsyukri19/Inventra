import { cn } from '@/utils/cn';

/**
 * Skeleton atom.
 *
 * Placeholder loading untuk konten yang belum dimuat.
 *
 * @example
 * <Skeleton className="h-4 w-32" />
 * <Skeleton variant="circle" className="h-10 w-10" />
 */

interface SkeletonProps {
  /** Shape variant */
  variant?: 'rectangular' | 'circle' | 'text';
  className?: string;
}

export function Skeleton({ variant = 'rectangular', className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface-tertiary',
        variant === 'circle' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        variant === 'text' && 'h-4 rounded',
        className
      )}
      aria-hidden="true"
    />
  );
}
