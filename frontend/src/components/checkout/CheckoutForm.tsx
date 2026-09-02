import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Lock, CreditCard, Tag, AlertCircle } from 'lucide-react';
import { useCart, useCreateCheckoutSession, useValidateDiscount } from '@/lib/useCommerce';
import { useAuthStore } from '@/stores/authStore';
import { useCurrencyStore } from '@/stores/currencyStore';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function CheckoutForm() {
  const { data: cart, isLoading: isCartLoading } = useCart();
  const { user } = useAuthStore();
  const currency = useCurrencyStore((s) => s.currency);
  const createCheckout = useCreateCheckoutSession();
  const validateDiscount = useValidateDiscount();

  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
  });

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountAmount: number;
    value: number;
    discountType: 'percent' | 'flat';
  } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    // Check url search params for discount
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('discount');
    if (code) {
      setDiscountCode(code);
    }
  }, [user]);

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const freeShippingThreshold = 10000;
  const shippingAmount = subtotal >= freeShippingThreshold ? 0 : (subtotal > 0 ? 1000 : 0);
  const discountAmount = appliedDiscount?.discountAmount || 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

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
        setAppliedDiscount(res);
      }
    } catch (err: any) {
      setDiscountError(err.message || 'Invalid discount code');
    }
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email.trim()) {
      setFormError('Please enter a valid email address');
      return;
    }
    if (!shippingAddress.name || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      setFormError('Please fill out all required shipping fields');
      return;
    }

    try {
      const res = await createCheckout.mutateAsync({
        customerEmail: email.trim(),
        shippingAddress,
        discountCode: appliedDiscount?.code,
      });

      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to initialize checkout session');
    }
  };

  if (isCartLoading) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground animate-pulse">Loading checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="font-editorial text-2xl font-bold">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground">Add items to your bag before proceeding to checkout.</p>
        <Button onClick={() => (window.location.href = '/catalog')}>Return to Catalog</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Checkout Form (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="font-editorial text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Complete your order with secure Stripe payment processing.
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitCheckout} className="space-y-6">
            {/* Contact Information */}
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                1. Contact Information
              </h3>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="text-[11px] text-muted-foreground mt-1 block">
                  We'll send order confirmation and tracking details here.
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card p-6 rounded-lg border border-border space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                2. Shipping Destination
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
                  <Input
                    type="text"
                    placeholder="Jane Doe"
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Street Address *</label>
                  <Input
                    type="text"
                    placeholder="742 Evergreen Terrace"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">City *</label>
                    <Input
                      type="text"
                      placeholder="Springfield"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">State / Region</label>
                    <Input
                      type="text"
                      placeholder="OR"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Postal Code *</label>
                    <Input
                      type="text"
                      placeholder="97477"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Country *</label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full h-10 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Japan">Japan</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone (Optional)</label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-card p-6 rounded-lg border border-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  3. Payment Method
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Stripe PCI-DSS Compliant</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                You will be seamlessly redirected to Stripe's encrypted payment gateway to authorize payment via Credit/Debit Card, Apple Pay, or Google Pay.
              </p>
              <div className="p-3 bg-secondary/50 rounded-md flex items-center gap-3 text-xs text-foreground font-medium border border-border">
                <CreditCard className="w-4 h-4 text-primary" />
                <span>Credit Card / Apple Pay / Google Pay via Stripe</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={createCheckout.isPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-base"
            >
              <span>Pay {formatPrice(totalAmount, currency)}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Right: Order Summary Sidebar (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-card p-6 rounded-lg border border-border space-y-6 sticky top-28">
            <h3 className="font-editorial text-lg font-bold border-b border-border pb-3">
              Order Summary ({cart?.totalItems || 0} items)
            </h3>

            {/* Items list */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=150&q=80'}
                    alt={item.productName}
                    className="w-14 h-16 object-cover rounded-md bg-muted flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-medium text-foreground line-clamp-1">{item.productName}</h4>
                      <p className="text-muted-foreground">{item.variantTitle}</p>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span className="font-semibold text-foreground">
                        {formatPrice(item.unitPrice * item.quantity, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <div className="pt-3 border-t border-border space-y-2">
              <form onSubmit={handleApplyDiscount} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="w-full text-xs pl-8 pr-3 py-2 border border-border rounded-md bg-background focus:outline-none uppercase tracking-wider"
                  />
                </div>
                <Button type="submit" variant="outline" size="sm" isLoading={validateDiscount.isPending}>
                  Apply
                </Button>
              </form>
              {discountError && <p className="text-[11px] text-destructive">{discountError}</p>}
              {appliedDiscount && (
                <div className="flex justify-between items-center text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                  <span>Code <strong>{appliedDiscount.code}</strong> applied</span>
                  <button onClick={() => setAppliedDiscount(null)} className="underline text-xs">
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-muted-foreground pt-3 border-t border-border">
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
              <div className="flex justify-between text-base font-bold text-foreground pt-3 border-t border-border">
                <span>Total</span>
                <span className="font-editorial text-lg">{formatPrice(totalAmount, currency)}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Free returns within 30 days of delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
