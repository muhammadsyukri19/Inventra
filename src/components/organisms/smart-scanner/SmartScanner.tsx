'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Button } from '../../atoms/button';
import { Typography } from '../../atoms/typography';
import { Spinner } from '../../atoms/spinner'; 
import { X, AlertCircle } from 'lucide-react';
import { inventoryService } from '@/features/inventory/services/inventory.service'; 

interface SmartScannerProps {
  onScanSuccess: (product: any) => void; 
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
  const [isValidating, setIsValidating] = useState<boolean>(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        try {
          setError('');
          setIsValidating(true);
          const product = await inventoryService.validateBarcode(decodedText);

          if (scannerRef.current) {
            await scannerRef.current.clear();
          }
          onScanSuccess(product); 
        } catch (err: any) {
          setError(err.message || 'Produk tidak ditemukan di database.');
        } finally {
          setIsValidating(false);
        }
      },
      () => {}
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col border border-default text-white">
        <div className="flex justify-between items-center p-4 border-b border-default">
          <Typography variant="h3">{title}</Typography>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 flex flex-col items-center">
          {isValidating ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Spinner size="lg" />
              <Typography variant="body" className="mt-4">Memvalidasi Kode Produk...</Typography>
            </div>
          ) : (
            <>
              {/* DI SINI SUDAH DIGANTI JADI variant="body" */}
              <Typography variant="body" className="text-secondary mb-4 text-center">
                Arahkan kamera ke Barcode produk. Sistem akan memvalidasi secara otomatis.
              </Typography>
              
              <div id="reader" className="w-full rounded-lg overflow-hidden border-2 border-primary/20 bg-black/5"></div>
              
              {error && (
                <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-2 text-danger">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <Typography variant="body">{error}</Typography>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};