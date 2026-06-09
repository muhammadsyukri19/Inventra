'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Button } from '../../atoms/button';
import { Typography } from '../../atoms/typography';
import { X } from 'lucide-react';

interface SmartScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
}

export const SmartScanner: React.FC<SmartScannerProps> = ({ 
  onScanSuccess, 
  onClose,
  title = "AI Smart Scanner" 
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Initialize Scanner when component mounts
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Stop scanner on success
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // We usually ignore continuous errors unless we want to show them
        // setError(errorMessage);
      }
    );

    // Cleanup on unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-default">
          <Typography variant="h3">{title}</Typography>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close Scanner">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scanner Body */}
        <div className="p-4 flex flex-col items-center">
          <Typography variant="body2" className="text-secondary mb-4 text-center">
            Arahkan kamera ke Barcode atau QR Code produk Anda. AI akan memindai secara otomatis.
          </Typography>
          
          <div id="reader" className="w-full rounded-lg overflow-hidden border-2 border-primary/20 bg-black/5"></div>
          
          {error && (
            <Typography variant="body2" className="text-danger mt-2">
              {error}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};
