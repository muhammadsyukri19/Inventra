import { Input } from '@/components/atoms/input';
import { Button } from '@/components/atoms/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * SearchBar molecule.
 *
 * Menggabungkan Input atom + Button atom + icon untuk fitur pencarian.
 *
 * @example
 * <SearchBar
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Cari produk..."
 * />
 */

interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Cari...',
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-text-tertiary hover:text-text-secondary transition-colors"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" />
            </button>
          ) : undefined
        }
        className="w-full"
        aria-label="Pencarian"
      />
    </div>
  );
}
