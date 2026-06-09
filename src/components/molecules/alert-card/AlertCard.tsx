import { Card } from '@/components/atoms/card';
import { Badge } from '@/components/atoms/badge';
import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button';
import { cn } from '@/utils/cn';
import type { BadgeProps } from '@/components/atoms/badge';

/**
 * AlertCard molecule.
 *
 * Menggabungkan Card + Badge + Typography + Button atoms
 * untuk menampilkan notifikasi atau peringatan stok.
 *
 * @example
 * <AlertCard
 *   icon={<AlertTriangle />}
 *   title="Stok Hampir Habis"
 *   description="Produk XYZ tinggal 5 unit"
 *   badgeText="Warning"
 *   badgeVariant="warning"
 *   actionLabel="Lihat Detail"
 *   onAction={() => router.push('/products/123')}
 * />
 */

interface AlertCardProps {
  /** Icon element */
  icon: React.ReactNode;
  /** Alert title */
  title: string;
  /** Alert description */
  description: string;
  /** Badge text */
  badgeText?: string;
  /** Badge color variant */
  badgeVariant?: BadgeProps['variant'];
  /** Action button label */
  actionLabel?: string;
  /** Action button callback */
  onAction?: () => void;
  className?: string;
}

export function AlertCard({
  icon,
  title,
  description,
  badgeText,
  badgeVariant = 'warning',
  actionLabel,
  onAction,
  className,
}: AlertCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-text-secondary">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Typography variant="body" weight="semibold" className="truncate">
              {title}
            </Typography>
            {badgeText && (
              <Badge variant={badgeVariant} size="sm">
                {badgeText}
              </Badge>
            )}
          </div>
          <Typography variant="body-sm" color="secondary" className="mt-0.5">
            {description}
          </Typography>
          {actionLabel && onAction && (
            <Button
              variant="link"
              size="sm"
              onClick={onAction}
              className="mt-2 h-auto px-0 py-0"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
