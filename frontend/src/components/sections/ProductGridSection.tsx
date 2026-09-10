import React, { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product, Category } from "@/types";

interface ProductGridSectionProps {
  products: Product[];
  categories?: Category[];
}

export function ProductGridSection({ products, categories = [] }: ProductGridSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  const filterTabs = useMemo(() => {
    const list = [{ label: "All", slug: "all" }];
    if (categories && categories.length > 0) {
      categories.forEach((cat) => {
        list.push({ label: cat.name, slug: cat.slug });
      });
    } else {
      list.push(
        { label: "Tops", slug: "tops" },
        { label: "Bottoms", slug: "bottoms" },
        { label: "Outerwear", slug: "outerwear" },
        { label: "Accessories", slug: "accessories" },
        { label: "Footwear", slug: "footwear" }
      );
    }
    return list;
  }, [categories]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => {
      const catSlug = p.category?.slug || (typeof p.category === "string" ? p.category : "");
      return catSlug === activeCategory;
    });
  }, [products, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug);
    setCurrentPage(1);
  };

  return (
    <section className="border-b border-border">
      {/* Section Header */}
      <div className="grid grid-cols-12 px-6 py-10 lg:py-14 gap-6 items-end">
        <div className="col-span-12 lg:col-span-7 flex flex-col items-start gap-4">
          <span className="bg-accent text-accent-foreground mono-label px-2 py-1">
            {products.length} OBJECTS / VOL. 01
          </span>
          <h2 className="editorial-headline text-[clamp(36px,6vw,80px)] max-w-[10ch]">
            New<br />Arrivals
          </h2>
        </div>
        <div className="col-span-12 lg:col-span-5 flex flex-col lg:items-end gap-3">
          <p className="text-sm text-muted-foreground max-w-sm lg:text-right">
            The first dispatch of Volume 01. Pieces release in small numbers and are not restocked.
          </p>
          <div className="flex items-center gap-3">
            <span className="mono-label text-muted-foreground">
              0{currentPage} / 0{totalPages}
            </span>
            <div className="flex">
              <button
                type="button"
                aria-label="Previous"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="border border-border w-11 h-11 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="border border-border border-l-0 w-11 h-11 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-t border-border px-6 py-3 flex items-center gap-4 overflow-x-auto select-none">
        <span className="mono-label text-muted-foreground shrink-0">Filter</span>
        {filterTabs.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            onClick={() => handleCategoryChange(tab.slug)}
            className={`micro-label whitespace-nowrap pb-0.5 border-b transition-colors ${
              activeCategory === tab.slug
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-border">
        {paginated.map((product) => (
          <div key={product.id} className="border-r border-b border-border">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Bottom Full Catalogue Bar */}
      <div className="px-6 py-6 flex items-center justify-between">
        <a href="/catalog" className="micro-label inline-flex items-center gap-2 group hover:text-accent transition-colors">
          <span>View the full catalogue</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
        <span className="mono-label text-muted-foreground">
          {filtered.length} objects in current view
        </span>
      </div>
    </section>
  );
}
