# اکسسوری آس — پلن کامل (فاز اول: فول‌شاپ لوکال)

> Figma: `4RqKMjYhwQ5FALfZdEbg6V` node `708:439` Body 1440×2447 — Content + Footer. فونت بعداً (فعلاً سیستمی). DB: MySQL لوکال. پرداخت: درگاه ایرانی.

## 0. تصمیم‌های استک (سرچ 2026)

- **Next 16.3.5 + React 19.2 + TS + App Router + `src/` + Tailwind v4 + ESLint 9 + Turbopack** — دیفالت رسمی 2026، Node ≥20.9 (لوکال 22.23.2 اوکی).
- **ORM: Drizzle** (نه Prisma). دلیل: code-first بدون codegen، SQL شفاف، ~12KB، MySQL فرست‌کلاس، `sql` template با تایپ نسبی، مایگریشن SQL خوانا. Prisma 7 خوب شده ولی codegen + حجم اضافه برای تک‌نفره نمی‌ارزد.
- **Auth: Better Auth** (نه Auth.js). دلیل: Auth.js maintenance-only از 2026، تیمش رفته Better Auth، ورسل خریده، پلاگین 2FA/passkey/org آماده، آداپتر Drizzle بیلت‌این. سشن دیتابیسی (revoke واقعی).
- **اعتبارسنجی: Zod + React Hook Form + resolvers** — استاندارد 2026، یک اسکیما کلاینت+سرور.
- **استیت: TanStack Query (سروراستیت) + Zustand (کلاینت‌استیت: سبد، فیلتر UI)** — هرگز دیتای API داخل Zustand نه.
- **UI: shadcn/ui + Radix + CVA + lucide-react** — کد داخل ریپو، قابل ویرایش، RTL دستی.
- **پرداخت: `zarinpal-node-sdk` رسمی** (`payments.create` + `getRedirectUrl` + `verifications.verify`، مبلغ ریال IRR) **+ Zibal با REST مستقیم** (پکیج `zibal` ناپایدار، `init is not a function` — fetch به `/v1/request` و `/v1/verify`). مبالغ فیگما تومان → ×10 برای ریال.
- **تست: Vitest** (یونیت) + Playwright بعداً. فعلاً یک self-check برای اعداد فارسی/قیمت.

## 1. معماری

```
src/
  app/
    layout.tsx                # rtl/fa، تم فیگما
    providers.tsx             # QueryClientProvider
    page.tsx                  # فروشگاه (Figma Body)
    products/[slug]/page.tsx
    cart/page.tsx  checkout/page.tsx
    payment/callback/route.ts # verify زرین‌پال/زیبال
    api/health/route.ts  api/products/route.ts  api/orders/route.ts
    admin/  auth/
  components/
    ui/                       # shadcn (button/badge/input/...)
    shop/ ProductCard FiltersBar SortBar OffersCarousel Header Footer CartDrawer
  db/ index.ts schema.ts seed.ts  drizzle/
  lib/ env.ts fa.ts price.ts auth.ts auth-client.ts payment/{zarinpal,zibal}.ts upload.ts
  stores/ cart.ts  hooks/ use-products.ts
```

- Server Component دیفالت؛ `use client` فقط جزیره‌های تعاملی (کارت، فیلتر، سبد).
- کش: لیست محصولات `revalidate: 60` + `revalidateTag('products')` بعد از تغییر ادمین. سبد/سفارش `no-store`.
- Server Actions برای mutation (سفارش، آدرس) با Zod؛ Route Handler فقط callback پرداخت و webhook.

## 2. دیتامدل MySQL (Drizzle)

`user/session/account/verification` (Better Auth) + :

