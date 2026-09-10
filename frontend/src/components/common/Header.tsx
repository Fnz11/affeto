import React, { useEffect, useState } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { CurrencySelector } from "./CurrencySelector";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const openDrawer = useCartStore((s) => s.openDrawer);
  const optimisticBadgeCount = useCartStore((s) => s.optimisticBadgeCount);
  const { user, jwt, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      {/* Desktop Header */}
      <div className="hidden lg:grid h-[68px] grid-cols-3 items-center px-6">
        {/* Left: Brand + Est */}
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="font-display text-[26px] font-normal tracking-tight leading-none text-foreground hover:opacity-80 transition-opacity"
            aria-label="Afetto home"
          >
            Afetto.
          </a>
          <span className="mono-label text-muted-foreground">EST. 2026 / PORTO</span>
        </div>

        {/* Center: Navigation */}
        <nav className="flex items-center justify-center gap-10">
          <a
            href="/catalog"
            className="micro-label transition-colors text-muted-foreground hover:text-foreground"
          >
            Shop
          </a>
          <a
            href="/category/outerwear"
            className="micro-label transition-colors text-muted-foreground hover:text-foreground"
          >
            Collections
          </a>
          <a
            href="/catalog"
            className="micro-label transition-colors text-muted-foreground hover:text-foreground"
          >
            Journal
          </a>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-6">
          {/* Search Trigger */}
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-foreground pb-0.5">
              <input
                type="text"
                placeholder="Search term…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none w-32 md:w-44 mono-label"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-muted-foreground hover:text-foreground ml-1"
                aria-label="Close search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 micro-label text-foreground/80 hover:text-foreground transition-colors"
              aria-label="Toggle search"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </button>
          )}

          {/* Account */}
          <a
            href={jwt ? "/account" : "/account/login"}
            className="flex items-center gap-2 micro-label text-foreground/80 hover:text-foreground transition-colors"
          >
            <User className="h-4 w-4" />
            <span>{jwt ? "Account" : "Sign In"}</span>
          </a>

          {/* Currency (hidden on small) */}
          <div className="hidden xl:block">
            <CurrencySelector />
          </div>

          {/* Basket Trigger */}
          <button
            type="button"
            onClick={openDrawer}
            className="flex items-center gap-2 micro-label text-foreground hover:text-accent transition-colors"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>
              Basket <span className="mono-label text-accent">({optimisticBadgeCount})</span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex lg:hidden h-14 items-center justify-between px-5">
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-foreground p-1"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <a href="/" className="font-display text-2xl font-normal tracking-tight">
          Afetto.
        </a>

        <button
          type="button"
          onClick={openDrawer}
          aria-label="Open cart"
          className="flex items-center gap-1 text-foreground"
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="mono-label text-accent">({optimisticBadgeCount})</span>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            <a
              href="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="micro-label py-2 border-b border-border/40 text-foreground"
            >
              Shop All
            </a>
            <a
              href="/category/outerwear"
              onClick={() => setMobileMenuOpen(false)}
              className="micro-label py-2 border-b border-border/40 text-foreground"
            >
              Collections
            </a>
            <a
              href="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="micro-label py-2 border-b border-border/40 text-foreground"
            >
              Journal
            </a>
            <a
              href={jwt ? "/account" : "/account/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="micro-label py-2 border-b border-border/40 text-foreground"
            >
              {jwt ? "My Account" : "Sign In / Register"}
            </a>
          </nav>
          <div className="pt-2">
            <CurrencySelector />
          </div>
        </div>
      )}
    </header>
  );
}
