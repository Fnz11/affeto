# User Flows & Testing Guide — Affeto

**Stack:** Strapi :1337 | Astro :4321 | Mock Stripe (no real payment required for local testing)

---

## Prerequisites — Start Everything

```bash
# From repo root
docker compose up -d

# Wait ~30s for Postgres + Strapi to boot, then verify:
curl http://localhost:1337/api/products | head -c 200
# Should return JSON with products (seeded automatically on first boot)

# Astro dev (optional — faster than Docker for frontend iteration)
cd frontend && pnpm dev
# Available at http://localhost:4321
```

**Stripe CLI (needed for real webhook testing only):**

```bash
stripe listen --forward-to http://localhost:1337/api/webhooks/stripe
# Copy the whsec_... secret → set STRIPE_WEBHOOK_SECRET in backend/.env
```

**Test Stripe card:** `4242 4242 4242 4242` | any future expiry | any CVC

---

## Feature 1 — Catalog Browsing

### User Flow

1. Visit `http://localhost:4321`
2. See homepage: hero, featured products, collections teaser
3. Click **Shop All** or nav → `/catalog`
4. Browse all products; use category/sort filters
5. Click a category in nav or marquee → `/category/tops`
6. Click any product card → `/product/minimalist-linen-shirt`

### How to Test

| Step               | What to verify                                           |
| ------------------ | -------------------------------------------------------- |
| Homepage loads     | Hero renders, featured products grid visible             |
| `/catalog`       | All 8 seeded products appear                             |
| Category filter    | `/category/tops` shows only Tops products              |
| Product card click | Navigates to PDP                                         |
| PDP image gallery  | Thumbnails clickable, main image updates                 |
| PDP variant picker | Colors/sizes selectable; price updates per currency      |
| Stock indicator    | Shows "In Stock" / "Low Stock" / "Out of Stock"          |
| Related products   | Bottom of PDP shows up to 4 other products               |
| Currency selector  | Switch USD/EUR/GBP in header → prices update everywhere |

**API verification (DevTools > Network):**

```
GET /api/products?populate[0]=category&populate[1]=variants...  → 200, data array
GET /api/products?filters[slug][$eq]=minimalist-linen-shirt...  → 200, single product
```

---

## Feature 2 — Add to Cart (Guest)

### User Flow

1. On any PDP, select color and size
2. Choose quantity (default 1)
3. Click **Add to Cart**
4. Cart drawer slides open from right
5. Badge on cart icon shows item count
6. Can adjust quantity in drawer or remove item

### How to Test

| Step                   | What to verify                                                   |
| ---------------------- | ---------------------------------------------------------------- |
| Add first item         | Cart drawer opens; item appears with image/name/price            |
| Cart badge             | Header badge increments immediately (optimistic)                 |
| Add same variant again | Quantity combines (not duplicate row)                            |
| Add different variant  | Appears as separate row                                          |
| Exceed stock limit     | Error: "Stock limit reached"                                     |
| Remove item            | Item disappears, total recalculates                              |
| Refresh page           | Cart persists (server-side, keyed to session ID in localStorage) |

**Direct API test (guest, no auth):**

```bash
# Add item
curl -X POST http://localhost:1337/api/cart/items \
  -H "Content-Type: application/json" \
  -H "x-session-id: test-session-123" \
  -d '{"variantId": 1, "quantity": 1, "currency": "USD"}'

# View cart
curl http://localhost:1337/api/cart \
  -H "x-session-id: test-session-123"
```

---

## Feature 3 — Multi-Currency

### User Flow

1. Header → currency selector (USD / EUR / GBP)
2. Select EUR
3. All product prices switch to EUR values
4. Add item to cart → cart line shows EUR price
5. Checkout total is in EUR

### How to Test

| Step              | What to verify                                |
| ----------------- | --------------------------------------------- |
| Switch to EUR     | PDP price changes (e.g. $89 → €82)          |
| Switch to GBP     | Different values from Price table             |
| Cart line price   | Reflects selected currency at time of add     |
| Currency persists | `localStorage affeto_currency` + cookie set |
| Checkout total    | Shows selected currency                       |

> **Note:** Mixed-currency carts are not fully handled — stick to one currency per session.

---

## Feature 4 — User Registration & Login

### User Flow

1. Click account icon → `/account/login`
2. Click "Create one now" → `/account/register`
3. Fill: username, email, password (min 6 chars)
4. Submit → auto-login, redirect to `/account`

### How to Test

| Step           | What to verify                                        |
| -------------- | ----------------------------------------------------- |
| Register       | Form submits, user created, redirected to`/account` |
| Login          | JWT stored in`localStorage` (`affeto_jwt`)        |
| Wrong password | Error message displayed inline                        |
| Account page   | Shows "Welcome, [username]"                           |

