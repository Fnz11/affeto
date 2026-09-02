# Affeto — Headless E-Commerce Platform

**Stack:** Strapi v5 (Commerce Engine + CMS) · Astro v5 (SSR/Islands) · React 18 + TypeScript · Zustand (Client State) · TanStack Query (Server State) · Tailwind CSS + shadcn/ui · Stripe · Docker Compose + Caddy

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VPS (Docker)                         │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐ │
│  │   Postgres   │◄──│    Strapi    │   │   Astro (SSR)    │ │
│  │  (DB volume) │   │  (headless   │◄──│  Node adapter    │ │
│  └──────────────┘   │   commerce   │   │  + React Islands │ │
│                     │   services)  │   └────────┬─────────┘ │
│                     └───────┬──────┘            │           │
│                             │                   │           │
│                       ┌─────▼──────┐            │           │
│  ┌──────────────┐     │   Stripe   │◄───────────┘           │
│  │ Caddy Proxy  │     │  webhooks  │  (checkout session     │
│  │ + Auto TLS   │     └────────────┘   + client calls)      │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

### State Boundary Rule
- **Zustand (Client State):** Ephemeral UI state only — cart drawer toggle, currency selector preference (`USD`, `EUR`, `GBP`), optimistic badge count.
- **TanStack Query (Server State):** Server-truth data from Strapi — cart line items, pricing, inventory stock verification, order history, saved addresses, and wishlist.

---

## 2. Content Types (Strapi v5)

- **`Product`**: `name`, `slug`, `description`, `details`, `features`, `images`, `isFeatured`, `isNewArrival`, `category`, `variants`, `seoTitle`, `seoDescription`.
- **`Variant`**: `title`, `sku`, `size`, `color`, `colorHex`, `weight`, `image`, `product`, `inventory`, `prices`.
- **`Inventory`**: `variant`, `quantity` (real-time stock on hand), `lowStockThreshold`. Decremented transactionally upon payment.
- **`Price`**: `variant`, `currency` (`USD`, `EUR`, `GBP`), `amount` (minor units / cents), `compareAtAmount`.
- **`Cart`**: `sessionId` (guest) or `user` (customer), `currency`, `items` (repeatable line items), `lastActiveAt`.
- **`Order`**: `orderNumber`, `user`, `customerEmail`, `items`, `status` (`pending`, `paid`, `fulfilled`, `cancelled`, `refunded`), `currency`, `subtotal`, `shippingAmount`, `discountAmount`, `totalAmount`, `stripeSessionId`, `stripePaymentIntentId`, `shippingAddress`.
- **`Address`**: `name`, `street`, `city`, `state`, `postalCode`, `country`, `phone`, `isDefault`, `user`.
- **`Wishlist`**: `user`, `products` (many-to-many).
- **`DiscountCode`**: `code`, `discountType` (`percent`, `flat`), `value`, `minOrderAmount`, `maxUses`, `currentUses`, `isActive`.

---

## 3. Custom Commerce APIs

- `GET /api/cart` — Retrieve cart by `x-session-id` header or auth JWT token.
- `POST /api/cart/items` — Add variant to bag (validates real-time inventory stock & prices).
- `PUT /api/cart/items/:itemId` — Modify quantity (enforces inventory limits).
- `DELETE /api/cart/items/:itemId` — Remove line item.
- `POST /api/cart/merge` — Merge guest cart into user account upon sign-in.
- `POST /api/discount-codes/validate` — Validate promo code (`WELCOME10`, `AFFETO20`, `FLAT15`).
- `POST /api/checkout/session` — Re-validates cart server-side and creates pending order + Stripe checkout session.
- `POST /api/checkout/confirm-mock` — Development simulation to confirm order and execute transactional inventory decrement.
- `POST /api/webhooks/stripe` — Stripe webhook receiver: verifies signature, marks order `paid`, runs transactional inventory decrement in DB transaction, and clears cart.
- `GET /api/wishlist` & `POST /api/wishlist/toggle` — User wishlist management.
- `GET /api/orders` & `GET /api/orders/:orderNumber` — Order tracking and history.

---

## 4. Getting Started (Development)

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### Quick Start
```bash
# 1. Install all monorepo dependencies
pnpm install

# 2. Run both backend & frontend concurrently
pnpm dev

# Or run individually:
pnpm dev:backend   # Strapi API at http://localhost:1337
pnpm dev:frontend  # Astro Storefront at http://localhost:4321
```

On first startup, Strapi automatically runs database bootstrap to grant public/auth permissions and seeds the full sample catalog (8 products, multiple variants, multi-currency prices, inventory stock counts, categories, and demo discount codes).

---

## 5. Production Deployment (Docker Compose)

```bash
# 1. Copy environment variables
cp .env.example .env

# 2. Start full stack (PostgreSQL, Strapi v5, Astro SSR, Caddy)
docker compose up -d --build
```
