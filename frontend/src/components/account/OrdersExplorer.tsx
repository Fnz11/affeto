import React, { useEffect } from 'react';
import { useMyOrders } from '@/lib/useCommerce';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Package, ExternalLink } from 'lucide-react';
import { withQueryClient } from '@/lib/queryClient';

function OrdersExplorerComponent() {
  const { data: ordersData, isLoading } = useMyOrders();
  const { initAuth, jwt } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  if (!jwt && typeof window !== 'undefined') {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="font-editorial text-2xl font-bold">Sign In Required</h2>
        <p className="text-xs text-muted-foreground">Please sign in to view your orders.</p>
        <Button onClick={() => (window.location.href = '/account/login')}>Go to Sign In</Button>
      </div>
    );
  }

  const orders = ordersData?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="font-editorial text-3xl font-bold tracking-tight">Order History</h1>
        <p className="text-xs text-muted-foreground">Review your past purchases, shipment statuses and receipts</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card p-16 rounded-xl border border-border text-center space-y-4 max-w-md mx-auto">
          <Package className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
          <div className="space-y-1">
            <h3 className="font-editorial text-xl font-bold">No orders found</h3>
            <p className="text-xs text-muted-foreground">Your order history is currently empty.</p>
          </div>
          <Button onClick={() => (window.location.href = '/catalog')} size="sm">
            Shop Catalog
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-xl border border-border overflow-hidden shadow-xs"
            >
              {/* Card Header */}
              <div className="bg-secondary/40 p-5 flex flex-wrap items-center justify-between gap-4 border-b border-border text-xs">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-muted-foreground block">Order Placed</span>
                    <span className="font-semibold text-foreground">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Total Amount</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(order.totalAmount, order.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Order Number</span>
                    <span className="font-mono font-semibold text-foreground">{order.orderNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      order.status === 'paid'
                        ? 'success'
                        : order.status === 'fulfilled'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {order.status.toUpperCase()}
                  </Badge>
                  <a
                    href={`/checkout/success?orderNumber=${order.orderNumber}`}
                    className="p-1.5 text-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
                  >
                    <span>Receipt</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Items in order */}
              <div className="p-5 divide-y divide-border">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=150&q=80'}
                        alt={item.productName}
                        className="w-14 h-16 object-cover rounded-md bg-muted flex-shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{item.productName}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.variantTitle} • SKU: {item.sku}
                        </p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>

                    <span className="font-semibold text-sm text-foreground">
                      {formatPrice(item.totalPrice, item.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const OrdersExplorer = withQueryClient(OrdersExplorerComponent);
