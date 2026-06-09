import { cn } from '@/utils/cn';

/**
 * Label atom.
 *
 * Label HTML semantik untuk form field.
 *
 * @example
 * <Label htmlFor="email" required>Email</Label>
 */

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export function Label({ children, htmlFor, required, className }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-sm font-medium text-text-primary',
        className
      )}
    >
      {children}
      {required && (
        <span className="ml-1 text-danger-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
