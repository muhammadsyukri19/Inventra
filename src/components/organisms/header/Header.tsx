'use client';

import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Avatar } from '@/components/atoms/avatar';
import { Typography } from '@/components/atoms/typography';
import { Menu, Search } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { ROLE_LABELS } from '@/constants/roles';
import type { UserRole } from '@/types/common.types';
import { NotificationDropdown } from '@/components/molecules/notification-dropdown';

/**
 * Header organism.
 *
 * Composed from:
 * - Atoms: Button, Input, Avatar, Typography
 *
 * Menampilkan search bar, notification bell, dan user info.
 */
export function Header() {
  const { user } = useAuthStore();
  const { toggleMobileMenu } = useUIStore();
  const userRole = (user?.role ?? 'staff_gudang') as UserRole;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border-default bg-surface/80 backdrop-blur-md px-4 sm:px-6">
      {/* Left — Mobile menu toggle (Button atom) + Search (Input atom) */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden sm:block">
          <Input
            placeholder="Cari produk, transaksi..."
            leftIcon={<Search className="h-4 w-4" />}
            size="sm"
            className="w-48 lg:w-64"
            aria-label="Cari"
          />
        </div>
      </div>

      {/* Right — Notification (Button atom) + User (Avatar atom + Typography atom) */}
      <div className="flex items-center gap-3">
        {/* Notification bell — Dropdown molecule */}
        <NotificationDropdown />

        {/* User info — Typography atoms + Avatar atom */}
        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
            <Typography variant="body" weight="medium">
              {user?.name ?? 'User'}
            </Typography>
            <Typography variant="body-sm" color="tertiary">
              {ROLE_LABELS[userRole]}
            </Typography>
          </div>

          {/* Avatar atom */}
          <Avatar
            alt={user?.name ?? 'User'}
            size="md"
          />
        </div>
      </div>
    </header>
  );
}
