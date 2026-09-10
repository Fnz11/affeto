import React, { useState } from "react";
import { Heart, Plus } from "lucide-react";
import { useCurrencyStore } from "@/stores/currencyStore";
import { useAddToCart, useToggleWishlist, useWishlist } from "@/lib/useCommerce";
import { formatPrice, getVariantPrice } from "@/lib/utils";
import { withQueryClient } from "@/lib/queryClient";
import type { Product, Variant } from "@/types";

interface ProductCardProps {
  product: Product;
}

function ProductCardComponent({ product }: ProductCardProps) {
  const currency = useCurrencyStore((s) => s.currency);
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlistData } = useWishlist();

  const variants = product.variants || [];
  const [selectedVariant] = useState<Variant | undefined>(variants[0]);
  const [isHovered, setIsHovered] = useState(false);

  const images = Array.isArray(product.images)
    ? product.images.map((img) => (typeof img === "string" ? img : img?.url || ""))
    : [typeof product.images === "string" ? product.images : ""];

  const primaryImage =
    images[0] ||
    "https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100013684/product_hoodie_black_bc00dc45.png";
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

  // Generate clean SKU or sequence code e.g. FM-001
  const sku = selectedVariant?.sku || `FM-00${product.id}`;
  const season = product.isNewArrival ? "S/S 26" : "PERMANENT";
  const origin = (product as any).origin || "Made in Portugal";

  return (
    <div
      className="group flex flex-col bg-card border border-border hover:border-foreground transition-colors duration-300 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <a href={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-card block">
        <img
          src={isHovered && secondaryImage ? secondaryImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80") {
              target.src = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80";
            }
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-0 left-0 flex flex-col">
          {product.isNewArrival && (
            <span className="bg-foreground text-background mono-label px-2.5 py-1.5">
              NEW
            </span>
          )}
          {!product.isNewArrival && product.isFeatured && (
            <span className="bg-accent text-accent-foreground mono-label px-2.5 py-1.5">
              FEATURED
            </span>
          )}
        </div>

        {/* Save/Heart Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label="Save"
          className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center border bg-background/90 transition-colors border-border text-muted-foreground hover:text-foreground hover:border-foreground z-10"
        >
          <Heart
            className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500 border-red-500" : ""}`}
          />
        </button>

        {/* Slide-up Quick Add Button */}
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isOutOfStock || addToCart.isPending}
          className="absolute inset-x-0 bottom-0 bg-foreground text-background py-3 micro-label flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 disabled:opacity-60"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{addToCart.isPending ? "Adding…" : isOutOfStock ? "Sold Out" : "Quick Add"}</span>
        </button>
      </a>

      {/* Details Box */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center justify-between mono-label text-muted-foreground mb-1.5">
          <span>{sku}</span>
          <span>{season}</span>
        </div>
        <div className="flex items-baseline">
          <a
            href={`/product/${product.slug}`}
            className="text-sm font-medium text-foreground truncate hover:text-accent transition-colors"
          >
            {product.name}
          </a>
          <span className="dotted-leader" aria-hidden="true" />
          <span className="text-sm tabular-nums text-foreground font-mono">
            {formatPrice(activePrice, currency)}
          </span>
        </div>
        <p className="mono-label text-muted-foreground mt-1.5 truncate">{origin}</p>
      </div>
    </div>
  );
}

export const ProductCard = withQueryClient(ProductCardComponent);
