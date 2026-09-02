import React from 'react';
import { useCurrencyStore } from '@/stores/currencyStore';
import type { Currency } from '@/types';
import { Globe } from 'lucide-react';

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrencyStore();

  const currencies: { code: Currency; label: string; symbol: string }[] = [
    { code: 'USD', label: 'USD', symbol: '$' },
    { code: 'EUR', label: 'EUR', symbol: '€' },
    { code: 'GBP', label: 'GBP', symbol: '£' },
  ];

  return (
    <div className="relative inline-flex items-center text-xs font-medium">
      <Globe className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="bg-transparent text-foreground cursor-pointer font-medium focus:outline-none pr-1 uppercase tracking-wider"
        aria-label="Select currency"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code} className="bg-white text-zinc-900">
            {c.symbol} {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
