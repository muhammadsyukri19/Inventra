import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import type { ButtonProps } from './Button.types';

/**
 * Button atom.
 *
 * Komponen tombol reusable dengan variant, size, dan loading state.
 * Tidak boleh mengandung business logic atau API call.
 *
 * @example
 * <Button variant="primary" size="md" loading={isPending}>Simpan</Button>
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          // Base
          'inline-flex items-center justify-center gap-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',

          // Variants
          variant === 'primary' &&
            'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/20',
          variant === 'secondary' &&
            'bg-surface border border-border-default text-text-primary hover:bg-surface-tertiary focus:ring-primary-500/20',
          variant === 'danger' &&
            'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500/20',
          variant === 'ghost' &&
            'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary focus:ring-primary-500/20',
          variant === 'link' &&
            'text-primary-600 underline-offset-4 hover:underline focus:ring-primary-500/20',

          // Sizes
          size === 'sm' && 'h-8 rounded-md px-3 text-xs',
          size === 'md' && 'h-10 rounded-lg px-4 text-sm',
          size === 'lg' && 'h-12 rounded-lg px-6 text-base',
          size === 'icon' && 'h-10 w-10 rounded-lg',

          // Full width
          fullWidth && 'w-full',

          className
        )}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
