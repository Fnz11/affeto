import { create } from 'zustand';
import type { Currency } from '@/types';

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => {
  let initial: Currency = 'USD';
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('affeto_currency') as Currency;
    if (saved && ['USD', 'EUR', 'GBP'].includes(saved)) {
      initial = saved;
    }
  }

  return {
    currency: initial,
    setCurrency: (currency: Currency) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('affeto_currency', currency);
        document.cookie = `affeto_currency=${currency}; path=/; max-age=31536000`;
      }
      set({ currency });
    },
  };
});
