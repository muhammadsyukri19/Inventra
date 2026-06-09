'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/atoms/button';
import { Typography } from '@/components/atoms/typography';
import { Avatar } from '@/components/atoms/avatar';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Truck,
  Warehouse,
  ArrowLeftRight,
  BarChart3,
  RefreshCw,
  Bell,
  Users,
  ChevronLeft,
  Package as Logo,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/constants/routes';
import { ROLE_PERMISSIONS, ROLE_LABELS } from '@/constants/roles';
import { cn } from '@/utils/cn';
import type { UserRole } from '@/types/common.types';

/**
 * Navigation item type definition.
 */
interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

/**
 * All navigation items grouped by section.
 */
const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Utama',
    items: [
      { key: 'dashboard', label: 'Dashboard', href: ROUTES.DASHBOARD, icon: <LayoutDashboard className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Manajemen',
    items: [
      { key: 'products', label: 'Produk', href: ROUTES.PRODUCTS, icon: <Package className="h-5 w-5" /> },
      { key: 'categories', label: 'Kategori', href: ROUTES.CATEGORIES, icon: <FolderTree className="h-5 w-5" /> },
      { key: 'suppliers', label: 'Supplier', href: ROUTES.SUPPLIERS, icon: <Truck className="h-5 w-5" /> },
      { key: 'inventory', label: 'Inventori', href: ROUTES.INVENTORY, icon: <Warehouse className="h-5 w-5" /> },
      { key: 'transactions', label: 'Transaksi', href: ROUTES.TRANSACTIONS, icon: <ArrowLeftRight className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Analitik',
    items: [
      { key: 'analytics', label: 'Analitik', href: ROUTES.ANALYTICS, icon: <BarChart3 className="h-5 w-5" /> },
      { key: 'recommendations', label: 'Restock', href: ROUTES.RECOMMENDATIONS, icon: <RefreshCw className="h-5 w-5" /> },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { key: 'notifications', label: 'Notifikasi', href: ROUTES.NOTIFICATIONS, icon: <Bell className="h-5 w-5" /> },
      { key: 'users', label: 'Pengguna', href: ROUTES.USERS, icon: <Users className="h-5 w-5" /> },
    ],
  },
];

/**
 * Sidebar organism.
 *
 * Composed from:
 * - Atoms: Button, Typography, Avatar
 *
 * Renders navigation based on authenticated user's role permissions.
 * Supports collapsed/expanded state via Zustand UI store.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const logoutMutation = useLogout();

  const userRole = (user?.role ?? 'staff_gudang') as UserRole;
  const allowedKeys = ROLE_PERMISSIONS[userRole] ?? [];

  const filteredSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => allowedKeys.includes(item.key)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-primary-800/30 bg-sidebar-bg text-sidebar-text transition-all duration-300',
        isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo — Avatar atom + Typography atom */}
      <div className="flex h-16 items-center gap-3 border-b border-primary-800/30 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500">
          <Logo className="h-5 w-5 text-white" />
        </div>
        {!isSidebarCollapsed && (
          <Typography variant="h3" as="span" className="text-white animate-fade-in">
            Inventaris
          </Typography>
        )}
      </div>

      {/* Navigation — Typography atoms for section titles */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {filteredSections.map((section) => (
          <div key={section.title} className="mb-4">
            {!isSidebarCollapsed && (
              <Typography
                variant="caption"
                weight="semibold"
                className="mb-2 px-3 uppercase tracking-wider text-primary-400"
              >
                {section.title}
              </Typography>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-active text-white'
                          : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {!isSidebarCollapsed && (
                        <Typography variant="body" as="span" className="text-inherit animate-fade-in">
                          {item.label}
                        </Typography>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer — Typography atoms + Button atom */}
      <div className="border-t border-primary-800/30 p-3">
        {/* User info — Typography atoms */}
        {!isSidebarCollapsed && user && (
          <div className="mb-3 rounded-lg bg-primary-900/40 px-3 py-2.5 animate-fade-in">
            <Typography variant="body" weight="medium" className="text-white truncate">
              {user.name}
            </Typography>
            <Typography variant="body-sm" className="text-primary-300 truncate">
              {ROLE_LABELS[userRole]}
            </Typography>
          </div>
        )}

        {/* Logout — Button atom */}
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={() => logoutMutation.mutate()}
          leftIcon={<LogOut className="h-5 w-5 shrink-0" />}
          className={cn(
            'justify-start text-primary-300 hover:bg-sidebar-hover hover:text-white',
            isSidebarCollapsed && 'justify-center px-0'
          )}
          aria-label="Logout"
        >
          {!isSidebarCollapsed && 'Keluar'}
        </Button>

        {/* Collapse toggle — Button atom */}
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={toggleSidebar}
          className="mt-1 text-primary-400 hover:bg-sidebar-hover hover:text-white"
          aria-label={isSidebarCollapsed ? 'Perlebar sidebar' : 'Perkecil sidebar'}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 transition-transform duration-300',
              isSidebarCollapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>
    </aside>
  );
}