**Via Strapi API directly:**

```bash
# Register
curl -X POST http://localhost:1337/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"Test1234"}'
# → copy jwt from response
```

---

## Feature 5 — Guest-to-User Cart Merge

### User Flow

1. Browse as guest, add 2 items to cart
2. Go to `/account/login` and sign in
3. Cart merge happens automatically on login
4. Navigate to `/account` — cart still has those 2 items
5. Badge count reflects merged cart

### How to Test

| Step               | What to verify                                           |
| ------------------ | -------------------------------------------------------- |
| Guest cart exists  | `GET /api/cart` with session ID header returns items   |
| Login              | `POST /api/cart/merge` called with `guestSessionId`  |
| Post-login cart    | Items from guest + existing user items combined          |
| Guest cart deleted | `GET /api/cart` with old session ID returns empty cart |

**API test:**

```bash
export JWT="your_jwt_here"
export SESSION="test-session-123"

curl -X POST http://localhost:1337/api/cart/merge \
  -H "Authorization: Bearer $JWT" \
  -H "x-session-id: $SESSION" \
  -H "Content-Type: application/json" \
  -d '{"guestSessionId": "'$SESSION'"}'
```

---

## Feature 6 — Checkout (Mock Mode)

> ⚠️ **Current state:** Mock mode is default (no real Stripe key set). No real payment processed. Use this to test the full order flow end-to-end.

### User Flow

1. Add items to cart → go to `/checkout`
2. Fill in contact email
3. Fill in shipping address
4. (Optional) Apply discount code: `WELCOME10`, `AFFETO20`, or `FLAT15`
5. Review order summary on the right
6. Click **Pay $XX.XX**
7. Mock mode → redirected to `/checkout/success?orderNumber=AFF-...&mock=true`
8. Success page confirms order, shows items, address, totals

### How to Test

| Step                  | What to verify                                                     |
| --------------------- | ------------------------------------------------------------------ |
| Empty cart            | Navigate to`/checkout` with empty cart → error shown            |
| Form validation       | Submit without email → error; without address fields → error     |
| `WELCOME10`         | 10% off subtotal; shown in summary                                 |
| `AFFETO20`          | 20% off (only if subtotal ≥ $100)                                 |
| `FLAT15`            | $15 off (only if subtotal ≥ $50)                                  |
| Invalid code          | Error: "Invalid or expired discount code"                          |
| Shipping free         | Order ≥ $100 → FREE shipping                                     |
| Shipping $10          | Order < $100 → $10 shipping                                       |
| Order created         | Strapi admin`http://localhost:1337/admin` → Orders → new entry |
| Inventory decremented | Strapi admin → Inventories → quantities reduced                  |
| Cart cleared          | After success, cart is empty on next visit (logged-in users only)  |

**Direct API test:**

```bash
curl -X POST http://localhost:1337/api/checkout/session \
  -H "Content-Type: application/json" \
  -H "x-session-id: test-session-123" \
  -d '{
    "customerEmail": "test@example.com",
    "currency": "USD",
    "shippingAddress": {
      "name": "Test User",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "United States"
    }
  }'
# Returns: { mode: "mock", checkoutUrl: "...", orderNumber: "AFF-..." }
```

---

## Feature 7 — Checkout (Real Stripe)

### Setup

```bash
# 1. Get Stripe test keys from https://dashboard.stripe.com/test/apikeys
# 2. Add to backend/.env:
STRIPE_SECRET_KEY=sk_test_your_real_key_here
STRIPE_WEBHOOK_SECRET=whsec_from_stripe_cli

# 3. Start Stripe CLI webhook listener
stripe listen --forward-to http://localhost:1337/api/webhooks/stripe

# 4. Restart backend
docker-compose restart strapi
```

### User Flow

Same as mock checkout, but after clicking "Pay":

1. Browser redirects to **Stripe Checkout** hosted page
2. Enter test card: `4242 4242 4242 4242` | `12/34` | `123`
3. Complete payment
4. Redirected to `/checkout/success?orderNumber=AFF-...&session_id=cs_...`
5. Stripe CLI shows `checkout.session.completed` event → Strapi webhook fires

### How to Test

| Step            | What to verify                                           |
| --------------- | -------------------------------------------------------- |
| Stripe redirect | Browser opens`checkout.stripe.com`                     |
| Test card works | Payment succeeds with`4242 4242 4242 4242`             |
| Declined card   | Use`4000 0000 0000 0002` → payment declined           |
| Webhook fired   | Stripe CLI terminal shows`200 OK`                      |
| Order status    | Strapi admin → Orders → status:`pending` → `paid` |
| Inventory       | Strapi admin → Inventories → quantities reduced        |

