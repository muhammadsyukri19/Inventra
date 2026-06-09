'use client';

import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button';
import { cn } from '@/utils/cn';
import { AlertTriangle } from 'lucide-react';

/**
 * ConfirmDialog molecule.
 *
 * Menggabungkan Typography + Button atoms untuk dialog konfirmasi.
 * Biasa digunakan untuk konfirmasi hapus atau aksi berbahaya.
 *
 * @example
 * {showConfirm && (
 *   <ConfirmDialog
 *     title="Hapus Produk?"
 *     description="Produk ini akan dihapus secara permanen."
 *     confirmLabel="Hapus"
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowConfirm(false)}
 *     loading={isDeleting}
 *     variant="danger"
 *   />
 * )}
 */

interface ConfirmDialogProps {
  /** Dialog title */
  title: string;
  /** Description text */
  description: string;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Confirm callback */
  onConfirm: () => void;
  /** Cancel callback */
  onCancel: () => void;
  /** Loading state for confirm button */
  loading?: boolean;
  /** Button variant for confirm */
  variant?: 'primary' | 'danger';
  className?: string;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'danger',
  className,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-xl bg-surface p-6 shadow-xl animate-scale-in',
          className
        )}
        role="alertdialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              variant === 'danger' ? 'bg-danger-50 text-danger-600' : 'bg-primary-100 text-primary-600'
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <Typography id="confirm-title" variant="h4">
              {title}
            </Typography>
            <Typography
              id="confirm-desc"
              variant="body"
              color="secondary"
              className="mt-1"
            >
              {description}
            </Typography>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
