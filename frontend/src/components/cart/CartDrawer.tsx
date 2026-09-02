import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle, Tag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useCurrencyStore } from '@/stores/currencyStore';
import { useCart, useUpdateCartItem, useRemoveCartItem, useValidateDiscount } from '@/lib/useCommerce';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const { isOpen, closeDrawer } = useCartStore();
  const currency = useCurrencyStore((s) => s.currency);
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const validateDiscount = useValidateDiscount();

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountAmount: number;
    value: number;
    discountType: 'percent' | 'flat';
  } | null>(null);
  const [discountError, setDiscountError] = useState('');

  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const freeShippingThreshold = 10000; // $100 / €100 / £100
  const freeShippingLeft = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const discountAmount = appliedDiscount?.discountAmount || 0;
  const shippingAmount = subtotal >= freeShippingThreshold ? 0 : (subtotal > 0 ? 1000 : 0);
  const estimatedTotal = Math.max(0, subtotal - discountAmount + shippingAmount);

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountCode.trim()) return;
    setDiscountError('');
    try {
      const res = await validateDiscount.mutateAsync({
        code: discountCode.trim(),
        subtotal,
      });
      if (res.valid) {
        setAppliedDiscount({
          code: res.code,
          discountAmount: res.discountAmount,
          value: res.value,
          discountType: res.discountType,
        });
      }
    } catch (err: any) {
      setDiscountError(err.message || 'Invalid promo code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Shopping Cart Drawer"
          className="w-screen max-w-md bg-background shadow-2xl flex flex-col z-10 border-l border-border"
        >
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-foreground" />
              <h2 className="font-editorial text-xl font-bold tracking-tight">Shopping Bag</h2>
              <span className="text-xs text-muted-foreground">({cart?.totalItems || 0} items)</span>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-secondary/60 px-5 py-3 border-b border-border text-xs">
            {freeShippingLeft === 0 ? (
              <div className="flex items-center text-emerald-800 font-medium">
                <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600 flex-shrink-0" />
                <span>You unlocked <strong>Free Standard Shipping!</strong></span>
              </div>
            ) : (
              <p className="text-muted-foreground font-medium">
                Add <strong className="text-foreground">{formatPrice(freeShippingLeft, currency)}</strong> more to get Free Shipping
              </p>
            )}
            <div className="w-full bg-border h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <span className="text-sm text-muted-foreground animate-pulse">Loading your cart...</span>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
                <div className="space-y-1">
                  <p className="font-editorial text-lg font-medium">Your bag is empty</p>
                  <p className="text-xs text-muted-foreground">Explore our timeless essentials catalog</p>
                </div>
                <Button
                  onClick={() => {
                    closeDrawer();
                    window.location.href = '/catalog';
                  }}
                  variant="outline"
                  size="sm"
                >
                  Browse Collection
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors"
                >
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=200&q=80'}
                    alt={item.productName}
                    className="w-20 h-24 object-cover rounded-md bg-muted flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeItem.mutate(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.variantTitle} {item.sku ? `• ${item.sku}` : ''}
                      </p>
                      <p className="text-xs font-semibold text-foreground mt-1">
                        {formatPrice(item.unitPrice, currency)}
                      </p>
                    </div>

                    {/* Quantity modifier */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center border border-border rounded-md">
                        <button
                          onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                          disabled={item.quantity <= 1 || updateItem.isPending}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold select-none">{item.quantity}</span>
                        <button
                          onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                          disabled={updateItem.isPending}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        {formatPrice(item.unitPrice * item.quantity, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-border bg-card space-y-4">
              {/* Promo Code Accordion */}
              <form onSubmit={handleApplyDiscount} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Promo Code (e.g. WELCOME10)"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary uppercase tracking-wider"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  isLoading={validateDiscount.isPending}
                >
                  Apply
                </Button>
              </form>

              {discountError && <p className="text-[11px] text-destructive">{discountError}</p>}
              {appliedDiscount && (
                <div className="flex justify-between items-center text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-md">
                  <span>Code <strong>{appliedDiscount.code}</strong> applied</span>
                  <button onClick={() => setAppliedDiscount(null)} className="text-xs underline hover:no-underline">
                    Remove
                  </button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-muted-foreground pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-foreground font-medium">{formatPrice(subtotal, currency)}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingAmount === 0 ? <strong className="text-emerald-700 font-semibold">FREE</strong> : formatPrice(shippingAmount, currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border">
                  <span>Estimated Total</span>
                  <span className="font-editorial text-base">{formatPrice(estimatedTotal, currency)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={() => {
                  closeDrawer();
                  window.location.href = appliedDiscount
                    ? `/checkout?discount=${appliedDiscount.code}`
                    : '/checkout';
                }}
                className="w-full flex items-center justify-center gap-2 py-3"
                size="lg"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                Taxes calculated at checkout • Secure Stripe 256-bit encryption
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
