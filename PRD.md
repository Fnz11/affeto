# PRD — Headless E-Commerce Platform
**Stack:** Strapi (CMS + commerce backend) · Astro (frontend/SSR) · React + TypeScript (islands) · Zustand (client state) · TanStack Query (server state) · shadcn/ui (components) · Stripe (payments) · Docker/VPS (hosting)

**Author:** Lead Engineering Review
**Status:** Draft v1
**Target:** Solo developer, MVP in 4–6 weeks

---

## 1. Summary

A performant, SEO-friendly e-commerce storefront for a single-currency-content, multi-currency-priced catalog of a few hundred SKUs with variants (size/color). Strapi is the single source of truth for products, inventory, orders, and customers. Astro renders content-heavy pages as static/SSR hybrid; React islands handle cart, checkout, and account interactions. Stripe handles payment processing only — order and inventory state always lives in Strapi.

## 2. Goals

- Ship a production-ready MVP in 4–6 weeks, solo-dev feasible.
- Fast storefront (Core Web Vitals green) via Astro's islands architecture — minimal JS shipped.
- Single source of truth in Strapi: no data sync problems between a "commerce engine" and a "CMS."
- Customer accounts with order history, saved addresses, and wishlists.
- Variant-level inventory (size/color) with per-SKU stock tracking.
- Multi-currency pricing, single-language content.
- Self-hosted on a VPS via Docker — no vendor lock-in to Vercel/Netlify/Strapi Cloud.

## 3. Non-Goals (explicitly out of scope for MVP)

