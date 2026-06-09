import { cn } from '@/utils/cn';

/**
 * Card atom.
 *
 * Container kartu dengan border dan optional hover effect.
 * Gunakan composition pattern: <Card><CardHeader /><CardBody /></Card>
 *
 * @example
 * <Card hover>
 *   <CardHeader>
 *     <Typography variant="h3">Title</Typography>
 *   </CardHeader>
 *   <CardBody>Content here</CardBody>
 * </Card>
 */

interface CardProps {
  children: React.ReactNode;
  /** Enable hover lift + shadow effect */
  hover?: boolean;
  /** Additional padding override */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function Card({ children, hover, padding = 'none', className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border-default bg-surface',
        hover && 'card-hover',
        padding === 'sm' && 'p-4',
        padding === 'md' && 'p-6',
        padding === 'lg' && 'p-8',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardSectionProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-border-default', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardSectionProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardSectionProps) {
  return (
    <div className={cn('px-6 py-4 border-t border-border-default', className)}>
      {children}
    </div>
  );
}
