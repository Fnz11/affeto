import React, { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCurrencyStore } from '@/stores/currencyStore';
import { useAddToCart, useToggleWishlist, useWishlist } from '@/lib/useCommerce';
import { formatPrice, getVariantPrice } from '@/lib/utils';
import type { Product, Variant } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const currency = useCurrencyStore((s) => s.currency);
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlistData } = useWishlist();

  const variants = product.variants || [];
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(variants[0]);
  const [isHovered, setIsHovered] = useState(false);

  const images = Array.isArray(product.images)
    ? product.images.map((img) => (typeof img === 'string' ? img : img?.url || ''))
    : [typeof product.images === 'string' ? product.images : ''];

  const primaryImage = images[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = images[1] || primaryImage;

  const activePrice = selectedVariant ? getVariantPrice(selectedVariant, currency) : 0;
  const isOutOfStock = (selectedVariant?.inventory?.quantity ?? 10) <= 0;

  const isWishlisted = wishlistData?.products?.some((p: any) => p.id === product.id) || false;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedVariant || isOutOfStock) return;
    addToCart.mutate({ variantId: selectedVariant.id, quantity: 1 });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist.mutate(product.id);
  };

  return (
    <div
      className="group relative flex flex-col bg-card rounded-lg overflow-hidden border border-border hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <a href={`/product/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-muted block">
        <img
          src={isHovered && secondaryImage ? secondaryImage : primaryImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              New
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-background/80 backdrop-blur-sm text-foreground/80 hover:text-red-600 hover:bg-background transition-all shadow-sm z-10"
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Quick Add overlay button */}
        <div className="absolute inset-x-3 bottom-3 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || addToCart.isPending}
            className="w-full bg-background/95 hover:bg-background text-foreground text-xs font-semibold py-2.5 px-4 rounded-md shadow-lg backdrop-blur-sm flex items-center justify-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? 'Sold Out' : 'Quick Add'}</span>
          </button>
        </div>
      </a>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.category && (
            <span className="text-[11px] font-medium tracking-wider uppercase text-muted-foreground block mb-1">
              {product.category.name}
            </span>
          )}
          <a href={`/product/${product.slug}`}>
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </a>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40">
          {/* Multi-currency dynamic price */}
          <p className="font-editorial text-base font-bold text-foreground">
            {formatPrice(activePrice, currency)}
          </p>

          {/* Color swatches preview */}
          {variants.length > 1 && (
            <div className="flex items-center gap-1">
              {Array.from(new Set(variants.map((v) => v.colorHex || '#ddd'))).slice(0, 4).map((hex, i) => (
                <span
                  key={i}
                  className="w-3 h-3 rounded-full border border-border shadow-xs"
                  style={{ backgroundColor: hex }}
                  title={variants.find((v) => v.colorHex === hex)?.color}
                />
              ))}
              {variants.length > 4 && (
                <span className="text-[10px] text-muted-foreground font-medium">+{variants.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
