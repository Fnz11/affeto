import { getOrCreateSessionId } from './session';
import type { Product, Category } from '@/types';

// In browser, call relative /api (Astro BFF route) or PUBLIC_STRAPI_URL if configured; on server call INTERNAL_STRAPI_URL directly
export const STRAPI_URL = typeof window !== 'undefined'
  ? ''
  : (process.env.INTERNAL_STRAPI_URL || process.env.PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337');

export async function fetcher<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (typeof window !== 'undefined') {
    const jwt = localStorage.getItem('affeto_jwt');
    if (jwt) {
      headers.set('Authorization', `Bearer ${jwt}`);
    }

    const sessionId = getOrCreateSessionId();
    if (sessionId) {
      headers.set('x-session-id', sessionId);
    }

    const currency = localStorage.getItem('affeto_currency') || 'USD';
    headers.set('x-currency', currency);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${STRAPI_URL}${cleanEndpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = 'An error occurred while fetching data';
    try {
      const errJson = await res.json();
      errorMsg = errJson?.error?.message || errJson?.message || errorMsg;
    } catch (e) {
      errorMsg = (await res.text()) || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// Server-side fetching helper
export async function getProducts(params: Record<string, string> = {}): Promise<Product[]> {
  try {
    const query = new URLSearchParams({
      'populate[0]': 'category',
      'populate[1]': 'variants',
      'populate[2]': 'variants.prices',
      'populate[3]': 'variants.inventory',
      ...params,
    });
    const serverBase = process.env.INTERNAL_STRAPI_URL || process.env.PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
    const res = await fetch(`${serverBase}/api/products?${query.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data || [];
  } catch (err) {
    console.error('Failed to get products:', err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const query = new URLSearchParams({
      'filters[slug][$eq]': slug,
      'populate[0]': 'category',
      'populate[1]': 'variants',
      'populate[2]': 'variants.prices',
      'populate[3]': 'variants.inventory',
    });
    const serverBase = process.env.INTERNAL_STRAPI_URL || process.env.PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
    const res = await fetch(`${serverBase}/api/products?${query.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data?.[0] || null;
  } catch (err) {
    console.error('Failed to get product by slug:', err);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const query = new URLSearchParams({
      'populate[0]': 'parent',
      'populate[1]': 'children',
    });
    const serverBase = process.env.INTERNAL_STRAPI_URL || process.env.PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
    const res = await fetch(`${serverBase}/api/categories?${query.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.data || [];
  } catch (err) {
    console.error('Failed to get categories:', err);
    return [];
  }
}
