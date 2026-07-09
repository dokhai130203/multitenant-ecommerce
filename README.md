# 🛍️ Funroad — Multi-Vendor Digital Marketplace

A portfolio-grade multi-tenant SaaS marketplace where vendors create their own storefronts and sell digital products. Built with **Next.js 15**, **Payload CMS**, **tRPC**, **Stripe Connect**, and **MongoDB**.

**🔗 Live Demo:** [multitenant-ecommerce-eight-iota.vercel.app](https://multitenant-ecommerce-eight-iota.vercel.app)

## Why this project stands out

- A real multi-tenant marketplace architecture with isolated storefronts and tenant-scoped access
- End-to-end commerce flow: browse, filter, cart, checkout, payment webhook, library, and reviews
- Modern full-stack implementation with TypeScript, tRPC, Payload CMS, and Stripe
- Designed to feel like a production app rather than a simple CRUD demo, making it strong CV/portfolio material

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Developer Notes](#-developer-notes)
- [Environment Variables](#-environment-variables)
- [Stripe Webhook Setup](#-stripe-webhook-setup-critical-for-local-development)
- [Demo Accounts](#-demo-accounts)
- [Project Structure](#-project-structure)
- [Key Implementation Details](#-key-implementation-details)
- [Database Schema](#-database-schema)
- [Security Considerations](#-security-considerations)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Vendor (Seller)

- Auto-created storefront at `/tenants/[slug]` on sign up
- List digital products with rich text descriptions, images, categories, and tags
- Stripe Connect onboarding for marketplace payouts
- Platform fee deducted automatically per sale
- Cannot purchase their own products (enforced UI + server side)

### Buyer

- Browse all vendor storefronts and the global marketplace
- Filter by category, price range, and tags; sort by Curated, Trending, Hot & New
- Per-tenant shopping cart — shop from multiple vendors simultaneously, persisted via localStorage
- Secure checkout via Stripe
- Purchased products appear in personal Library
- Leave reviews and ratings after purchase

### Platform

- Role-based access: `super-admin` (sees all tenants/products) vs regular `user` (scoped to own tenant)
- Webhook-driven order creation and Stripe account verification — signature-verified, idempotent
- Cursor-based infinite scroll pagination
- Type-safe API layer end to end (tRPC + Zod + Payload generated types)

---

## 🛠️ Tech Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| Framework          | Next.js 15 (App Router), React 19               |
| CMS & Database     | Payload CMS v3 + MongoDB Atlas                  |
| API                | tRPC v11 + TanStack Query v5                    |
| Payments           | Stripe Connect (marketplace payouts)            |
| Auth               | Payload built-in auth (JWT + HTTP-only cookies) |
| State Management   | Zustand v5 (persisted cart)                     |
| Styling            | Tailwind CSS + shadcn/ui                        |
| Forms & Validation | React Hook Form + Zod                           |
| URL State          | nuqs                                            |
| File Storage       | Vercel Blob                                     |
| Deployment         | Vercel                                          |
| Language           | TypeScript                                      |
| Runtime            | Bun                                             |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js 15 (Vercel)                │
│                                                       │
│  /                    → Global marketplace           │
│  /tenants/[slug]      → Vendor storefront             │
│  /tenants/[slug]/products/[id] → Product detail       │
│  /tenants/[slug]/checkout      → Checkout page         │
│  /library             → Purchased products            │
│  /admin               → Payload CMS admin panel        │
└──────────┬──────────────────────┬────────────────────┘
           │                      │
    ┌──────▼──────┐        ┌──────▼──────┐
    │   Stripe    │        │ Payload CMS │
    │   Connect   │        │ (REST/GQL)  │
    │             │        │             │
    │ • Checkout  │        │ • Products  │
    │ • Webhooks  │        │ • Orders    │
    │ • Payouts   │        │ • Reviews   │
    │ • Platform  │        │ • Tenants   │
    │   fees      │        │ • Users     │
    └──────┬──────┘        └──────┬──────┘
           │                      │
           └──────────┬───────────┘
                      ▼
               ┌─────────────┐
               │  MongoDB    │
               │   Atlas     │
               └─────────────┘
```

### Multi-Tenant Data Flow

```
User signs up
    ↓
Auto-creates Tenant (slug derived from username)
    ↓
User verifies Stripe account (Stripe Connect onboarding)
    ↓
User can now create products under their tenant
    ↓
Products are isolated per tenant — only visible on their storefront
```

### Purchase Flow

```
Buyer adds product to cart (Zustand → localStorage)
    ↓
Buyer goes to /tenants/[slug]/checkout
    ↓
tRPC mutation: checkout.purchase
    ↓ checks: product exists → tenant exists → buyer ≠ seller → Stripe verified
    ↓
Stripe Checkout Session created (on vendor's connected account)
    ↓
Buyer pays on Stripe hosted page
    ↓
Stripe fires webhook: checkout.session.completed (signature verified)
    ↓
Order created in MongoDB { user, product, stripeCheckoutSessionId }
    ↓
Product appears in buyer's /library
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- [Stripe](https://stripe.com) account (sandbox mode)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (for local webhook testing)

### 1. Clone & Install

```bash
git clone https://github.com/dokhai130203/multitenant-ecommerce.git
cd multitenant-ecommerce
bun install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Fill in the values — see [Environment Variables](#-environment-variables) below.

### 3. Seed the database

```bash
bun run db:seed
```

This creates default categories/subcategories and an `admin@demo.com` super-admin account with a linked Stripe account.

### 4. Set up the Stripe webhook (see section below)

### 5. Start the dev server

```bash
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) — admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🛠 Developer Notes

If you modify Payload collections or custom admin components, regenerate the Payload import map:

```bash
bunx payload generate:importmap
```

Then restart the development server to ensure the generated types and admin UI stay in sync.

## 🔑 Environment Variables

```env
# Database
DATABASE_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ecommerce

# Payload CMS
PAYLOAD_SECRET=your_random_secret_key_min_32_chars

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000
NEXT_PUBLIC_ENABLE_SUBDOMAIN_ROUTING=false

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Vercel Blob (production file uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

> **Production note:** On Vercel, set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_ROOT_DOMAIN` to your deployed domain **without trailing slashes** — a trailing slash will silently break cookie-based auth.

---

## 💳 Stripe Webhook Setup (Critical for Local Development)

Orders are only created when the `checkout.session.completed` webhook fires. Without it, payments succeed but no order record is created.

```bash
# In a separate terminal, forward Stripe events to your local server:
stripe listen --forward-to http://localhost:3000/api/stripe/webhooks

# Copy the printed signing secret into your .env:
# STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

Keep this terminal running alongside `bun run dev` whenever testing checkout locally.

---

## 👥 Demo Accounts

| Email            | Password | Role                                                     |
| ---------------- | -------- | -------------------------------------------------------- |
| `admin@demo.com` | `demo`   | super-admin — automatically created by `bun run db:seed` |
| `john@demo.com`  | `demo`   | vendor — create manually for testing                     |
| `khai@demo.com`  | `demo`   | vendor — create manually for testing                     |
| `doker@demo.com` | `demo`   | buyer — create manually for testing                      |

> **Note:** The seed script only creates the `admin@demo.com` account and default categories. The vendor and buyer accounts above are recommended demo accounts that can be created manually for testing.

> All accounts use **Stripe Sandbox** — no real payments are processed.

> **Test card:** `4242 4242 4242 4242`, any future expiry date, any CVC.

### Suggested Testing Flow

```
1. Sign in as khai@demo.com → visit /tenants/khai → create a product via /admin
2. Sign in as doker@demo.com → browse /tenants/khai → add product to cart
3. Go to checkout → pay with Stripe test card
4. Confirm Order is created (webhook) → product appears in /library
5. Try buying khai's product while signed in as khai → should be blocked
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (app)/
│   │   ├── (auth)/                   # Sign in / Sign up
│   │   ├── (home)/                   # Global marketplace
│   │   ├── (library)/                # Purchased products
│   │   ├── (tenants)/tenants/[slug]/ # Vendor storefronts + checkout
│   │   └── api/stripe/webhooks/      # Stripe webhook handler
│   └── (payload)/admin/              # Payload CMS admin panel
│
├── collections/                      # Payload CMS collections
│   ├── Users.ts
│   ├── Tenants.ts
│   ├── Products.ts
│   ├── Orders.ts
│   ├── Reviews.ts
│   ├── Categories.ts
│   ├── Tags.ts
│   └── Media.ts
│
├── modules/                          # Feature modules (tRPC routers + UI)
│   ├── auth/
│   ├── products/
│   ├── checkout/
│   ├── reviews/
│   ├── tenants/
│   └── library/
│
├── trpc/                             # tRPC server + client setup
├── lib/
│   ├── utils.ts                      # cn(), formatCurrency(), generateTenantURL()
│   ├── access.ts                     # isSuperAdmin()
│   └── stripe.ts                     # Stripe client
│
└── components/ui/                    # shadcn/ui components
```

---

## 🔑 Key Implementation Details

### Multi-Tenant Cart (Zustand)

Cart state is scoped per tenant and persisted to `localStorage`:

```ts
tenantCarts: {
  "khai": { productIds: ["abc", "def"] },
  "john": { productIds: ["xyz"] }
}
```

`useCart(tenantSlug)` provides a tenant-scoped facade — callers never pass `tenantSlug` manually when adding/removing items.

### Stripe Connect (Marketplace Payouts)

Payments route through the platform account to the vendor's connected account, with a platform fee deducted automatically:

```ts
stripe.checkout.sessions.create(
  {
    payment_intent_data: {
      application_fee_amount: platformFeeAmount, // platform's cut
    },
  },
  {
    stripeAccount: tenant.stripeAccountId, // money lands on vendor's account
  },
);
```

### Seller Cannot Buy Own Products

Enforced at two levels, since UI checks alone can be bypassed via DevTools:

1. **UI** — `isOwner` flag (computed server-side in `products.getOne`) hides the Add to Cart button and shows "This is your Product" + an Edit Product link instead
2. **Server** — `checkout.purchase` compares the buyer's tenant ID against the product's tenant and throws `FORBIDDEN` if they match — this is the real security boundary

### Webhook Idempotency & Verification

```ts
event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
```

Every webhook request is signature-verified before processing. The handler always returns `200` for recognized-but-unhandled event types (so Stripe doesn't endlessly retry), and only returns non-200 for genuine failures.

---

## 📊 Database Schema (simplified)

```json
// Tenants
{ "id": "...", "name": "Khai's Store", "slug": "khai", "stripeAccountId": "acct_xxx", "stripeDetailsSubmitted": true }

// Products
{ "id": "...", "name": "React SaaS Starter", "price": 49, "tenant": "tenant-id", "category": "category-id", "tags": ["tag-id"] }

// Orders
{ "id": "...", "user": "user-id", "product": "product-id", "stripeCheckoutSessionId": "cs_test_xxx" }

// Reviews
{ "id": "...", "user": "user-id", "product": "product-id", "rating": 5, "description": "..." }
```

---

## 🔒 Security Considerations

- ✅ `protectedProcedure` middleware enforces session checks on mutations
- ✅ Tenant filtering happens server-side (`where["tenant.slug"]`) — never trusted from client
- ✅ Stripe webhook signature verification (`constructEvent`)
- ✅ Self-purchase prevention enforced server-side, not just UI
- ✅ Review ownership checks (`depth: 0` comparison) before allowing edits
- ✅ HTTP-only, secure, SameSite cookies for session tokens
- ⚠️ TODO: Rate limiting on public tRPC procedures
- ⚠️ TODO: CORS hardening for production

---

## 🐛 Troubleshooting

**Orders not created after payment**
→ Webhook isn't running locally. Start `stripe listen --forward-to http://localhost:3000/api/stripe/webhooks` and update `STRIPE_WEBHOOK_SECRET`.

**MongoDB `ReplicaSetNoPrimary` / connection timeout**
→ Common with Atlas free tier under high latency. Increase `serverSelectionTimeoutMS` in the Payload Mongoose adapter, or migrate to a region closer to you.

**Upload fails with `ENOENT: no such file or directory, mkdir 'media'` on Vercel**
→ Vercel's filesystem is ephemeral. Ensure `@payloadcms/storage-vercel-blob` is registered in `payload.config.ts` and `BLOB_READ_WRITE_TOKEN` is set in your environment variables.

**Login works locally but session doesn't persist on Vercel**
→ Check `NEXT_PUBLIC_ROOT_DOMAIN` for a trailing slash — it silently breaks the `Set-Cookie` `domain` attribute.

**Type errors after editing a Payload collection**
→ Restart the dev server, or run `bunx payload generate:importmap` if a new field type's component isn't recognized.

---

## 📝 License

MIT

---

## 👨‍💻 About This Project

Built as a full-stack portfolio project demonstrating multi-tenant SaaS architecture, real payment processing with Stripe Connect, server-side data filtering, and type-safe full-stack development with TypeScript, tRPC, and Payload CMS.
