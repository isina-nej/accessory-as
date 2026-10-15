# Accessory AS — Project Context

> Persistent, evidence-based project map for future sessions. Last reviewed: 2026-10-14. Paths are relative to repository root. This is a living overview, not a substitute for checking the current source before changing behavior.

## Project identity and stack

- Persian-first RTL e-commerce storefront for accessories, based on local Figma exports.
- Next.js 16.3.5 App Router, React 19.2.8, TypeScript 5, Node 22 in CI/container.
- Tailwind CSS v4 (`src/app/globals.css`); Drizzle ORM + `mysql2` over MySQL/MariaDB; Better Auth; Zod; Vitest.
- Payment integrations: Zarinpal SDK and Zibal REST. Currency in business logic and database is toman; payment provider amounts are rial.
- Next config uses `output: "standalone"`; Docker Compose maps app to `127.0.0.1:3002` and runs MariaDB 10.11. GitHub Actions validates PRs/pushes and deploys `main` to `https://accessory.nodia.ir` through the host deploy script.
- Important config: `package.json`, `next.config.ts`, `drizzle.config.ts`, `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci-cd.yml`, `ops/deploy/accessory-as-deploy.sh`.

## Architecture and important paths

- `src/app/`: App Router routes; default to Server Components. Interactive behavior should remain in small client islands.
- `src/components/shop/`: storefront shell, catalog/product cards, filters, gallery, checkout, account, forms.
- `src/components/admin/`: admin navigation, forms, tables and presentation primitives.
- `src/server/`: admin read/write domain modules and upload helpers; permission checks should stay server-side.
- `src/lib/`: business logic, auth/session, catalog queries, checkout/order/payment/account actions and formatting.
- `src/db/schema.ts`: canonical schema. `src/db/index.ts`: lazy Drizzle/mysql2 access. `src/db/drizzle/`: SQL migrations and journal. `src/db/seed.ts`: development seed (not safe to assume production-safe).
- `src/stores/cart.ts`: Zustand persisted local guest cart; localStorage key `as-cart`, version 1. No server-state cache.
- `public/icons/manifest.json` + `src/components/ui/Icon.tsx`: canonical icon pipeline. `src/app/fonts.ts`: local Doran FaNum font setup.
- Design sources: `accesssory as.fig`, `.figma/imports/`, `public/`. Prefer local Figma source/assets over the rate-limited online API.

### Main routes

- Storefront: `/`, `/shop`, `/products/[slug]`, `/cart`.
- Checkout: `/checkout/address`, `/checkout/shipping`, `/checkout/pay`; provider callback `/payment/callback`; outcome pages `/checkout/success`, `/checkout/fail`.
- Account: `/account`, `/account/orders`, `/account/orders/[id]`, `/account/favorites`, `/account/addresses`, `/account/info`.
- Auth: `/(auth)/login`, `/(auth)/forgot-password`; Better Auth handler at `/api/auth/[...all]`.
- Public content: `/about`, `/contact`, `/faq`; API: `/api/health`, `/api/products`, `/api/cart`.
- Admin: `/admin` plus products, categories, attributes, orders, payments, refunds, users, messages, reviews, marketing, content and settings.

## Data model (canonical schema: `src/db/schema.ts`)

- Better Auth: `user`, `session`, `account`, `verification`.
- Catalog: `categories`, `products`, `product_images`, `attributes`, `product_attributes`, `reviews`.
- Checkout/account: `addresses`, `orders`, `order_items`, `order_events`, `payments`, `favorites`, `coupons`, `shipping_methods`, `wallet_refunds`.
- Admin/CMS: `staff_roles`, `banners`, `pages`, `faqs`, settings.
- Keys and many relationships/statuses are application-managed; schema has no general foreign-key/check-constraint enforcement. There is at most one payment record per order. Favorite and product-attribute links use composite keys. Money uses integer toman except `payments.amount_rial`.
- Order status transition helper lives in `src/lib/order-status.ts`; refund transitions/labels and setting allowlist in `src/lib/admin-labels.ts`.

## Core business flows

