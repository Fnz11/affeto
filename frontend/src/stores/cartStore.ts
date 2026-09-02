import { create } from 'zustand';

interface CartUIState {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  optimisticBadgeCount: number;
  setOptimisticBadgeCount: (count: number) => void;
  incrementOptimisticBadge: (qty?: number) => void;
}

export const useCartStore = create<CartUIState>((set) => ({
  isOpen: false,
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
  optimisticBadgeCount: 0,
  setOptimisticBadgeCount: (count: number) => set({ optimisticBadgeCount: count }),
  incrementOptimisticBadge: (qty = 1) => set((state) => ({ optimisticBadgeCount: state.optimisticBadgeCount + qty })),
}));
