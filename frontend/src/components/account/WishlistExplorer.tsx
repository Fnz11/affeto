import React, { useEffect } from 'react';
import { useWishlist, useToggleWishlist, useAddToCart } from '@/lib/useCommerce';
import { useCurrencyStore } from '@/stores/currencyStore';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice, getProductMinPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Trash2, ShoppingBag, Heart } from 'lucide-react';
import { withQueryClient } from '@/lib/queryClient';
import type { Product } from '@/types';

function WishlistExplorerComponent() {
  const { data: wishlistData, isLoading } = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const addToCart = useAddToCart();
  const currency = useCurrencyStore((s) => s.currency);
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  const products: Product[] = wishlistData?.products || [];

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground animate-pulse">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-1 mb-8">
        <h1 className="font-editorial text-3xl font-bold tracking-tight">Saved Items</h1>
        <p className="text-xs text-muted-foreground">({products.length} pieces in your wishlist)</p>
      </div>

      {products.length === 0 ? (
        <div className="bg-card p-16 rounded-xl border border-border text-center space-y-4 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
          <div className="space-y-1">
            <h3 className="font-editorial text-xl font-bold">Your wishlist is empty</h3>
            <p className="text-xs text-muted-foreground">
              Save your favorite minimalist pieces to revisit and purchase later.
            </p>
          </div>
          <Button onClick={() => (window.location.href = '/catalog')} variant="default" size="sm">
            Discover Collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const minPrice = getProductMinPrice(product, currency);
            const firstVariant = product.variants?.[0];
            const images = Array.isArray(product.images)
              ? product.images.map((img) => (typeof img === 'string' ? img : img?.url || ''))
              : [];
            const imgUrl = images[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={product.id}
                className="bg-card rounded-lg overflow-hidden border border-border flex flex-col justify-between group shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={() => toggleWishlist.mutate(product.id)}
                    className="absolute top-2.5 right-2.5 p-2 bg-background/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-background transition-colors shadow-sm"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <a href={`/product/${product.slug}`}>
                      <h3 className="font-semibold text-sm text-foreground line-clamp-1 hover:underline">
                        {product.name}
                      </h3>
                    </a>
                    <p className="font-editorial text-base font-bold text-foreground mt-1">
                      {formatPrice(minPrice, currency)}
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      if (firstVariant) {
                        addToCart.mutate({ variantId: firstVariant.id, quantity: 1 });
                      } else {
                        window.location.href = `/product/${product.slug}`;
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const WishlistExplorer = withQueryClient(WishlistExplorerComponent);
