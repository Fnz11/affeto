import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Currency, Price } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amountMinor: number = 0, currency: Currency = 'USD'): string {
  const major = (amountMinor || 0) / 100;
  const currencyLocales: Record<Currency, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
  };

  return new Intl.NumberFormat(currencyLocales[currency] || 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: major % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(major);
}

export function getVariantPrice(variant: any, currency: Currency = 'USD'): number {
  if (!variant) return 0;
  if (variant.prices && Array.isArray(variant.prices)) {
    const p = variant.prices.find((item: Price) => item.currency === currency);
    if (p) return p.amount;
    if (variant.prices[0]) return variant.prices[0].amount;
  }
  return variant.priceOverride || 0;
}

export function getProductMinPrice(product: any, currency: Currency = 'USD'): number {
  if (!product?.variants || product.variants.length === 0) return 0;
  const prices = product.variants.map((v: any) => getVariantPrice(v, currency));
  return Math.min(...prices);
}

export function getProductImage(product: any, index = 0): string {
  if (!product?.images) return 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
  if (Array.isArray(product.images)) {
    const img = product.images[index] || product.images[0];
    if (typeof img === 'string') return img;
    return img?.url || '';
  }
  if (typeof product.images === 'string') return product.images;
  return '';
}
