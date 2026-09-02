export type Currency = 'USD' | 'EUR' | 'GBP';

export interface Price {
  id: number;
  currency: Currency;
  amount: number; // in minor units (cents)
  compareAtAmount?: number;
}

export interface Inventory {
  id: number;
  quantity: number;
  lowStockThreshold: number;
}

export interface Variant {
  id: number;
  title: string;
  sku: string;
  size?: string;
  color?: string;
  colorHex?: string;
  weight?: number;
  image?: string;
  inventory?: Inventory;
  prices?: Price[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: Category;
  children?: Category[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  details?: string;
  features?: string[];
  images: string[] | { url: string }[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  category?: Category;
  variants?: Variant[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface CartLineItem {
  id: string | number;
  variant: Variant | number;
  quantity: number;
  unitPrice: number;
  currency: Currency;
  productName: string;
  variantTitle: string;
  sku: string;
  imageUrl?: string;
}

export interface Cart {
  id: number;
  sessionId?: string;
  currency: Currency;
  items: CartLineItem[];
  subtotal: number;
  totalItems: number;
  lastActiveAt?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Address {
  id: number;
  name: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface OrderItem {
  id: number;
  productName: string;
  variantTitle: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: Currency;
  imageUrl?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerEmail: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
  currency: Currency;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: Address;
  notes?: string;
  createdAt: string;
}

export interface DiscountCodeResult {
  valid: boolean;
  code: string;
  discountType: 'percent' | 'flat';
  value: number;
  discountAmount: number;
}
