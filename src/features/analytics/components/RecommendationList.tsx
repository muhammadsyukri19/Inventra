'use client';

import React, { useState } from 'react';
import { RecommendationCard } from './RecommendationCard';
import { SearchBar } from '@/components/molecules/search-bar';
import { Typography } from '@/components/atoms/typography';
import { EmptyState } from '@/components/molecules/empty-state';
import { Sparkles, Filter } from 'lucide-react';
import type { RestockRecommendation, RecommendationPriority, RecommendationStatus } from '../types/recommendation.types';

interface RecommendationListProps {
  data: RestockRecommendation[];
  userRole: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isActionPending: boolean;
}

export function RecommendationList({
  data,
  userRole,
  onApprove,
  onReject,
  isActionPending,
}: RecommendationListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  // Filtering logic
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.product.name.toLowerCase().includes(search.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' ? true : item.status === statusFilter;
    const matchesPriority = priorityFilter === '' ? true : item.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* ── FILTER & ACTIONS BAR ──────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Cari berdasarkan SKU atau nama produk..."
            className="w-full md:max-w-md"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filter Priority */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-lg border border-border-default bg-surface text-sm text-text-primary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer appearance-none min-w-36"
              aria-label="Filter prioritas"
            >
              <option value="">Semua Prioritas</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-tertiary">
              <Filter className="h-4 w-4" />
            </div>
          </div>

          {/* Filter Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-lg border border-border-default bg-surface text-sm text-text-primary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 cursor-pointer appearance-none min-w-36"
              aria-label="Filter status keputusan"
            >
              <option value="">Semua Keputusan</option>
              <option value="PENDING">Menunggu Review (Pending)</option>
              <option value="APPROVED">Disetujui (Approved)</option>
              <option value="REJECTED">Ditolak (Rejected)</option>
              <option value="COMPLETED">Selesai (Completed)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-tertiary">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ── RECOMMENDATIONS GRID ─────────────────────────────────────────── */}
      {filteredData.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface p-12 text-center">
          <EmptyState
            icon={<Sparkles className="h-12 w-12 text-text-tertiary animate-pulse" />}
            title="Tidak Ada Rekomendasi"
            description="Tidak ditemukan saran restock yang cocok dengan filter pencarian Anda."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <RecommendationCard
              key={item.id}
              recommendation={item}
              userRole={userRole}
              onApprove={onApprove}
              onReject={onReject}
              isActionPending={isActionPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