- Multi-vendor/marketplace functionality.
- B2B quoting, bulk pricing tiers, net-terms invoicing.
- Subscriptions/recurring billing.
- Dedicated search engine (Algolia/Meilisearch) — basic Strapi filters only; revisit post-launch if catalog grows.
- Multi-language (i18n) content — currency-only localization.
- Loyalty/rewards, gift cards, coupon stacking (simple % or flat discount codes only, if time allows).

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        VPS (Docker)                       │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────┐ │
│  │   Postgres    │◄──│    Strapi     │   │  Astro (SSR)  │ │
│  │  (DB volume)  │   │  (headless    │◄──│  Node adapter │ │
│  └──────────────┘   │   CMS +        │   │  + React      │ │
│                      │   commerce     │   │  islands      │ │
│  ┌──────────────┐   │   services)    │   └───────┬───────┘ │
│  │  S3-compatible│◄──│                │           │         │
│  │  media (Minio │   └───────┬────────┘           │         │
│  │  or R2)       │           │                     │         │
│  └──────────────┘            │                     │         │
│                        ┌──────▼─────┐               │         │
│  ┌──────────────┐      │  Stripe    │◄──────────────┘         │
│  │ Caddy/Nginx   │      │  webhooks  │  (checkout session      │
│  │ reverse proxy │      └────────────┘   + client calls)       │
│  │ + TLS         │                                              │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────┘
```

**Key architectural decision:** Strapi is not "content-only." It owns Product, Variant, Inventory, Cart, Order, Customer, Address, and Wishlist content-types plus custom controllers/services for cart mutation, checkout session creation, and Stripe webhook handling. This avoids syncing state between Strapi and a separate commerce engine, which is the #1 source of bugs in Strapi+commerce projects at this scale.

---

## 5. Tech Stack — Role of Each Piece

| Layer | Tool | Responsibility |
|---|---|---|
| CMS/Backend | **Strapi v5** | Content types, REST/GraphQL API, custom cart/order/checkout controllers, Stripe webhook receiver, admin panel for catalog & order management |
| DB | **PostgreSQL** | Strapi's data store (not SQLite — need real concurrency/transactions for inventory decrement) |
| Media | **S3-compatible (MinIO self-hosted or Cloudflare R2)** | Product images, served via CDN-friendly URLs |
| Frontend framework | **Astro** | Routing, SSG for catalog/content pages, SSR (`output: 'server'` or hybrid) for price/stock-sensitive routes |
| Interactivity | **React 18 + TypeScript** | Islands: cart drawer, checkout form, account pages, product variant picker, wishlist toggle |
| Client state | **Zustand** | Ephemeral UI state: cart drawer open/closed, selected variant, optimistic cart item count, currency selector |
| Server state | **TanStack Query** | All data fetched from Strapi: product lists, cart contents (synced with Strapi cart), order history — caching, revalidation, optimistic updates on add-to-cart |
| UI components | **shadcn/ui** | Buttons, dialogs, forms, toasts, dropdowns — Tailwind-based, copy-in not npm-dependency, easy to theme |
| Payments | **Stripe** | Stripe Checkout (hosted) or Elements (embedded) for PCI-compliant payment collection; webhooks confirm payment → Strapi flips order status |
| Hosting | **Docker Compose on VPS** | Containers: strapi, postgres, astro-node, caddy (reverse proxy + auto TLS), minio (optional) |

**State boundary rule (important for a solo dev to keep clean):** Zustand never holds server-truth data (cart contents, prices, stock). It only holds UI/interaction state. TanStack Query owns anything that originates from Strapi and needs caching/revalidation. Cart is a hybrid: Zustand holds "is drawer open" and optimistic local item count; TanStack Query mutation writes the actual cart to Strapi and is the source of truth on reload.

---

## 6. Data Model (Strapi Content-Types)

- **Product** — name, slug, description (rich text), category (relation), base images, status (draft/published), SEO fields.
- **Variant** — relation to Product, size, color, SKU, price override (optional), weight (for shipping calc later).
- **Inventory** — relation to Variant (1:1), quantity on hand, low-stock threshold. Decremented transactionally on order confirmation, not on add-to-cart.
- **Category** — name, slug, parent (self-relation for basic nesting).
- **Price** — relation to Variant, currency code, amount (minor units). Supports multi-currency without duplicating products.
- **Cart** — relation to Customer (or session/guest token), line items (component: variant + qty + price snapshot).
- **Order** — relation to Customer, line items snapshot, status enum (pending/paid/fulfilled/cancelled/refunded), Stripe payment_intent id, shipping address, totals.
- **Customer** — extends Strapi's Users & Permissions plugin; relations to Address[], Wishlist[], Order[].
- **Address** — relation to Customer, standard shipping/billing fields, default flag.
- **Wishlist** — relation to Customer, relation to Product[].
- **DiscountCode** *(stretch)* — code, type (percent/flat), value, expiry, usage limit.

---

## 7. Key Flows

### 7.1 Browsing (SSG-first)
Astro builds product/category/content pages at build time from Strapi content. A Strapi webhook on publish/update triggers an incremental rebuild (or Astro server endpoint revalidation) so content changes go live without a full redeploy.

### 7.2 Add to Cart
React island → optimistic Zustand update (badge count) → TanStack Query mutation POSTs to Strapi cart endpoint → Strapi validates stock, snapshots price → response reconciles TanStack Query cache. Cart persists server-side keyed to session token (guest) or customer id (logged in); merged on login.

### 7.3 Checkout
1. Client requests checkout session from Strapi custom endpoint.
2. Strapi validates cart (stock still available, prices current), creates a pending Order, calls Stripe to create a Checkout Session (or PaymentIntent for embedded Elements) with the server-validated total — **never trust client-sent totals**.
3. Customer completes payment on Stripe.
4. Stripe webhook → Strapi endpoint verifies signature, marks Order `paid`, decrements Inventory transactionally, clears cart, triggers order-confirmation email.
5. Client polls or redirects to order-confirmation page reading order status from Strapi.

### 7.4 Account / Order History
Standard Strapi Users & Permissions JWT auth. Account pages (SSR, authenticated) list orders, addresses, wishlist — fetched via TanStack Query with the customer's JWT.

### 7.5 Multi-Currency
Currency selector (Zustand-held preference, persisted to localStorage/cookie) determines which `Price` record is fetched/displayed. Cart line items snapshot the chosen currency at add-time; checkout total is computed server-side in that currency, and the Stripe session is created in the matching currency.

---

## 8. Non-Functional Requirements

- **Performance:** LCP < 2.5s on product pages; ship <100KB JS on initial load for browsing pages (islands only hydrate on interaction where feasible, `client:visible`/`client:idle`).
- **Security:** All price/stock/total calculations server-side in Strapi. Stripe webhook signature verification mandatory. Rate-limit cart/checkout endpoints. HTTPS via Caddy auto-TLS.
- **Data integrity:** Inventory decrement wrapped in a DB transaction to prevent overselling under concurrent checkouts.
- **Backups:** Automated Postgres dump + media volume backup on a cron, shipped off-VPS (e.g., to R2/S3).
- **Observability:** Basic structured logging in Strapi custom controllers; Stripe dashboard for payment-level monitoring; uptime monitoring on the VPS.

---

## 9. Suggested 4–6 Week Roadmap (Solo Dev)

| Week | Focus |
|---|---|
| 1 | Strapi content-types (Product, Variant, Inventory, Price, Category), admin panel setup, Docker Compose skeleton (Postgres + Strapi), seed data |
| 2 | Astro project scaffold, design tokens/shadcn setup, static catalog/PDP pages pulling from Strapi, currency selector |
| 3 | Cart: Strapi cart endpoints + React island + Zustand/TanStack Query wiring, guest-to-account cart merge |
| 4 | Auth (Strapi Users & Permissions), account pages (orders, addresses, wishlist), checkout flow + Stripe integration (test mode) |
| 5 | Stripe webhooks, order confirmation, transactional inventory decrement, email notifications, edge cases (out-of-stock races, failed payments) |
| 6 | VPS deployment (Docker Compose + Caddy + TLS), backups, load/perf pass, QA, buffer |

---

## 10. Open Risks / Decisions to Revisit

- **Discount codes** are marked stretch — cut first if timeline slips.
- **Search** is basic filters only; if catalog grows past ~500 SKUs or facets get complex, Meilisearch (self-hostable, fits the Docker VPS model) is the natural next step.
- **Email delivery** (order confirmations) needs a transactional email provider (Resend/Postmark/SES) — not yet selected, needs a decision before Week 5.
- **Currency conversion source** — are Prices manually entered per currency, or converted from a base currency via a live FX rate? Manual entry is simpler and safer for MVP (avoids float-rate checkout mismatches); recommend manual per-currency pricing for v1.
- **Shipping cost calculation** — not yet scoped. Flat rate vs. carrier API. Needs a decision.
