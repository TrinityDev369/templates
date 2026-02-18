---
name: commerce-seed
description: Compose a complete e-commerce storefront from shop-* templates. Discovers business model, selects archetype, installs components via `npx @trinity369/use`, and generates the glue layer (cart state, product types, currency formatting). Use when building a store, shopping cart, product catalog, checkout flow, or any e-commerce frontend. Triggers on "build store", "e-commerce", "shop", "storefront", "product catalog", "checkout".
---

# Commerce Seed — Autonomous Storefront Composer

Compose a working e-commerce frontend by discovering the business model, selecting an archetype, installing shop-* template components, and generating the glue layer that wires them together.

## Available Components (8 shop-* templates)

| Slug | Purpose |
|------|---------|
| `shop-product-grid` | Responsive product card grid — image, price, rating, sale badges, add-to-cart, grid/list toggle |
| `shop-product-detail` | Product detail page — image gallery, variant selectors, rating, tabs (description/reviews/specs) |
| `shop-cart` | Shopping cart sheet — quantity controls, order summary, localStorage persistence, empty state |
| `shop-checkout` | Multi-step checkout — shipping, payment, review, confirmation (react-hook-form + zod) |
| `shop-order-history` | Order history — status badges, expandable details, re-order, date filtering, pagination |
| `shop-search-filters` | Faceted filters — price range, category checkboxes, color swatches, sort dropdown, active badges |
| `shop-category-nav` | Hierarchical category sidebar — accordion tree, breadcrumbs, count badges, mobile sheet |
| `shop-wishlist` | Wishlist grid — heart toggle, move-to-cart, share list, localStorage persistence |

## Composition Graph

```
Layer 0 - BROWSE (always)        shop-product-grid, shop-product-detail
Layer 1 - NAVIGATION (archetype) shop-category-nav, shop-search-filters
Layer 2 - PURCHASE (always)      shop-cart, shop-checkout
Layer 3 - POST-PURCHASE (arch.)  shop-order-history
Layer 4 - ENGAGEMENT (arch.)     shop-wishlist
```

Install in layer order. Each layer builds on the previous.

## Archetypes

### `storefront` — Full E-Commerce Store
**Components**: ALL 8
Physical products, shipping addresses, tax calculation, multiple categories.

### `digital` — Digital Products / Downloads
**Components**: product-grid, product-detail, cart, checkout, order-history, search-filters (6/8)
**Skip**: category-nav (flat catalog), wishlist (impulse buy model)
No shipping step, instant delivery, license keys.

### `marketplace` — Multi-Vendor Marketplace
**Components**: ALL 8
Vendor/seller info on products, vendor filtering, split checkout consideration.
product-grid needs vendor badge, search-filters needs vendor filter.

### `subscription` — Subscription Box / SaaS Products
**Components**: product-grid, product-detail, cart, checkout, order-history (5/8)
**Skip**: category-nav, search-filters, wishlist
Recurring billing, plan selection instead of quantity, subscription management.

### `minimal` — Simple Store / Few Products
**Components**: product-grid, product-detail, cart, checkout (4/8)
**Skip**: category-nav, search-filters, order-history, wishlist
Flat catalog, no categories, minimal filtering.

---

## Phase 1: Discovery

Ask these questions conversationally (not as a checklist). Adapt based on answers.

1. **What do you sell?** Physical goods, digital downloads, subscriptions, services, or a mix?
2. **How many products?** A handful (flat catalog) or hundreds (needs categories + search)?
3. **Currency and locale?** USD/en-US, EUR/de-DE, GBP/en-GB, etc.
4. **Shipping?** Physical products need a shipping step; digital products skip it.
5. **Single seller or marketplace?** One store or multiple vendors?
6. **Wishlists needed?** Save-for-later behavior or impulse-buy model?

### Mapping Answers to Archetype