### Catalog and storefront

- `src/lib/products.ts`, `shop-query.ts`, `get-products.ts`, `shop-images.ts`, `menu.ts`, `cms-public.ts` supply parsing, DB queries and public CMS/menu data.
- Shop filters/sort/pagination are URL-driven; interactive filter controls are client components. Product detail is server-loaded with client gallery/variant/cart/review islands.
- Landing route (`src/app/page.tsx`) combines catalog/CMS content and local image fallbacks. Verify whether fallbacks are still desired before changing content behavior.

### Auth and account

- Better Auth configuration: `src/lib/auth.ts`; browser client: `auth-client.ts`; server mutation helpers: `auth-actions.ts`; session helper: `session.ts`; route handler: `src/app/api/auth/[...all]/route.ts`.
- Auth UI helpers normalize Persian/Arabic digits and restrict `next` redirects to local paths (`src/lib/auth-ui.ts`).
- OTP sending currently logs codes in server-side code; no production SMS/email provider integration was found in inspected auth flow.
- Address CRUD and owner scoping: `src/lib/address-actions.ts`. Account orders/favorites and wallet refund requests: `src/lib/account-actions.ts`.

### Cart, order and payment

- Guest cart persists in browser. `/api/cart` enriches product IDs with catalog data.
- `src/lib/order-actions.ts` creates pending orders from server-read active product prices/stock; client prices are not authoritative. Coupon validation and totals helpers are in `src/lib/checkout.ts`. Shipping threshold uses the discounted subtotal. Order item unit prices are snapshots; title/image/variant/address snapshots are not stored.
- `src/lib/payment/start.ts`, `zarinpal.ts`, `zibal.ts`, `pay-actions.ts`, and `src/app/payment/callback/route.ts` implement provider initiation and verification. Toman→rial conversion belongs exclusively at gateway boundary (`tomanToRial` in `src/lib/fa.ts`/payment layer as currently implemented).
- Without real merchant configuration, payment start can enter deterministic MOCK flow; do not treat mock callbacks as production gateway verification.

### Admin

- Role definitions: `src/lib/roles.ts`; staff resolution/bootstrap: `src/lib/staff.ts` and `src/server/staff.ts`.
- Roles are additive: `admin` all permissions; `content` catalog/categories/attributes/content/review moderation; `support` orders/tracking, messages, settings, payments/refunds, review moderation. Combined roles are a union, not implicit admin.
- Admin domains: `src/server/admin-products.ts`, `admin-orders.ts`, `admin-users.ts`, `admin-content.ts`, `admin-upload.ts`. Mutations should gate permission, validate, perform DB operation/transaction, and revalidate relevant paths.
- Admin bootstrap uses `ADMIN_EMAIL` when the user has no staff roles; review `src/lib/staff.ts` before modifying bootstrap behavior.
- Local image uploads write to `public/uploads`; database row creation and file writes are separate operations.

## Non-negotiable project conventions

1. Persian UI: root `lang="fa"`, `dir="rtl"`; use only local Doran FaNum (`--font-doran`), no generic/third-party fallback fonts.
2. All user-facing digits go through `toFa()` (`src/lib/fa.ts`); display prices with `formatToman()`.
3. Prices and totals are toman in DB/UI/business logic. Convert to rial only immediately at gateway integration; never scatter `* 10` conversions.
4. Use the local icon manifest and shared `Icon` component; inspect existing assets before adding/replacing images or icons.
5. Use Server Components by default; client components only for genuine browser interactivity. Do not put server data into Zustand.
6. Validate and authorize every sensitive mutation on the server; never trust client user IDs, prices, totals, roles or stock.
7. Server actions return `{ ok: true, data? } | { ok: false, error: string }`; user-facing errors are clear Persian and must not expose SQL, stack traces, secrets or internal paths.
8. Preserve Figma fidelity and existing conventions; smallest safe change, no unrelated redesign/refactor/dependencies. For UI, inspect local `.fig`/imports/icons first. Correct known Figma typos (`کسسوری`→`اکسسوری`, `Abous`→`About`), remove invisible U+2028 in logo text, do not use fake Figma business values as live data.
9. Before editing, inspect current status and relevant callers/tests; preserve user changes. Never run seed/migrations or real payment/network operations without explicit task need and safeguards.
10. For schema changes, inspect migration history and data impact; generate/apply migrations only when explicitly in scope. Do not assume `db:seed` is harmless: it deletes/resets seeded data.

