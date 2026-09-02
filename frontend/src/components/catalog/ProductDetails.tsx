import React, { useState } from 'react';
import { Heart, ShoppingBag, Truck, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCurrencyStore } from '@/stores/currencyStore';
import { useAddToCart, useToggleWishlist, useWishlist } from '@/lib/useCommerce';
import { formatPrice, getVariantPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { Product, Variant } from '@/types';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const currency = useCurrencyStore((s) => s.currency);
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const { data: wishlistData } = useWishlist();

  const variants = product.variants || [];
  const [selectedVariant, setSelectedVariant] = useState<Variant>(variants[0] || {} as Variant);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'care'>('details');

  const images = Array.isArray(product.images)
    ? product.images.map((img) => (typeof img === 'string' ? img : img?.url || ''))
    : [typeof product.images === 'string' ? product.images : ''];

  const activePrice = selectedVariant ? getVariantPrice(selectedVariant, currency) : 0;
  const stock = selectedVariant?.inventory?.quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const isWishlisted = wishlistData?.products?.some((p: any) => p.id === product.id) || false;

  const availableSizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
  const availableColors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean)));

  const handleColorChange = (color: string) => {
    const match = variants.find((v) => v.color === color && (selectedVariant?.size ? v.size === selectedVariant.size : true))
      || variants.find((v) => v.color === color)
      || variants[0];
    if (match) setSelectedVariant(match);
  };

  const handleSizeChange = (size: string) => {
    const match = variants.find((v) => v.size === size && (selectedVariant?.color ? v.color === selectedVariant.color : true))
      || variants.find((v) => v.size === size)
      || variants[0];
    if (match) setSelectedVariant(match);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;
    addToCart.mutate({ variantId: selectedVariant.id, quantity });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground flex items-center space-x-2 mb-8">
        <a href="/" className="hover:text-foreground">Home</a>
        <span>/</span>
        <a href="/catalog" className="hover:text-foreground">Catalog</a>
        {product.category && (
          <>
            <span>/</span>
            <a href={`/category/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </a>
          </>
        )}
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[600px] flex-shrink-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-18 h-24 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 bg-muted ${
                    selectedImageIndex === idx ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Photo */}
          <div className="flex-1 aspect-[4/5] bg-muted rounded-xl overflow-hidden shadow-xs border border-border">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Right: Product Info & Actions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {product.category && (
              <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                {product.category.name}
              </span>
            )}
            <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="font-editorial text-2xl sm:text-3xl font-bold text-foreground">
                {formatPrice(activePrice, currency)}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                ({currency})
              </span>
            </div>

            {/* Description snippet */}
            <p className="text-sm text-foreground/80 leading-relaxed pt-2">
              {product.description}
            </p>

            <hr className="border-border my-4" />

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">Color: {selectedVariant?.color}</span>
                </div>
                <div className="flex items-center gap-2">
                  {availableColors.map((color) => {
                    const variantForColor = variants.find((v) => v.color === color);
                    const hex = variantForColor?.colorHex || '#333';
                    const isSelected = selectedVariant?.color === color;
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color as string)}
                        className={`w-7 h-7 rounded-full border-2 transition-all p-0.5 ${
                          isSelected ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-border opacity-80 hover:opacity-100'
                        }`}
                        title={color as string}
                      >
                        <span className="w-full h-full rounded-full block" style={{ backgroundColor: hex }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-foreground">Size: {selectedVariant?.size}</span>
                  <span className="text-muted-foreground underline cursor-pointer">Size Guide</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {availableSizes.map((size) => {
                    const isSelected = selectedVariant?.size === size;
                    const variantForSize = variants.find((v) => v.size === size && (selectedVariant?.color ? v.color === selectedVariant.color : true));
                    const isSizeStocked = (variantForSize?.inventory?.quantity ?? 0) > 0;
                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size as string)}
                        disabled={!isSizeStocked}
                        className={`h-11 rounded-md text-xs font-semibold uppercase tracking-wider border transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : isSizeStocked
                            ? 'bg-background hover:border-foreground/50 text-foreground'
                            : 'bg-muted text-muted-foreground line-through opacity-40 cursor-not-allowed'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock Level Indicator */}
            <div className="pt-2">
              {isOutOfStock ? (
                <div className="flex items-center text-xs font-medium text-destructive gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Out of stock for this variant</span>
                </div>
              ) : isLowStock ? (
                <div className="flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md gap-1.5 border border-amber-200">
                  <AlertCircle className="w-4 h-4" />
                  <span>Low stock: Only {stock} items left in stock</span>
                </div>
              ) : (
                <div className="flex items-center text-xs font-medium text-emerald-700 gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>In Stock ({stock} units available) • SKU: {selectedVariant?.sku}</span>
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="flex gap-3 pt-4">
              <div className="flex items-center border border-border rounded-md bg-background h-12 px-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-semibold select-none">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                  disabled={quantity >= stock}
                  className="px-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addToCart.isPending}
                isLoading={addToCart.isPending}
                size="lg"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </Button>

              <button
                onClick={() => toggleWishlist.mutate(product.id)}
                className={`w-12 h-12 rounded-md border flex items-center justify-center transition-colors ${
                  isWishlisted
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-border bg-background hover:bg-muted text-foreground'
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 py-4 border-y border-border text-center text-[11px] text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-foreground" />
              <span>Free Delivery &gt;$100</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw className="w-4 h-4 text-foreground" />
              <span>30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-foreground" />
              <span>Stripe Secure</span>
            </div>
          </div>

          {/* Tabs / Accordions */}
          <div className="space-y-3 pt-2">
            <div className="flex border-b border-border text-xs font-semibold">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  activeTab === 'details' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
                }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  activeTab === 'shipping' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
                }`}
              >
                Shipping & Returns
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  activeTab === 'care' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'
                }`}
              >
                Fabric & Care
              </button>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed pt-1">
              {activeTab === 'details' && (
                <div className="space-y-2">
                  <p>{product.description}</p>
                  {product.features && (
                    <ul className="list-disc pl-4 space-y-1">
                      {product.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className="space-y-1">
                  <p>• Complimentary standard shipping on all orders exceeding $100.</p>
                  <p>• Express international delivery within 2-4 business days.</p>
                  <p>• Hassle-free 30-day return policy for unused items in original packaging.</p>
                </div>
              )}
              {activeTab === 'care' && (
                <div className="space-y-1">
                  <p>• Crafted from natural long-staple fibers with certified ethical provenance.</p>
                  <p>• Machine wash cold on gentle cycle or hand wash with mild detergent.</p>
                  <p>• Lay flat to dry away from direct heat; warm iron if necessary.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
