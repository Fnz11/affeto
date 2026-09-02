import React, { useEffect, useState } from 'react';
import { ShoppingBag, Heart, User as UserIcon, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useWishlist } from '@/lib/useCommerce';
import { CurrencySelector } from './CurrencySelector';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openDrawer = useCartStore((s) => s.openDrawer);
  const optimisticBadgeCount = useCartStore((s) => s.optimisticBadgeCount);
  const { user, jwt, initAuth } = useAuthStore();
  const { data: wishlistData } = useWishlist();

  const wishlistCount = wishlistData?.products?.length || 0;

  useEffect(() => {
    initAuth();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navLinks = [
    { label: 'Shop All', href: '/catalog' },
    { label: 'Tops', href: '/category/tops' },
    { label: 'Bottoms', href: '/category/bottoms' },
    { label: 'Outerwear', href: '/category/outerwear' },
    { label: 'Footwear', href: '/category/footwear' },
    { label: 'Accessories', href: '/category/accessories' },
  ];

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${
      isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border' : 'bg-background/80 backdrop-blur-sm'
    }`}>
      {/* Top Banner */}
      <div className="bg-primary text-primary-foreground py-1.5 px-4 text-center text-xs tracking-wider uppercase font-medium flex justify-between items-center max-w-7xl mx-auto">
        <span className="hidden sm:inline">Complimentary global delivery on orders over $100</span>
        <span className="mx-auto sm:mx-0">Use code <strong className="underline tracking-widest font-semibold">WELCOME10</strong> for 10% off</span>
        <div className="hidden sm:block">
          <CurrencySelector />
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground hover:text-muted-foreground focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Nav links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium tracking-wide">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-foreground/80 hover:text-foreground transition-colors hover:underline underline-offset-8"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Brand Logo */}
          <div className="flex-shrink-0 text-center">
            <a href="/" className="inline-block">
              <span className="font-editorial text-2xl sm:text-3xl tracking-widest font-bold text-foreground uppercase">
                AFFETO
              </span>
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Mobile currency selector */}
            <div className="sm:hidden">
              <CurrencySelector />
            </div>

            {/* Search Trigger */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-36 sm:w-56 text-xs px-2.5 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="ml-1 text-xs text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-foreground/80 hover:text-foreground transition-colors"
                  aria-label="Search products"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Wishlist */}
            <a
              href="/account/wishlist"
              className="relative p-2 text-foreground/80 hover:text-foreground transition-colors hidden sm:inline-flex"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </a>

            {/* Account / User */}
            <a
              href={jwt ? '/account' : '/account/login'}
              className="p-2 text-foreground/80 hover:text-foreground transition-colors"
              aria-label="Account"
            >
              <UserIcon className="w-5 h-5" />
            </a>

            {/* Cart Bag with live badge counter */}
            <button
              onClick={openDrawer}
              className="relative p-2 text-foreground/80 hover:text-foreground transition-colors focus:outline-none group"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              {optimisticBadgeCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {optimisticBadgeCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-1.5 text-foreground hover:text-muted-foreground border-b border-border/50"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/account/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium py-1.5 text-foreground hover:text-muted-foreground flex items-center justify-between border-b border-border/50"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{wishlistCount}</span>}
            </a>
            <a
              href={jwt ? '/account' : '/account/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium py-1.5 text-foreground hover:text-muted-foreground"
            >
              {jwt ? 'My Account' : 'Sign In / Register'}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
