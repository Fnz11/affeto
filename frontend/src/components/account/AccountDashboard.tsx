import React, { useEffect } from 'react';
import { Package, MapPin, Heart, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useMyOrders } from '@/lib/useCommerce';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { withQueryClient } from '@/lib/queryClient';

function AccountDashboardComponent() {
  const { user, jwt, logout, initAuth } = useAuthStore();
  const { data: ordersData, isLoading: isOrdersLoading } = useMyOrders();

  useEffect(() => {
    initAuth();
  }, []);

  if (!jwt && typeof window !== 'undefined') {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="font-editorial text-2xl font-bold">Sign In Required</h2>
        <p className="text-xs text-muted-foreground">Please sign in to access your account dashboard.</p>
        <Button onClick={() => (window.location.href = '/account/login')}>Go to Sign In</Button>
      </div>
    );
  }

  const recentOrders = ordersData?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-8 border-b border-border">
        <div>
          <h1 className="font-editorial text-3xl font-bold tracking-tight">
            Hello, {user?.username || 'Customer'}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
        </div>
        <Button
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
        <a
          href="/account/orders"
          className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-secondary rounded-lg">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-editorial text-lg font-bold mt-4">Order History</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Track orders, view receipts and shipment status
          </p>
        </a>

        <a
          href="/account/addresses"
          className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-secondary rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-editorial text-lg font-bold mt-4">Saved Addresses</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your shipping and billing destinations
          </p>
        </a>

        <a
          href="/account/wishlist"
          className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-secondary rounded-lg">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="font-editorial text-lg font-bold mt-4">My Wishlist</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Saved items for later purchase
          </p>
        </a>
      </div>

      {/* Recent Orders Overview */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-editorial text-xl font-bold">Recent Orders</h2>
          {recentOrders.length > 0 && (
            <a href="/account/orders" className="text-xs font-semibold text-primary hover:underline">
              View All Orders →
            </a>
          )}
        </div>

        {isOrdersLoading ? (
          <p className="text-xs text-muted-foreground animate-pulse py-8 text-center">Loading orders...</p>
        ) : recentOrders.length === 0 ? (
          <div className="bg-card p-8 rounded-lg border border-border text-center space-y-3">
            <Package className="w-8 h-8 text-muted-foreground mx-auto stroke-1" />
            <p className="text-sm font-medium text-foreground">You haven't placed any orders yet</p>
            <Button onClick={() => (window.location.href = '/catalog')} variant="outline" size="sm">
              Explore Store
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="bg-card p-5 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-foreground">{order.orderNumber}</span>
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
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    • {order.items?.length || 0} items
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <span className="font-editorial font-bold text-base text-foreground">
                    {formatPrice(order.totalAmount, order.currency)}
                  </span>
                  <a
                    href={`/checkout/success?orderNumber=${order.orderNumber}`}
                    className="text-xs font-semibold text-primary underline underline-offset-4 hover:no-underline"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const AccountDashboard = withQueryClient(AccountDashboardComponent);
