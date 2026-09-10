import { useQuery, useMutation } from '@tanstack/react-query';
import { fetcher } from './api';
import { queryClient } from './queryClient';
import { useCartStore } from '@/stores/cartStore';
import { useCurrencyStore } from '@/stores/currencyStore';
import { useAuthStore } from '@/stores/authStore';
import type { Cart, Order, Address, DiscountCodeResult } from '@/types';

// CART HOOKS
export function useCart() {
  const currency = useCurrencyStore((s) => s.currency);
  const setOptimisticBadgeCount = useCartStore((s) => s.setOptimisticBadgeCount);

  return useQuery<Cart>({
    queryKey: ['cart', currency],
    queryFn: async () => {
      const res = await fetcher<{ data: Cart }>('/api/cart');
      const cart = res.data;
      if (cart) {
        setOptimisticBadgeCount(cart.totalItems || 0);
      }
      return cart;
    },
  });
}

export function useAddToCart() {
  const openDrawer = useCartStore((s) => s.openDrawer);
  const incrementOptimisticBadge = useCartStore((s) => s.incrementOptimisticBadge);
  const currency = useCurrencyStore((s) => s.currency);

  return useMutation({
    mutationFn: async ({ variantId, quantity = 1 }: { variantId: number; quantity?: number }) => {
      incrementOptimisticBadge(quantity);
      return fetcher<{ data: Cart }>('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ variantId, quantity, currency }),
      });
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['cart', currency], res.data);
      openDrawer();
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem() {
  const currency = useCurrencyStore((s) => s.currency);

  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string | number; quantity: number }) => {
      return fetcher<{ data: Cart }>(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['cart', currency], res.data);
    },
  });
}

export function useRemoveCartItem() {
  const currency = useCurrencyStore((s) => s.currency);

  return useMutation({
    mutationFn: async (itemId: string | number) => {
      return fetcher<{ data: Cart }>(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: (res) => {
      queryClient.setQueryData(['cart', currency], res.data);
    },
  });
}

export function useClearCart() {
  return useMutation({
    mutationFn: async () => {
      return fetcher('/api/cart', { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// WISHLIST HOOKS
export function useWishlist() {
  const jwt = useAuthStore((s) => s.jwt);

  return useQuery({
    queryKey: ['wishlist', jwt],
    queryFn: async () => {
      if (!jwt) return { products: [] };
      const res = await fetcher<{ data: any }>('/api/wishlist');
      return res.data;
    },
    enabled: !!jwt,
  });
}

export function useToggleWishlist() {
  return useMutation({
    mutationFn: async (productId: number) => {
      return fetcher<{ inWishlist: boolean; wishlist: any }>('/api/wishlist/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

// DISCOUNT HOOK
export function useValidateDiscount() {
  return useMutation({
    mutationFn: async ({ code, subtotal }: { code: string; subtotal: number }) => {
      return fetcher<DiscountCodeResult>('/api/discount-codes/validate', {
        method: 'POST',
        body: JSON.stringify({ code, subtotal }),
      });
    },
  });
}

// CHECKOUT HOOK
export function useCreateCheckoutSession() {
  const currency = useCurrencyStore((s) => s.currency);

  return useMutation({
    mutationFn: async (payload: {
      customerEmail: string;
      shippingAddress: Address | any;
      discountCode?: string;
      notes?: string;
    }) => {
      return fetcher<{
        mode: 'stripe' | 'mock';
        checkoutUrl: string;
        orderNumber: string;
        sessionId?: string;
        totalAmount: number;
        currency: string;
      }>('/api/checkout/session', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          currency,
        }),
      });
    },
  });
}

// ORDERS HOOK
export function useMyOrders() {
  const jwt = useAuthStore((s) => s.jwt);

  return useQuery<{ data: Order[] }>({
    queryKey: ['my-orders', jwt],
    queryFn: async () => {
      return fetcher<{ data: Order[] }>('/api/orders');
    },
    enabled: !!jwt,
  });
}

export function useOrder(orderNumber: string, email?: string) {
  return useQuery<{ data: Order }>({
    queryKey: ['order', orderNumber, email],
    queryFn: async () => {
      const q = email ? `?email=${encodeURIComponent(email)}` : '';
      return fetcher<{ data: Order }>(`/api/orders/${orderNumber}${q}`);
    },
    enabled: !!orderNumber,
  });
}

// ADDRESS HOOKS
export function useAddresses() {
  const jwt = useAuthStore((s) => s.jwt);

  return useQuery<{ data: Address[] }>({
    queryKey: ['addresses', jwt],
    queryFn: async () => {
      return fetcher<{ data: Address[] }>('/api/addresses');
    },
    enabled: !!jwt,
  });
}

export function useCreateAddress() {
  return useMutation({
    mutationFn: async (addressData: Partial<Address>) => {
      return fetcher<{ data: Address }>('/api/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
}