| Signal | Archetype |
|--------|-----------|
| Physical goods + many products + categories | `storefront` |
| Digital downloads / license keys / no shipping | `digital` |
| Multiple sellers / vendors | `marketplace` |
| Recurring billing / plans / SaaS | `subscription` |
| Few products / simple catalog / MVP | `minimal` |

If ambiguous, default to `storefront` — it is the most complete and components can be removed later.

After mapping, confirm:

```
Archetype: [archetype]
Components to install: [list]
Currency: [code]
Locale: [locale]
Shipping: yes/no
```

Wait for user confirmation before proceeding.

## Phase 2: Installation Plan

Build the install plan by layer. Only include components selected by the archetype.

Present the plan as a table:

```
## Installation Plan — [archetype]

| Layer | Component | Slug | Command |
|-------|-----------|------|---------|
| 0 Browse | Product Grid | shop-product-grid | npx @trinity369/use shop-product-grid |
| 0 Browse | Product Detail | shop-product-detail | npx @trinity369/use shop-product-detail |
| 1 Nav | Category Nav | shop-category-nav | npx @trinity369/use shop-category-nav |
| 1 Nav | Search Filters | shop-search-filters | npx @trinity369/use shop-search-filters |
| 2 Purchase | Cart | shop-cart | npx @trinity369/use shop-cart |
| 2 Purchase | Checkout | shop-checkout | npx @trinity369/use shop-checkout |
| 3 Post-Purchase | Order History | shop-order-history | npx @trinity369/use shop-order-history |
| 4 Engagement | Wishlist | shop-wishlist | npx @trinity369/use shop-wishlist |

After install: generate glue layer (cart context, product types, currency formatting)
```

Ask: **Ready to install [N] components? (yes / modify / cancel)**

## Phase 3: Install Components

Execute `npx @trinity369/use <slug>` for each component in layer order. Run individually, verify output before proceeding.

```bash
npx @trinity369/use shop-product-grid      # Layer 0
npx @trinity369/use shop-product-detail     # Layer 0
npx @trinity369/use shop-category-nav       # Layer 1 (if archetype includes)
npx @trinity369/use shop-search-filters     # Layer 1 (if archetype includes)
npx @trinity369/use shop-cart               # Layer 2
npx @trinity369/use shop-checkout           # Layer 2
npx @trinity369/use shop-order-history      # Layer 3 (if archetype includes)
npx @trinity369/use shop-wishlist           # Layer 4 (if archetype includes)
```

Track installed paths from each postMessage. If any install fails, report the error and ask: retry, skip, or abort.

## Phase 4: Generate Glue Layer

The glue layer connects isolated components into a functioning store. Generate these files:

### 4.1 — `src/lib/store/types.ts`

Shared product and cart types configured for the selected archetype.

```typescript
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;          // in cents
  compareAtPrice?: number; // original price for sale items, in cents
  currency: string;       // e.g. 'USD'
  images: string[];
  category?: string;
  tags: string[];
  rating?: number;
  reviewCount?: number;
  inStock: boolean;
  // --- archetype-specific fields below ---
}

export interface CartItem {
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  updatedAt: Date;
}
```

**Archetype-specific Product fields:**

- `storefront`: `sku`, `weight`, `dimensions`, `shippingClass`
- `digital`: `downloadUrl`, `licenseKey`, `fileSize`, `fileType`
- `marketplace`: `vendorId`, `vendorName`, `vendorRating`
- `subscription`: `interval` (`monthly`|`yearly`), `trialDays`, `features: string[]`
- `minimal`: no extra fields

### 4.2 — `src/lib/store/cart-context.tsx`

React context provider that wraps the app. All shop-* components read from this shared state.

```typescript
"use client";

import { createContext, useContext, useCallback, useSyncExternalStore } from "react";
import type { Product, CartItem, Cart } from "./types";

// --- Cart operations ---
// addItem(product, quantity?)
// removeItem(productId)
// updateQuantity(productId, quantity)
// clearCart()
// getItemCount()
// getSubtotal()

// --- Provider ---
// <CartProvider>{children}</CartProvider>

// --- Hook ---
// const { cart, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal } = useCart();
```