---

## Feature 8 — Account: Order History

### User Flow

1. Login → `/account` → "Orders" tab or `/account/orders`
2. See list of all past orders with status, date, total
3. Expand order to see items

### How to Test

| Step               | What to verify                                         |
| ------------------ | ------------------------------------------------------ |
| Orders visible     | After checkout, order appears in list                  |
| Order status       | Shows "Pending" or "Paid"                              |
| Guest order lookup | Visit`/account/orders` — enter order number + email |

**Direct API test (authenticated):**

```bash
export JWT="your_jwt_here"

# Get all my orders
curl http://localhost:1337/api/orders \
  -H "Authorization: Bearer $JWT"

# Get specific order by order number (public)
curl "http://localhost:1337/api/orders/AFF-20260909-ABCDE"

# With email verification for guest orders
curl "http://localhost:1337/api/orders/AFF-20260909-ABCDE?email=test@example.com"
```

---

## Feature 9 — Account: Addresses

### User Flow

1. Login → `/account` → "Addresses" tab or `/account/addresses`
2. Click "Add Address"
3. Fill form (name, street, city, postal code, country)
4. Mark as default (optional)
5. Address appears in saved list

### How to Test

| Step               | What to verify                               |
| ------------------ | -------------------------------------------- |
| Add address        | Form submits, address appears                |
| Default flag       | Setting default un-defaults previous default |
| Multiple addresses | Can have several, one default                |

**Direct API test:**

```bash
export JWT="your_jwt_here"

# Add address
curl -X POST http://localhost:1337/api/addresses \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Home","street":"123 Main St","city":"NYC","postalCode":"10001","country":"United States","isDefault":true}'

# List addresses
curl http://localhost:1337/api/addresses \
  -H "Authorization: Bearer $JWT"
```

---

## Feature 10 — Account: Wishlist

### User Flow

1. Login (wishlist requires auth)
2. On any PDP → click heart icon (❤)
3. Heart fills → product added to wishlist
4. Click again → removed
5. Visit `/account/wishlist` → see all wishlisted products

### How to Test

| Step                      | What to verify                                           |
| ------------------------- | -------------------------------------------------------- |
| Toggle (logged in)        | Heart state changes;`POST /api/wishlist/toggle` called |
| Not logged in             | Heart click → no action (no auth)                       |
| Wishlist page             | All toggled products appear                              |
| Add to cart from wishlist | Cart updates; wishlist item remains                      |

**Direct API test:**

```bash
export JWT="your_jwt_here"

# Toggle product (productId = Strapi product ID, e.g. 1)
curl -X POST http://localhost:1337/api/wishlist/toggle \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1}'
# Returns: { inWishlist: true/false }

# Get wishlist
curl http://localhost:1337/api/wishlist \
  -H "Authorization: Bearer $JWT"
```

---

## Feature 11 — Discount Codes

### Available Test Codes (seeded on first boot)

| Code          | Type    | Value   | Min Order |
| ------------- | ------- | ------- | --------- |
| `WELCOME10` | Percent | 10% off | None      |
| `AFFETO20`  | Percent | 20% off | $100 min  |
| `FLAT15`    | Flat    | $15 off | $50 min   |

### How to Test

```bash
# Valid code, sufficient order
curl -X POST http://localhost:1337/api/discount-codes/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"WELCOME10","subtotal":10000}'
# → { valid: true, discountAmount: 1000, ... }

# Below minimum order
curl -X POST http://localhost:1337/api/discount-codes/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"AFFETO20","subtotal":5000}'
# → 400 "Minimum order of $100.00 required"

# Invalid code
curl -X POST http://localhost:1337/api/discount-codes/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"FAKE123","subtotal":5000}'
# → 400 "Invalid or expired discount code"
```

---

## Strapi Admin Panel

**URL:** `http://localhost:1337/admin`

Create your first admin user on first boot. Useful for:

- View/edit all products, orders, inventory, discount codes
- Manage users and role permissions
- Manually change order status (e.g., `pending` → `fulfilled`)
- Monitor seeded data

---

## Known Issues / Workarounds During Testing

| Issue                                               | Workaround                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| Auth state resets on page nav                       | Open browser console →`useAuthStore.getState().initAuth()`      |
| Discount`currentUses` not tracked                 | Codes work unlimited times; ignore usage-limit testing             |
| Email not sent                                      | Check Strapi logs:`docker logs affeto-strapi`                    |
| Cart badge resets on refresh                        | Open cart drawer to sync badge with actual cart state              |
| Mutation hooks may error (TanStack v5 API mismatch) | Use direct`curl` API tests above as workaround                   |
| Inventory not cleared for guest checkout            | Inventory decrement only works if order has a`user` in mock path |
