import type { InputProps } from '@/components/atoms/input';

/**
 * FormField molecule prop types.
 */
export interface FormFieldProps extends InputProps {
  /** Label text displayed above the input */
  label?: string;
  /** Error message — displayed below input in red */
  error?: string;
  /** Whether the field is required (shows asterisk in label) */
  required?: boolean;
  /** Helper text — displayed below input when no error */
  helperText?: string;
}
