'use client';

import { Sidebar } from '@/components/organisms/sidebar';
import { Header } from '@/components/organisms/header';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/utils/cn';

/**
 * Dashboard layout.
 *
 * Provides the main application shell with sidebar and header.
 * Adjusts content area based on sidebar collapsed state.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarCollapsed } = useUIStore();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        )}
      >
        <Header />

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
