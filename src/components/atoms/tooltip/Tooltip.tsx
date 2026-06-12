'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';
import type { TooltipProps } from './Tooltip.types';

/**
 * Tooltip atom.
 *
 * Menampilkan teks informasi saat elemen di-hover atau difokus.
 * Mendukung 4 posisi: top, bottom, left, right.
 * Tidak boleh mengandung business logic.
 *
 * @example
 * <Tooltip content="Hapus item ini" position="top">
 *   <Button variant="danger" size="icon"><Trash /></Button>
 * </Tooltip>
 */
export function Tooltip({ children, content, position = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClasses: Record<NonNullable<TooltipProps['position']>, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg',
            positionClasses[position]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
