import { Label } from '@/components/atoms/label';
import { Input } from '@/components/atoms/input';
import { cn } from '@/utils/cn';
import type { FormFieldProps } from './FormField.types';

/**
 * FormField molecule.
 *
 * Menggabungkan Label atom + Input atom + error message.
 * Digunakan di semua form dalam aplikasi.
 *
 * @example
 * <FormField
 *   label="Email"
 *   name="email"
 *   type="email"
 *   error={errors.email?.message}
 *   required
 *   {...register('email')}
 * />
 */
export function FormField({
  label,
  name,
  error,
  required,
  helperText,
  className,
  ...inputProps
}: FormFieldProps) {
  const fieldId = name ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}

      <Input
        id={fieldId}
        name={name}
        error={error}
        aria-describedby={
          error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined
        }
        {...inputProps}
      />

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
