import { cn } from '@/utils/cn';

/**
 * Avatar atom.
 *
 * Menampilkan gambar profil user atau fallback inisial.
 *
 * @example
 * <Avatar src="/photo.jpg" alt="John" size="md" />
 * <Avatar fallback="JS" size="lg" />
 */

interface AvatarProps {
  /** Image source URL */
  src?: string | null;
  /** Alt text for image */
  alt?: string;
  /** Fallback initials when no image */
  fallback?: string;
  /** Size preset */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
} as const;

export function Avatar({
  src,
  alt = '',
  fallback,
  size = 'md',
  className,
}: AvatarProps) {
  const initials =
    fallback ??
    alt
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          'rounded-full object-cover',
          SIZE_MAP[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700',
        SIZE_MAP[size],
        className
      )}
      aria-label={alt || fallback}
    >
      {initials}
    </div>
  );
}
