import { create } from 'zustand';

/**
 * UI store (Zustand).
 *
 * Manages global UI state such as sidebar collapse and mobile menu toggle.
 */

interface UIState {
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  isSidebarCollapsed: false,
  isMobileMenuOpen: false,

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  setSidebarCollapsed: (collapsed) =>
    set({ isSidebarCollapsed: collapsed }),

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  closeMobileMenu: () =>
    set({ isMobileMenuOpen: false }),
}));
