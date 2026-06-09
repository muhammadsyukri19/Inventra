import { forwardRef } from 'react';
import { Label } from '@/components/atoms/label';
import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Label text displayed above the select */
  label?: string;
  /** Array of options to select from */
  options: SelectOption[];
  /** Error message — displayed below select in red */
  error?: string;
  /** Whether the field is required (shows asterisk in label) */
  required?: boolean;
  /** Helper text — displayed below select when no error */
  helperText?: string;
}

/**
 * SelectField molecule.
 *
 * Menggabungkan Label atom + Native Select + error message.
 */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      options,
      name,
      error,
      required,
      helperText,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const fieldId = name ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('space-y-1.5', className)}>
        {label && (
          <Label htmlFor={fieldId} required={required}>
            {label}
          </Label>
        )}

        <select
          ref={ref}
          id={fieldId}
          name={name}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined
          }
          className={cn(
            'flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text transition-colors',
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            'disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-text-tertiary',
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20'
              : 'border-border-default',
            className
          )}
          {...props}
        >
          <option value="" disabled>
            Pilih {label ?? 'opsi'}...
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p
            id={`${fieldId}-error`}
            className="text-xs text-danger-600"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${fieldId}-helper`} className="text-xs text-text-tertiary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