- `categories(id, slug unique, title, parent_id?)`
- `products(id, slug unique, title, category_id→categories, price_toman, old_price_toman?, discount_pct?, stock, status, created_at)` — ایندکس slug/status/category
- `product_images(id, product_id→products cascade, url, sort)`
- `attributes(id, type[color|size|category], label, value)` — سید از فیگما: رنگ 6تایی، سایز 20-24، دسته 7تایی
- `product_attributes(product_id, attribute_id)` — pk مرکب
- `addresses(id, user_id, province, city, detail, postal, phone)`
- `orders(id, user_id?, status[pending|paid|failed|cancelled], total_toman, address_id?, created_at)` + `order_items(id, order_id cascade, product_id, qty, unit_toman)`
- `payments(id, order_id unique, provider[zarinpal|zibal], authority/track, amount_rial, status, ref_id?, raw_json?, verified_at?)`

نام جدول snake_case، charset `utf8mb4` + collate `utf8mb4_persian_ci` برای مرتب‌سازی فارسی.

## 3. نگاشت فیگما 708:439

| فیگما | پیاده‌سازی |
|---|---|
| Nav 1440×88 (دسته‌بندی، فروشگاه، تماس، درباره + حساب/ورود) | `Header` Server + `CartDrawer` client |
| بریدکرامب «اکسسوری آس / فروشگاه» | `Breadcrumb` |
| Offers 1280×350 (کاروسل 5 کارت) | `OffersCarousel` + `revalidate 60` |
| SortBar (357 اکسسوری + 5 مرتب‌سازی) | `SortBar` query-param `?sort=` |
| Filters 330px (موجودی، رنج 250K–25M، 7 دسته، 6 رنگ، سایز) | `FiltersSidebar` + URL searchParams |
| Listing 926px گرید کارت (انگشتر، 4,250,000، 20٪) | `ProductCard` + `ProductGrid` + pagination |
| Footer 638 (فیچر 4تایی، لینک، ولیعصر، تلفن) | `Footer` استاتیک |
| رنگ‌ها `#0A5954 #9E1238 #D6C2A1 #F7FAFA #111C21` | توکن Tailwind v4 `@theme` |

باگ‌های فیگما (فیکس در کد، نه بلاکر): 3 لیبل TELEGRAM تکراری، 5 فریم هم‌نام Price range، دیتای placeholder تکراری، `U+2028` در AS accessory.

## 4. پرداخت ایرانی (همین فاز، sandbox)

- `POST /api/checkout` → order pending + `zarinpal.payments.create({amount: total*10, callback_url, description})` → redirect `getRedirectUrl(authority)`.
- `GET /payment/callback?Authority&Status` → `verifications.verify({amount, authority})` → paid → `revalidateTag('products')`. Zibal موازی: `POST .../v1/request {merchant, amount(rial), callbackUrl}` → `trackId` → verify.
- `MERCHANT_ID`, `SANDBOX=true` در `.env`. بدون merchant واقعی = mock authority در dev (کد جدا، نه هک).

## 5. فازبندی

- **P0 (امروز، این تسک):** پلن + بیس بیلدشونده + Drizzle schema/seed + Better Auth پایه + سبد Zustand + health/products API.
- **P1:** کاتالوگ پیکسل‌به‌فیگما (Offers/Sort/Filter/Grid/Header/Footer) + جستجو/پیجینیشن.
- **P2:** سبد + checkout + آدرس + سفارش (Server Actions + Zod).
- **P3:** زرین‌پال/زیبال end-to-end + ادمین (محصول/موجودی/سفارش) + آپلود عکس.
- **P4:** پولیش (سئو/fa متا، سایت‌مپ، PWA، Sentry، ریت‌لیمیت) + دیپلوی VPS.

## 6. قراردادها

- اعداد نمایشی فارسی (`fa.ts`)، محاسبات همیشه number تومان، پرداخت ریال.
- ارور فارسی کاربرپسند؛ لاگ انگلیسی سرور.
- هر Server Action ورودی Zod + خروجی `{ok, data?, error?}`.
- `ponytail:` برای ساده‌سازی عمدی (S3، کوپن، نظرات، SMS واقعی → بعداً).
