import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import type { InputProps } from './Input.types';

/**
 * Input atom.
 *
 * Komponen input reusable dengan error state, icon, dan ukuran.
 * Tidak boleh mengandung business logic.
 *
 * @example
 * <Input placeholder="Email" error="Email wajib diisi" leftIcon={<Mail />} />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      leftIcon,
      rightIcon,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          className={cn(
            // Base
            'block w-full rounded-lg border bg-surface text-text-primary placeholder:text-text-tertiary transition-colors',
            'focus:outline-none focus:ring-2',

            // Error state
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-border-default focus:border-primary-500 focus:ring-primary-500/20',

            // Sizes
            size === 'sm' && 'h-8 px-3 text-xs',
            size === 'md' && 'h-10 px-4 text-sm',
            size === 'lg' && 'h-12 px-4 text-base',

            // Icon padding
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',

            className
          )}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