## Static-review risks found on 2026-10-14 (re-verify before acting)

These are source-derived findings, not exploit demonstrations or runtime verification:

- **Payment callback:** `src/app/payment/callback/route.ts` has `redirect()` calls inside broad `try/catch`; Next redirect throws, so success may be caught as failure. A catch-path update appears keyed by order ID without owner scope. Real verification should bind authority/provider and amount to the stored payment and enforce pending/idempotent settlement. The real paid branch did not appear to decrement stock/increment sold count; mock settlement does. Inspect current exact source before repair.
- **Order creation/settlement:** `src/lib/order-actions.ts` checks stock non-transactionally; duplicate lines can bypass combined quantity validation; optional address/shipping values require stronger existence/ownership/validity checks. Concurrent purchases can oversell. `src/lib/pay-actions.ts` has an exported server action taking caller-supplied uid; confirm authorization at boundary. Make settlements transactional, locked/idempotent before changing inventory.
- **Admin dashboard authorization:** `dashboard.read` can expose aggregate/recent order/customer/payment data to content staff lacking those domain permissions; support may see product data/links without product permission. Enforce field-level/domain permission on dashboard queries and data.
- **Admin product UX/data:** create/edit routes appeared to use `ProductEdit` without a category selector; a separate `ProductNew` component has one but is not used there. Attribute matching may conflate color and size with identical labels. Image primary/reorder behavior and local-upload validation/storage lifecycle deserve review.
- **Admin concurrency:** order transitions and stock adjustment use read-then-write patterns without row locks/CAS; refund and last-admin paths already show stronger locking patterns.
- **Admin marketing:** static review found `src/app/admin/marketing/page.tsx` directly imports/calls `toLocalInput` from a `'use client'` module; Next server/client boundary concern. Validate with route/build before fixing.
- **Auth delivery:** OTP codes are logged, not delivered through a real provider in inspected code. Treat as non-production-ready until integration is intentionally configured.
- **Health/API:** `/api/health` may expose raw DB error text; `/api/products` appeared to return first 24 rows without active-status filtering. Re-check before public API changes.
- **Historical docs:** `PLAN.md` and `ADMIN_PANEL_PLAN.md` are planning references, not authoritative implementation inventories; verify status in source. `ADMIN_PANEL_PLAN.md` has stale missing-feature claims.
- **Sensitive fixture warning:** `init.sql` contains seeded auth/session records and credential-derived data. Never quote or copy its rows/hashes into docs; do not use as production initialization without reviewing/replacing its fixture content.

## Validation and repo state at review

- `npm test -- --no-cache`: **PASS**, 10 test files, 57 tests.
- `npm run typecheck -- --incremental false`: **PASS**, `tsc --noEmit`.
- `npm run lint`: **PASS with 2 warnings, 0 errors**: unused `id` in `src/app/page.tsx`; unused `setMsg` in `src/components/shop/AccountAddresses.tsx`.
- Git working tree was clean at initial review. No source files were changed by this review. No production server/database/payment flow was exercised; admin/backend risks above are static analysis only.

## Commands

```bash
npm run dev
npm run typecheck
npm test
npm run lint
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed  # development only; inspect seed behavior before use
```

## First steps in a future task

1. Read this file, then inspect `git status --short`.
2. Read the exact current target source and its callers/tests; source code outranks this summary if it has changed.
3. For design work, inspect local `.fig`/`.figma/imports/`, `globals.css`, icon manifest and nearby components.
4. State intended files/purpose before edits; keep changes narrowly scoped.
5. Run focused tests, then `npm run typecheck` and `npm test`; run lint/build when relevant. Report actual command results and any static vs runtime uncertainty.
