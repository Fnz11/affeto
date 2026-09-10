import React, { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { getProductMinPrice } from '@/lib/utils';
import { useCurrencyStore } from '@/stores/currencyStore';
import type { Product, Category } from '@/types';

interface CatalogExplorerProps {
  initialProducts: Product[];
  categories: Category[];
  initialCategory?: string;
  initialSearch?: string;
}

export function CatalogExplorer({
  initialProducts,
  categories,
  initialCategory = '',
  initialSearch = '',
}: CatalogExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>('featured');
  const currency = useCurrencyStore((s) => s.currency);

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by Category
    if (selectedCategory) {
      result = result.filter(
        (p) => p.category?.slug === selectedCategory || (p.category as any) === selectedCategory
      );
    }

    // Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'price_asc') {
      result.sort((a, b) => getProductMinPrice(a, currency) - getProductMinPrice(b, currency));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => getProductMinPrice(b, currency) - getProductMinPrice(a, currency));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    } else if (sortBy === 'featured') {
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [initialProducts, selectedCategory, searchQuery, sortBy, currency]);

  return (
    <div className="space-y-6">
      <ProductFilters
        categories={categories}
        activeCategory={selectedCategory}
        sortBy={sortBy}
        searchQuery={searchQuery}
        onSelectCategory={setSelectedCategory}
        onSelectSort={setSortBy}
        onSearchChange={setSearchQuery}
      />

      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <p className="font-editorial text-2xl font-semibold">No pieces found</p>
          <p className="text-sm text-muted-foreground">Try clearing filters or searching for something else.</p>
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-primary underline underline-offset-4"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
