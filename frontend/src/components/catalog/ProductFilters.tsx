import React from 'react';
import type { Category } from '@/types';

interface ProductFiltersProps {
  categories: Category[];
  activeCategory?: string;
  sortBy: string;
  onSelectCategory: (slug: string) => void;
  onSelectSort: (sort: string) => void;
}

export function ProductFilters({
  categories,
  activeCategory,
  sortBy,
  onSelectCategory,
  onSelectSort,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-6 border-b border-border">
      {/* Categories Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onSelectCategory('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-colors ${
            !activeCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          All Pieces
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onSelectCategory(cat.slug)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-colors ${
              activeCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort By Dropdown */}
      <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
        <span className="text-muted-foreground font-medium">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => onSelectSort(e.target.value)}
          className="bg-card border border-border text-foreground px-2.5 py-1.5 rounded-md font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
