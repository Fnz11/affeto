<a id="readme-top"></a>

[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<br />
<div align="center">
  <a href="https://github.com/Fnz11/affeto">
    <img src="frontend/public/favicon.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">affeto</h3>

  <p align="center">
    High-performance headless luxury e-commerce platform powered by Strapi v5, Astro v5 SSR, React islands, and automated Docker orchestration.
    <br />
    <br />
    <a href="https://github.com/Fnz11/affeto/issues/new?labels=bug">Report Bug</a>
    ·
    <a href="https://github.com/Fnz11/affeto/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#problem">Problem</a></li>
        <li><a href="#solution">Solution</a></li>
      </ul>
      <ul>
        <li><a href="#system-architecture">System Architecture</a></li>
      </ul>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
      <ul>
        <li><a href="#features">Features</a></li>
      </ul>
      <ul>
        <li><a href="#file-structure">File Structure</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#quick-start-with-docker">Quick Start with Docker</a></li>
        <li><a href="#manual-development-setup">Manual Development Setup</a></li>
      </ul>
    </li>
    <li>
      <a href="#custom-commerce-apis">Custom Commerce APIs</a>
    </li>
    <li>
      <a href="#license">License</a>
    </li>
    <li>
      <a href="#contact">Contact</a>
    </li>
  </ol>
</details>

## About The Project

### Problem

Traditional monolithic e-commerce platforms often suffer from bloated client bundles, sluggish server response times, fragile inventory synchronization during high-traffic drops, and restrictive frontend customization. Developers either sacrifice performance for ease of content management or build custom headless architectures that lack cohesive session handling, real-time inventory locking, and cross-currency consistency.

### Solution

**affeto** is an open-source, production-grade headless e-commerce system built for modern web performance and high aesthetic standards:
1. **Ultra-Fast Edge-Ready Storefront**: Driven by **Astro v5 SSR** and interactive **React 18 islands**, ensuring near-zero JavaScript by default while hydrating components only when interactive.
2. **Robust Headless Commerce Engine**: Built on **Strapi v5** and **PostgreSQL**, featuring transactional inventory decrementing, guest-to-account cart reconciliation, multi-currency pricing, discount code validation, and Stripe webhook workflows.
3. **Turnkey Deployment**: Pre-configured **Docker Compose** containerization with **Caddy** providing automated reverse proxying, zero-config SSL, and sub-second asset serving.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VPS (Docker)                         │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐ │
│  │   Postgres   │◄──│    Strapi    │   │   Astro (SSR)    │ │
│  │  (DB volume) │   │  (headless   │◄──│  Node adapter    │ │
│  │  :5432       │   │   commerce   │   │  + React Islands │ │
│  └──────────────┘   │   services)  │   │  :4321           │ │
│                     │   :1337      │   └────────┬─────────┘ │
│                     └───────┬──────┘            │           │
│                             │                   │           │
│                       ┌─────▼──────┐            │           │
│  ┌──────────────┐     │   Stripe   │◄───────────┘           │
│  │ Caddy Proxy  │     │  webhooks  │  (checkout session     │
│  │ + Auto TLS   │     └────────────┘   + client calls)      │
│  │ :80 / :443   │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
```

#### State Boundary Pattern
- **Zustand (Client State)**: Lightweight ephemeral UI state (cart drawer toggle, active currency preferences `USD`/`EUR`/`GBP`, optimistic badges).
- **TanStack Query (Server State)**: Authoritative server data synchronized with Strapi (cart line items, stock validation, orders, addresses, and wishlist).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Astro][Astro]][Astro-url]
* [![React][React]][React-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![Strapi][Strapi]][Strapi-url]
* [![PostgreSQL][PostgreSQL]][PostgreSQL-url]
* [![TailwindCSS][TailwindCSS]][Tailwind-url]
* [![Docker][Docker]][Docker-url]
* [![Stripe][Stripe]][Stripe-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Features

#### 🛍️ Shopping & Cart Experience
- **Interactive React Islands** — Selective hydration for cart drawer, PDP variant selector, search filters, and checkout without bloating static editorial sections.
- **Guest-to-User Cart Merging** — Anonymous guest sessions seamlessly reconcile and merge into customer accounts upon sign-in.
- **Dynamic Multi-Currency Engine** — Instant currency conversion between USD ($), EUR (€), and GBP (£) with persistent state.
- **Real-Time Inventory Guard** — Live quantity and low-stock indicators with server-enforced limits preventing overselling.

#### 💳 Checkout & Order Processing
- **Stripe Checkout Integration** — Secure payment sessions with signature-verified webhooks.
- **Transactional Stock Decrementing** — Safe database-level inventory reduction executed upon payment confirmation.
- **Discount Engine** — Support for percentage-based and fixed-amount coupon codes (`WELCOME10`, `AFFETO20`, `FLAT15`).
- **Mock Checkout Simulation** — Dedicated mock endpoint for rapid local testing without active Stripe API keys.

#### 👤 Customer Account Management
- **Order Tracking & Receipts** — Comprehensive history breakdown with itemized tracking and shipping snapshots.
- **Saved Address Book** — Manage multiple shipping addresses with default address selection.
- **Synchronized Wishlist** — Persistent wishlist functionality linked to customer accounts.

#### ⚙️ Performance & Operations
- **On-Demand ISR / Cache Invalidation** — Strapi lifecycle hooks trigger Astro on-demand cache revalidation when products update.
- **Rate-Limiting Protection** — Custom Koa rate limiting middleware on cart, checkout, and webhook endpoints.
- **1-Command Docker Setup** — Pre-orchestrated Docker Compose environment with automatic migrations and catalog seeding.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### File Structure

```
affeto/
├── backend/                  # Strapi v5 Headless Commerce CMS
│   ├── config/               # Server, database, middlewares, and admin config
│   ├── database/             # Database migrations & schema handlers
│   ├── src/
│   │   ├── api/              # Commerce APIs (cart, checkout, order, product, etc.)
│   │   ├── components/       # Reusable Strapi components (line items, address)
│   │   ├── middlewares/      # Security & rate limiting middleware
│   │   ├── services/         # Transactional email & notifications
│   │   ├── index.ts          # Strapi bootstrap & automated seeding
│   │   └── seed.ts           # Sample catalog, variants, prices & promo codes
│   └── Dockerfile            # Container configuration for Strapi
├── frontend/                 # Astro v5 SSR + React Island Storefront
│   ├── public/               # Static assets, luxury custom fonts & icons
│   ├── src/
│   │   ├── components/       # Modular UI components & React islands
│   │   │   ├── account/      # Dashboard, address book, orders, and wishlist
│   │   │   ├── cart/         # Slide-out cart drawer & checkout previews
│   │   │   ├── catalog/      # Product cards, PDP gallery, variant pickers
│   │   │   ├── common/       # Header, currency selector, footer, marquee
│   │   │   └── sections/     # Editorial landing page sections & collages
│   │   ├── layouts/          # Base HTML layouts & font declarations
│   │   ├── lib/              # API clients, session managers, TanStack queries
│   │   ├── pages/            # Astro SSR file-based routes & API proxy endpoints
│   │   ├── stores/           # Zustand client state stores (cart, auth, currency)
│   │   └── styles/           # Global styles and typography definitions
│   └── Dockerfile            # Container configuration for Astro SSR
├── docker-compose.yml        # Orchestration (PostgreSQL, Strapi, Astro, Caddy)
├── Caddyfile                 # Caddy reverse proxy & automatic SSL config
├── package.json              # Monorepo configuration
└── README.md
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

* [Bun](https://bun.sh/) >= 1.1 or [Node.js](https://nodejs.org/) >= 20
* [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (for containerized setup)

### Quick Start with Docker

The fastest way to spin up the entire production-like environment (Postgres, Strapi, Astro SSR, Caddy):

1. Clone the repository:
   ```sh
   git clone https://github.com/Fnz11/affeto.git
   cd affeto
   ```
2. Create your environment file:
   ```sh
   cp .env.example .env
   ```
3. Boot all services:
   ```sh
   docker compose up -d --build
   ```
4. Access the applications:
   - **Storefront**: `http://localhost:4321` (or `http://localhost` via Caddy)
   - **Strapi Admin**: `http://localhost:1337/admin`

*Note: Strapi will automatically bootstrap database permissions and seed 8 products with variants, multi-currency prices, inventory, and discount codes on its first launch.*

### Manual Development Setup

If you want to run the frontend and backend locally with live hot-reloading:

1. Clone and install dependencies:
   ```sh
   git clone https://github.com/Fnz11/affeto.git
   cd affeto
   bun install
   ```
2. Start both Strapi backend and Astro storefront concurrently:
   ```sh
   bun run dev
   ```
   Or run each workspace individually:
   ```sh
   bun run dev:backend   # Strapi API at http://localhost:1337
   bun run dev:frontend  # Astro Storefront at http://localhost:4321
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Custom Commerce APIs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/cart` | Retrieve active cart (via `x-session-id` or Auth JWT) |
| `POST` | `/api/cart/items` | Add product variant to cart (validates inventory) |
| `PUT` | `/api/cart/items/:itemId` | Update line item quantity |
| `DELETE` | `/api/cart/items/:itemId` | Remove item from cart |
| `POST` | `/api/cart/merge` | Merge anonymous guest cart with user cart upon login |
| `POST` | `/api/discount-codes/validate` | Validate coupon code (`WELCOME10`, `AFFETO20`, etc.) |
| `POST` | `/api/checkout/session` | Create pending order and generate Stripe checkout session |
| `POST` | `/api/checkout/confirm-mock` | Development simulation to confirm order & deduct stock |
| `POST` | `/api/webhooks/stripe` | Stripe webhook receiver with transactional inventory deduction |
| `GET` | `/api/orders` | Fetch customer order history |
| `POST` | `/api/wishlist/toggle` | Toggle product in customer wishlist |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Fikri Nurdiansyah

[![gmail][gmail]][gmail-url]
[![tele][tele]][tele-url]
[![linkedin][linkedin-shield]][linkedin-url]

Project Link: [https://github.com/Fnz11/affeto](https://github.com/Fnz11/affeto)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[forks-shield]: https://img.shields.io/github/forks/Fnz11/affeto.svg?style=for-the-badge
[forks-url]: https://github.com/Fnz11/affeto/network/members
[stars-shield]: https://img.shields.io/github/stars/Fnz11/affeto.svg?style=for-the-badge
[stars-url]: https://github.com/Fnz11/affeto/stargazers
[issues-shield]: https://img.shields.io/github/issues/Fnz11/affeto.svg?style=for-the-badge
[issues-url]: https://github.com/Fnz11/affeto/issues
[license-shield]: https://img.shields.io/github/license/Fnz11/affeto.svg?style=for-the-badge
[license-url]: https://github.com/Fnz11/affeto/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/fikri-nurdiansyah-214387286/
[tele]: https://img.shields.io/badge/Telegram-2CA5E0?style=flat-square&logo=telegram&logoColor=white
[tele-url]: https://t.me/ysfik
[gmail]: https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white
[gmail-url]: https://mail.google.com/mail/u/finz1112@gmail.com/#compose
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[React]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[Astro]: https://img.shields.io/badge/Astro-BC52EE?style=for-the-badge&logo=astro&logoColor=white
[Astro-url]: https://astro.build/
[Strapi]: https://img.shields.io/badge/Strapi-4945FF?style=for-the-badge&logo=strapi&logoColor=white
[Strapi-url]: https://strapi.io/
[PostgreSQL]: https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
[PostgreSQL-url]: https://www.postgresql.org/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com/
[Stripe]: https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white
[Stripe-url]: https://stripe.com/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
