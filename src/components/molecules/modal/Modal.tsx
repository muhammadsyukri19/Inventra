import { useEffect, useRef } from 'react';
import { Typography } from '@/components/atoms/typography';
import { Button } from '@/components/atoms/button';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ModalProps {
  /** Controlled open state */
  isOpen: boolean;
  /** Callback when modal requests to close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Main content */
  children: React.ReactNode;
  /** Optional footer content (buttons, etc) */
  footer?: React.ReactNode;
  /** Optional max width class (e.g. max-w-lg, max-w-xl) */
  maxWidth?: string;
}

/**
 * Modal molecule.
 *
 * Menggabungkan backdrop, container, Typography untuk title,
 * Button atom untuk close, dan children area.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative z-10 flex w-full flex-col max-h-[90vh] overflow-hidden rounded-xl bg-surface shadow-xl animate-scale-in',
          maxWidth
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
          <Typography id="modal-title" variant="h3">
            {title}
          </Typography>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="-mr-2 text-text-tertiary hover:text-text"
            aria-label="Tutup dialog"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border-default bg-surface-secondary px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
