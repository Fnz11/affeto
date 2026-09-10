import React from 'react';
import { Search, X } from 'lucide-react';
import type { Category } from '@/types';

interface ProductFiltersProps {
  categories: Category[];
  activeCategory?: string;
  sortBy: string;
  searchQuery?: string;
  onSelectCategory: (slug: string) => void;
  onSelectSort: (sort: string) => void;
  onSearchChange?: (query: string) => void;
}

export function ProductFilters({
  categories,
  activeCategory,
  sortBy,
  searchQuery = '',
  onSelectCategory,
  onSelectSort,
  onSearchChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-4 border-b border-border">
      {/* Categories Tabs */}
      <div className="flex flex-wrap items-center gap-4">
        <span className="mono-label text-muted-foreground shrink-0">Filter</span>
        <button
          onClick={() => onSelectCategory('')}
          className={`micro-label whitespace-nowrap pb-0.5 border-b transition-colors ${
            !activeCategory
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onSelectCategory(cat.slug)}
            className={`micro-label whitespace-nowrap pb-0.5 border-b transition-colors ${
              activeCategory === cat.slug
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Controls: Search + Sort By Dropdown */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        {onSearchChange && (
          <div className="relative flex items-center border-b border-border focus-within:border-foreground transition-colors pb-0.5">
            <Search className="w-3.5 h-3.5 text-muted-foreground mr-1.5 shrink-0" />
            <input
              type="text"
              placeholder="Search pieces…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none w-28 sm:w-36 mono-label text-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-muted-foreground hover:text-foreground ml-1"
                aria-label="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="mono-label text-muted-foreground">Sort</span>
          <select
            value={sortBy}
            onChange={(e) => onSelectSort(e.target.value)}
            className="bg-transparent border border-border text-foreground px-2.5 py-1.5 micro-label focus:outline-none focus:border-foreground cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