Key requirements:
- Persist cart to `localStorage` under key `commerce-seed-cart`
- Hydrate on mount (handle SSR: return empty cart on server)
- Expose `useCart()` hook — throw if used outside provider
- `addItem` merges quantity if product already in cart
- `subtotal` is computed from `items.reduce(sum of price * quantity)`

### 4.3 — `src/lib/store/format.ts`

Currency formatting utility using the configured locale and currency.

```typescript
export function formatPrice(cents: number, currency = "[CURRENCY]"): string {
  return new Intl.NumberFormat("[LOCALE]", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatDiscount(original: number, sale: number): string {
  const pct = Math.round(((original - sale) / original) * 100);
  return `-${pct}%`;
}
```

Replace `[CURRENCY]` and `[LOCALE]` with the values from discovery.

### 4.4 — `src/lib/store/index.ts`

Barrel export for the entire store module.

```typescript
export * from "./types";
export * from "./cart-context";
export * from "./format";
```

### Archetype-Specific Glue Additions

**marketplace** — add `src/lib/store/vendor-types.ts`:
```typescript
export interface Vendor {
  id: string;
  name: string;
  slug: string;
  rating: number;
  productCount: number;
  logo?: string;
}
```

**subscription** — add `src/lib/store/subscription-types.ts`:
```typescript
export type BillingInterval = "monthly" | "yearly";

export interface Plan {
  id: string;
  name: string;
  price: number;       // cents per interval
  interval: BillingInterval;
  features: string[];
  recommended?: boolean;
}
```

## Phase 5: Verify and Report

### Verification Checklist

```bash
# 1. Verify glue files exist
ls src/lib/store/types.ts src/lib/store/cart-context.tsx src/lib/store/format.ts src/lib/store/index.ts

# 2. TypeScript check (if tsconfig present)
npx tsc --noEmit 2>&1 | head -20

# 3. No orphan imports
grep -r "from ['\"]@/lib/store" components/ src/ 2>/dev/null || echo "No store imports yet"
```

### Completion Report

Present the final summary:

```
## Storefront Composed

Archetype: [archetype]
Components installed: [N]/8
Currency: [code] ([locale])

### Installed Components
| Layer | Component | Path |
|-------|-----------|------|
| ... | ... | ... |

### Glue Layer
| File | Purpose |
|------|---------|
| src/lib/store/types.ts | Product, CartItem, Cart types |
| src/lib/store/cart-context.tsx | CartProvider + useCart hook |
| src/lib/store/format.ts | formatPrice, formatDiscount |
| src/lib/store/index.ts | Barrel exports |

### Next Steps
1. Wrap your root layout in `<CartProvider>`:
   import { CartProvider } from "@/lib/store";
   <CartProvider>{children}</CartProvider>

2. Wire components to cart context:
   - Product grid/detail: import { useCart } from "@/lib/store"
   - Cart sheet: reads from useCart() automatically

3. Replace mock data with your product API

4. Configure payment provider in checkout component
```

## Edge Cases

- **Existing store files** — if `src/lib/store/` already exists, ask before overwriting
- **Non-Next.js project** — warn that components assume Next.js App Router; adapt imports if using Vite/Remix
- **JavaScript project** — generate `.js`/`.jsx` files instead of `.ts`/`.tsx`; drop type annotations
- **Custom output dir** — if user specifies `--dir`, adjust all paths accordingly
- **Partial re-run** — if some components already installed, skip them and only install missing ones

## Rules

1. **Always discover before installing** — never assume archetype without asking
2. **Always confirm the plan** — show the table, get approval, then execute
3. **Install in layer order** — browse first, engagement last
4. **Generate glue AFTER install** — components must be on disk before wiring
5. **Currency is not optional** — always ask and configure; never default silently
6. **Report every failure** — if a component fails to install, surface it immediately
7. **Never install components not in the archetype** — respect the selection
