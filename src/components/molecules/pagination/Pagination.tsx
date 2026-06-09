import { Button } from '@/components/atoms/button';
import { Typography } from '@/components/atoms/typography';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Pagination molecule.
 *
 * Menggabungkan Button + Typography atoms untuk navigasi halaman.
 *
 * @example
 * <Pagination page={1} totalPages={10} onPageChange={setPage} />
 */

interface PaginationProps {
  /** Current page (1-indexed) */
  page: number;
  /** Total pages available */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(page, totalPages);

  return (
    <nav
      className={cn('flex items-center gap-1', className)}
      aria-label="Navigasi halaman"
    >
      <Button
        variant="ghost"
        size="icon"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <Typography
            key={`ellipsis-${i}`}
            variant="body-sm"
            color="tertiary"
            className="px-2"
          >
            …
          </Typography>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'primary' : 'ghost'}
            size="icon"
            onClick={() => onPageChange(p as number)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Halaman ${p}`}
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

/**
 * Calculate visible page numbers with ellipsis.
 */
function getVisiblePages(
  current: number,
  total: number
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}
