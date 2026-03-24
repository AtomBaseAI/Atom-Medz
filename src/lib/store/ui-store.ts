import { create } from 'zustand';

type PageType =
  | 'dashboard'
  | 'billing'
  | 'returns'
  | 'inventory'
  | 'stock-entry'
  | 'expiry'
  | 'accounts'
  | 'reports'
  | 'customers'
  | 'suppliers'
  | 'print-settings'
  | 'admin-settings';

interface UIState {
  currentPage: PageType;
  sidebarOpen: boolean;
  setCurrentPage: (page: PageType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentPage: 'dashboard',
  sidebarOpen: true,
  setCurrentPage: (currentPage) => set({ currentPage }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
