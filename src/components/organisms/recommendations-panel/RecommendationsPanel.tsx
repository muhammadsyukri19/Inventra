'use client';
import { Typography } from '@/components/atoms/typography';
import { Badge } from '@/components/atoms/badge';
import { ArrowUpCircle } from 'lucide-react';

export const RecommendationsPanel = ({ data }: { data?: any[] }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-slate-400 mt-4 italic">Belum ada rekomendasi restock saat ini.</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition-hover hover:bg-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{item.product.name}</p>
                {/* Gunakan Number() dan fallback 0 */}
                <p className="text-xs text-slate-500">
                  Stok: {Number(item.currentStock) || 0} {item.product.unit}
                </p>
              </div>
          </div>
          <Badge variant="warning">Restock Segera</Badge>
        </div>
      ))}
    </div>
  );
};