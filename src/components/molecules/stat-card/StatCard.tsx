import { Card } from '@/components/atoms/card';
import { Typography } from '@/components/atoms/typography';
import { cn } from '@/utils/cn';

/**
 * StatCard molecule.
 *
 * Menggabungkan Card atom + Typography atom + Icon untuk
 * menampilkan metrik/statistik pada dashboard.
 *
 * @example
 * <StatCard
 *   label="Total Produk"
 *   value="150"
 *   icon={<Package />}
 *   iconBg="bg-primary-100 text-primary-600"
 *   trend={{ value: 12, direction: 'up' }}
 * />
 */

interface StatCardProps {
  /** Metric label */
  label: string;
  /** Metric value (string for formatted numbers) */
  value: string;
  /** Icon element */
  icon: React.ReactNode;
  /** Icon background + text color classes */
  iconBg: string;
  /** Optional trend indicator */
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  iconBg,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card hover className={cn('p-4', className)}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
            iconBg
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <Typography variant="body-sm" color="secondary">
            {label}
          </Typography>
          <Typography variant="h3" className="truncate">
            {value}
          </Typography>
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn(
              'text-xs font-medium',
              trend.direction === 'up' && 'text-success-600',
              trend.direction === 'down' && 'text-danger-600',
              trend.direction === 'neutral' && 'text-text-tertiary'
            )}
          >
            {trend.direction === 'up' && '↑'}
            {trend.direction === 'down' && '↓'}
            {trend.value}%
          </span>
          <Typography variant="caption" color="tertiary">
            vs bulan lalu
          </Typography>
        </div>
      )}
    </Card>
  );
}
