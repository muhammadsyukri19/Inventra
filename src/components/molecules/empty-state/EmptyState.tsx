import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button';
import { cn } from '@/utils/cn';

/**
 * EmptyState molecule.
 *
 * Menggabungkan Icon + Typography + Button atoms
 * untuk menampilkan state kosong pada tabel atau list.
 *
 * @example
 * <EmptyState
 *   icon={<Package className="h-12 w-12" />}
 *   title="Belum ada produk"
 *   description="Mulai tambahkan produk pertama Anda"
 *   actionLabel="Tambah Produk"
 *   onAction={() => router.push('/products/create')}
 * />
 */

interface EmptyStateProps {
  /** Large icon element */
  icon: React.ReactNode;
  /** Title message */
  title: string;
  /** Description message */
  description?: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Optional action button callback */
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-surface-secondary py-12 px-6 text-center',
        className
      )}
    >
      <div className="text-text-tertiary">{icon}</div>
      <Typography variant="h4" className="mt-4">
        {title}
      </Typography>
      {description && (
        <Typography variant="body" color="secondary" className="mt-1 max-w-sm">
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
