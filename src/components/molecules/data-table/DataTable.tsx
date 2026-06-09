import { Skeleton } from '@/components/atoms/skeleton';
import { EmptyState } from '@/components/molecules/empty-state';
import { Typography } from '@/components/atoms/typography';
import { PackageX } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { DataTableProps, ColumnDef } from './DataTable.types';

/**
 * DataTable molecule.
 *
 * Menggabungkan table structure dasar, Skeleton atom (loading),
 * dan EmptyState molecule.
 */
export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'Belum ada data',
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('w-full overflow-hidden rounded-xl border border-border-default bg-surface', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-secondary text-text-secondary border-b border-border-default">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key as string}
                  className={cn(
                    'px-4 py-3 font-medium whitespace-nowrap',
                    column.className
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {isLoading ? (
              // Loading State
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {columns.map((column, colIndex) => (
                    <td key={`skeleton-td-${colIndex}`} className="px-4 py-3">
                      <Skeleton className="h-5 w-full max-w-[200px]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="px-4 py-12">
                  <EmptyState
                    icon={<PackageX className="h-10 w-10" />}
                    title={emptyMessage}
                    className="border-none bg-transparent"
                  />
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'bg-surface transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-surface-hover'
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key as string}
                      className={cn('px-4 py-3', column.className)}
                    >
                      {column.render
                        ? column.render(row)
                        : (row[column.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
