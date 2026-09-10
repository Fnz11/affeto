import { create } from 'zustand';

interface CartUIState {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  optimisticBadgeCount: number;
  setOptimisticBadgeCount: (count: number) => void;
  incrementOptimisticBadge: (qty?: number) => void;
  initBadgeCount: () => void;
}

export const useCartStore = create<CartUIState>((set) => {
  const getInitialBadge = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('affeto_cart_count');
      return saved ? parseInt(saved, 10) || 0 : 0;
    }
    return 0;
  };

  return {
    isOpen: false,
    openDrawer: () => set({ isOpen: true }),
    closeDrawer: () => set({ isOpen: false }),
    toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
    optimisticBadgeCount: getInitialBadge(),
    setOptimisticBadgeCount: (count: number) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('affeto_cart_count', String(count));
      }
      set({ optimisticBadgeCount: count });
    },
    incrementOptimisticBadge: (qty = 1) =>
      set((state) => {
        const newCount = state.optimisticBadgeCount + qty;
        if (typeof window !== 'undefined') {
          localStorage.setItem('affeto_cart_count', String(newCount));
        }
        return { optimisticBadgeCount: newCount };
      }),
    initBadgeCount: () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('affeto_cart_count');
        if (saved !== null) {
          set({ optimisticBadgeCount: parseInt(saved, 10) || 0 });
        }
      }
    },
  };
});
