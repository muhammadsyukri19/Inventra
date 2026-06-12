import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import type { SelectProps } from './Select.types';

/**
 * Select atom.
 *
 * Komponen dropdown select yang terkontrol.
 * Mendukung error state, disabled state, label, dan placeholder.
 * Tidak boleh mengandung business logic atau API call.
 *
 * @example
 * <Select
 *   id="kategori"
 *   label="Kategori"
 *   placeholder="Pilih kategori"
 *   options={[{ value: 'elektronik', label: 'Elektronik' }]}
 *   error={errors.kategori?.message}
 * />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, error, label, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          className={cn(
            // Base
            'block w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-text-primary transition-colors',
            'focus:outline-none focus:ring-2',

            // Error state
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-border-default hover:border-border-strong focus:border-primary-500 focus:ring-primary-500/20',

            // Disabled state
            props.disabled && 'cursor-not-allowed bg-surface-tertiary opacity-60',

            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && id && (
          <p id={`${id}-error`} className="mt-1 text-xs text-danger-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
