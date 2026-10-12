# اکسسوری آس (Accessory AS) — راهنمای کلاد و توسعه

فروشگاه آنلاین اکسسوری‌های زنانه و مردانه با طراحی اختصاصی فیگما.

---

## ۱. فرمان‌های اصلی (Commands)
```bash
npm run dev           # اجرای سرور توسعه روی پورت 3000
npm run typecheck     # بررسی کامل انواع با tsc --noEmit (همیشه باید پاس شود)
npm test              # اجرای تست‌های واحد با vitest run
npm run build         # بیلد نهایی Next.js
npm run lint          # بررسی استانداردهای کد با ESLint 9

# دیتابیس (Drizzle + MySQL)
npm run db:generate   # ساخت مایگریشن جدید از روی schema.ts
npm run db:migrate    # اجرای مایگریشن‌ها روی دیتابیس
npm run db:seed       # پر کردن دیتابیس با دیتای اولیه استاندارد
npm run db:studio     # باز کردن رابط وب Drizzle Studio
```

---

## ۲. طراحی و فیگما (Figma Source of Truth)
* **الویت فایل آفلاین:** فایل `accesssory as.fig` در ریشه پروژه مرجع اصلی است. توکن آنلاین فیگما با محدودیت نرخ (Rate Limit 429) مواجه است.
* **رندرهای فریم‌ها:** تصاویر فریم‌های فیگما برای رفرنس بصری در پوشه `.figma/imports/` قرار می‌گیرند (مثال: `1758_530.png` و `2054_7914.png`).
* **آیکون‌ها:** تمامی آیکون‌ها در پوشه `public/icons/` و بر اساس منیفست `public/icons/manifest.json` نگهداری می‌شوند. برای استفاده:
  ```tsx
  import { Icon } from "@/components/ui/Icon";
  <Icon name="icons-20--ring" className="h-5 w-5" />
  ```
* **اصلاح نواقص فیگما:**
  * کاراکتر پنهان خط‌شکن ` ` در متن‌ها و لوگوی `AS accessory` باید پالایش شود.
  * ۳ آیکون تکراری با نام Telegram در فوتر فیگما باید به آیکون‌های مجزای اینستاگرام، تلگرام و واتس‌اپ نگاشت شوند.
  * تایپوهای متنی فیگما اصلاح شوند (مثلاً «کسسوری» به «اکسسوری»).

---

## ۳. تایپوگرافی، قیمت و زبان (Strict UI Rules)
* **فونت منحصراً Doran FaNum:**
  * در تمام صفحات و کامپوننت‌ها فقط فونت `Doran FaNum` مجاز است (`--font-doran`).
  * **هیچ فونت فالبکی (نه Vazir، نه Tahoma، نه sans-serif عمومی) مجاز نیست.**
* **اعداد کاملاً فارسی:**
  * تمامی اعداد در ظاهر کاربر (قیمت، تعداد، درصد تخفیف، تاریخ، کد سفارش و رتبه) باید از تابع `toFa()` در `src/lib/fa.ts` عبور کنند.
* **واحد پول:**
  * در کل اپلیکیشن، استورها و دیتابیس **تومان** است (`formatToman()`).
  * تبدیل به ریال (ضرب در ۱۰ با `tomanToRial()`) **فقط و فقط** در لایه اتصال به درگاه بانکی (`src/lib/payment/`) مجاز است.
* **راست‌چین:** جهت سند `dir="rtl"` و زبان `lang="fa"`.

---

## ۴. پالت رنگ و تم (Tailwind CSS v4)
* رنگ‌های ثبت‌شده در `globals.css`:
  * برند اصلی: `--color-brand: #0a5954` (کدهای هگز مجاور `#0A5A55`)
  * سبز عمیق تیره: `--color-brand-deep: #00201d`
  * شرابی تخفیف/خطا: `--color-wine: #9e1238`
  * شن/طلایی: `--color-sand: #d6c2a1`
  * پس‌زمینه صفحات: `--color-mist: #f7fafa` (یا `#f8faf9`)
  * متن تیره: `--color-ink: #111c21` (یا `#161b22`)
  * متن کم‌رنگ: `--color-muted-fg: #4a5463`
  * بوردر دیفالت: `#D6DBDE` یا `#E8EBED`

---

## ۵. معماری و استیت (Architecture & Conventions)
* **Server Components به عنوان پیش‌فرض:** صفحات و بخش‌های دیتامحور در سرور رندر می‌شوند (`revalidate = 60`).
* **استفاده از `"use client"` فقط در صورت نیاز:** تعاملات کاربر مثل گالری محصول، فیلترها، مودال‌ها، تایمرها و سبد خرید.
* **سبد خرید (Cart State):** استور Zustand در `src/stores/cart.ts` با میدل‌ویر `persist` در LocalStorage برای کاربران مهمان؛ دیتای API در Zustand ذخیره نمی‌شود.
* **منطق محاسباتی مستقل:** توابع اعتبارسنجی موبایل/شبا/کدپستی و محاسبه جمع سبد و کوپن در `src/lib/checkout.ts` بدون وابستگی به دیتابیس نوشته شده و پوشش تست Vitest دارند.
* **پاسخ سرور اکشن‌ها:**
  ```ts
  type ActionResponse<T = unknown> = { ok: true; data?: T } | { ok: false; error: string };
  ```
  ارورها همیشه به زبان فارسی واضح و کاربرپسند باشند.

---

## ۶. اصول مهندسی و انضباط کد (YAGNI & Senior Discipline)
* کدی ننویس که هنوز نیاز نشده است (YAGNI). ساده‌ترین کدی که کار می‌کند اولویت دارد.
* پیش از پایان کار و تحویل، اجرای `npm run typecheck` و `npm test` اجباری است و هر دو باید سبز باشند.
* کامیت‌ها بر اساس استاندارد Conventional Commits (مانند `feat(...)`, `fix(...)`, `refactor(...)`).


# 👑 ACCESSORY AS — MASTER PROJECT INSTRUCTIONS

> These instructions are the authoritative engineering contract for the **Accessory AS** project.
>
> Follow them strictly for every task unless the user explicitly overrides a specific rule.
>
> **Primary goals:**
> 1. Pixel-accurate implementation of the approved Figma design.
> 2. Preserve the existing architecture.
> 3. Keep the implementation simple, maintainable, and production-safe.
> 4. Never introduce unnecessary abstractions, dependencies, or redesigns.
> 5. Never sacrifice visual fidelity for implementation convenience.

---

# 0. CORE OPERATING MODE

You are working on a production-grade Persian RTL e-commerce application named:

**Accessory AS**

Your role is not to redesign the product.

Your role is to:

- inspect the existing implementation,
- understand the Figma design,
- preserve the existing project architecture,
- implement the requested task,
- verify visual and functional correctness,
- run validation/tests,
- report exactly what changed.

## Golden Rule

**Do not guess when the answer already exists in the repository or Figma assets.**

Before inventing:

- spacing,
- font sizes,
- colors,
- icons,
- assets,
- border radii,
- shadows,
- layout dimensions,
- responsive behavior,
- component structure,

first inspect the existing project and Figma-derived resources.

---

# 1. SOURCE OF TRUTH PRIORITY

When multiple sources conflict, use this priority order:

1. Explicit instruction from the user for the current task.
2. Offline Figma source: `accesssory as.fig`
3. Existing renders/assets inside `.figma/imports/`
4. Existing project design tokens and reusable components.
5. Online Figma file.
6. Existing implementation.
7. Your own interpretation.

Never silently override a higher-priority source with a lower-priority source.

---

# 2. FIGMA — DESIGN SOURCE OF TRUTH

## Primary Figma Source

The primary design source is the offline file:

`accesssory as.fig`

located at the project root.

Because the Figma API may return aggressive:

`HTTP 429 Rate Limit`

all design extraction and UI matching must **first** use:

- `accesssory as.fig`
- `.figma/imports/`
- existing exported assets
- local icon manifest
- existing screenshots/renders

Do not depend on the Figma API when the required information is already available locally.

## Online Figma

Online design:

`https://www.figma.com/design/uULk7Hd31ZfNTyUEboyALX/accesssory-as?node-id=0-1`

The Figma token must be loaded from an environment variable.

Recommended:

`FIGMA_ACCESS_TOKEN`

### Security rule

Never:

- hardcode the Figma token,
- commit it,
- print it,
- place it in source code,
- place it in logs,
- expose it in browser/client code,
- copy it into documentation.

If authentication is required and the environment variable does not exist, report that instead of embedding credentials.

---

# 3. PIXEL-PERFECT IMPLEMENTATION POLICY

Visual accuracy has high priority.

Do not implement a generic approximation of the Figma design.

For every UI task inspect, when applicable:

- frame width and height
- content width
- container alignment
- horizontal spacing
- vertical spacing
- gaps
- padding
- margins
- typography
- font weight
- font size
- line height
- letter spacing
- colors
- gradients
- shadows
- border widths
- border colors
- border radius
- icon size
- icon position
- image crop
- object positioning
- section height
- grid behavior
- responsive behavior
- hover states
- active states
- disabled states
- loading states
- empty states
- error states

Do not make arbitrary visual improvements that do not exist in the design.

### If Figma and the current UI differ

Assume Figma is correct unless:

- the user explicitly says otherwise,
- the Figma contains one of the known content bugs documented below.

---

# 4. KNOWN FIGMA QUIRKS — FIX DURING IMPLEMENTATION

These Figma mistakes must **not** be reproduced.

## Logo

The invisible character:

`U+2028`

inside:

`AS accessory`

must be removed before rendering or storing the value.

---

## Persian typo

Replace:

`کسسوری`

with:

`اکسسوری`

---

## English typo

Replace:

`Abous`

with:

`About`

---

## Footer social icons

The three duplicated icons labeled:

`TELEGRAM`

must be mapped to three separate social platforms:

- Instagram
- Telegram
- WhatsApp

Use the correct local assets for each platform.

---

## Fake Figma data

Hardcoded Figma sample data such as:

- `۴۸۳` reviews
- `۴٬۲۵۰٬۰۰۰` price

must not become production business data.

When dynamic data exists, use the real database value.

Figma is authoritative for presentation, not for fake sample business data.

---

# 5. TYPOGRAPHY — STRICT DORAN-ONLY POLICY

The entire application uses:

**Doran FaNum**

Only.

Font configuration:

`src/app/fonts.ts`

CSS variable:

`--font-doran`

Supported weights range from:

`Thin` → `ExtraBold`

## Forbidden fonts

Never introduce:

- Vazir
- Vazirmatn
- Tahoma
- Arial
- system-ui
- sans-serif
- custom inline fallback fonts
- third-party fonts

Do not create CSS such as:

`font-family: sans-serif`

even as a fallback.

Use the existing Doran font infrastructure.

---

# 6. PERSIAN NUMBER POLICY

No English digit:

`0 1 2 3 4 5 6 7 8 9`

may appear in normal user-facing UI.

All visible:

- prices
- dates
- quantities
- ratings
- review counts
- phone numbers where appropriate for presentation
- counters
- totals
- pagination numbers

must pass through:

`toFa()`

located in:

`src/lib/fa.ts`

Example principle:

Internal data may stay numeric.

Presentation must be Persian.

Do not manually convert digits when a helper already exists.

---

# 7. CURRENCY POLICY — TOMAN ONLY

The application business currency is:

**تومان**

Use:

`formatToman()`

for display.

## Database

Prices are stored as تومان.

## UI

Prices are displayed as تومان.

## Forms

Price input semantics are تومان.

## Payment gateway boundary

Conversion from تومان to ریال is permitted **only** immediately before sending payment amounts to a gateway.

Use:

`tomanToRial()`

inside:

`src/lib/payment/`

Expected conversion:

`toman × 10 = rial`

### Never

- store prices internally as ریال,
- show ریال in normal storefront UI,
- scatter `* 10` conversions throughout the codebase,
- convert currency inside UI components.

Currency conversion belongs only at the payment integration boundary.

---

# 8. RTL AND LANGUAGE

The entire product is Persian-first.

Root HTML requirements:

`dir="rtl"`

`lang="fa"`

Breadcrumb separator:

`/`

Do not introduce LTR layout assumptions into Persian pages.

Any LTR-specific content such as:

- email
- IBAN
- technical IDs
- URLs

may use isolated LTR direction only when required.

---

# 9. DESIGN TOKENS

The canonical theme is defined in:

`src/app/globals.css`

using Tailwind v4:

`@theme inline`

Primary tokens:

### Brand

`--color-brand: #0A5954`

Nearby Figma visual value may appear as:

`#0A5A55`

---

### Brand Deep

`--color-brand-deep: #00201D`

---

### Wine / Error / Discount

`--color-wine: #9E1238`

Nearby Figma value:

`#9F1239`

---

### Sand / Luxury Accent

`--color-sand: #D6C2A1`

---

### Main Background

`--color-mist: #F7FAFA`

Nearby Figma value:

`#F8FAF9`

---

### Main Ink

`--color-ink: #111C21`

Nearby Figma value:

`#161B22`

---

### Muted Text

`--color-muted-fg: #4A5463`

---

## Token policy

Prefer semantic theme tokens over duplicated hardcoded values.

Do not create a second design system.

Do not introduce a new palette unless explicitly requested.

Small Figma variations may be used only when pixel-level fidelity requires them.

---

# 10. TAILWIND CSS

The project uses:

**Tailwind CSS v4**

Respect the existing styling architecture.

Before adding:

- new utility abstractions,
- CSS variables,
- custom classes,
- component-specific global styles,

check whether an equivalent token/class already exists.

Do not create unnecessary custom CSS.

---

# 11. PRICE RANGE COMPONENT

The dual-handle price range filter must follow the existing:

`.shop-range`

implementation.

Do not replace it with an unrelated third-party slider unless explicitly requested.

---

# 12. ICON SYSTEM — STRICT ASSET PIPELINE

Canonical icon directory:

`public/icons/`

Icons are SVG files using size-prefixed naming conventions such as:

`icons-20--...`

`icons-24--...`

The authoritative mapping file is:

`public/icons/manifest.json`

Use the shared component:

```tsx
import { Icon } from "@/components/ui/Icon";

<Icon
  name="icons-20--ring"
  className="h-5 w-5"
/>
```

## Forbidden icon behavior

Do not:

- draw random SVGs manually,
- install icon libraries for icons that already exist,
- use emoji instead of icons,
- recreate icons with CSS,
- use unrelated local icons,
- bypass `manifest.json` without a valid reason.

Always search the local icon assets first.

---

# 13. IMAGE ASSET POLICY

Before adding a new image asset:

1. Search the existing Figma exports.
2. Search `public/`.
3. Search `.figma/imports/`.
4. Check whether the asset already exists under another Figma-generated filename.

Do not duplicate assets unnecessarily.

Preserve image quality and expected crop behavior.

Use the existing Next.js image strategy when appropriate.

---

# 14. DATABASE

ORM:

**Drizzle ORM**

Driver:

**mysql2**

Canonical schema file:

`src/db/schema.ts`

Do not create parallel schema definitions.

---

# 15. DATABASE TABLES

Authentication / Better Auth:

- `user`
- `session`
- `account`
- `verification`

Store:

- `categories`
- `products`
- `product_images`
- `attributes`
- `product_attributes`
- `reviews`

Checkout / User:

- `addresses`
- `orders`
- `order_items`
- `order_events`
- `payments`
- `favorites`
- `coupons`
- `shipping_methods`
- `wallet_refunds`

Admin / CMS:

- `staff_roles`
- `banners`
- `pages`
- `faqs`

Before creating a new table, confirm that the requirement cannot be represented cleanly using the existing schema.

Follow YAGNI.

---

# 16. IRANIAN DATA VALIDATION

Canonical validation logic lives in:

`src/lib/checkout.ts`

Mobile:

```ts
/^09\d{9}$/
```

Helper:

`isValidMobile`

---

Postal code:

```ts
/^\d{10}$/
```

Constant:

`POSTAL_RE`

---

Iranian IBAN:

```ts
/^IR\d{24}$/i
```

Constant:

`IBAN_RE`

Do not duplicate these regexes in multiple components.

Reuse central validation helpers.

---

# 17. ARCHITECTURE

The application follows a server-first architecture.

Default assumption:

**Server Component**

Use Client Components only when browser-side interactivity genuinely requires them.

---

# 18. SERVER COMPONENT POLICY

Page-level components should remain React Server Components by default.

For store/product pages use:

`revalidate = 60`

where consistent with the existing architecture.

Prefer:

server fetch → server render → small client islands

over:

large client page → client fetch → global state

---

# 19. CLIENT COMPONENT POLICY

Use:

`"use client"`

only when needed.

Known acceptable client-side areas include:

### Product gallery

`ProductDetailGallery`

For:

- image slider
- thumbnails
- navigation interactions

---

### Product variants and cart

`ProductInfoPanel`

For:

- color selection
- size selection
- quantity interaction
- add-to-cart behavior

---

### Store filters

`FiltersSidebar`

`SortBar`

For:

- interactive filtering
- sorting controls

---

### Forms / overlays

Examples:

- OTP verification
- Popover
- Modal
- `ReviewModal`

Do not convert entire routes to Client Components just because one nested control is interactive.

---

# 20. ZUSTAND POLICY

Zustand is intentionally limited.

Canonical store:

`src/stores/cart.ts`

Use:

`persist`

for the local guest cart.

## Never use Zustand as a server-data cache.

Do not put:

- products
- categories
- orders
- users
- reviews
- CMS data
- database query results

into global Zustand state unless there is an explicit architectural requirement.

Server state belongs on the server.

---

# 21. SERVER ACTION CONTRACT

All mutation Server Actions must return:

```ts
type ActionResponse<T = unknown> =
  | {
      ok: true;
      data?: T;
    }
  | {
      ok: false;
      error: string;
    };
```

User-facing errors must be:

- Persian
- understandable
- safe to display
- non-technical

Example:

Good:

`شماره موبایل واردشده معتبر نیست.`

Bad:

`ER_DUP_ENTRY: SQLSTATE 23000`

Technical error details belong only in server logs.

---

# 22. ERROR HANDLING

Never expose:

- SQL errors
- stack traces
- environment variables
- credentials
- API secrets
- internal file paths unnecessarily
- raw payment gateway secrets

to the user.

UI errors should explain what the user can do next.

---

# 23. LOADING / EMPTY / ERROR STATES

A feature is not complete if only the happy path exists.

For relevant UI sections implement:

- loading state
- empty state
- error state
- success state
- disabled state

Use existing components such as:

`CardSkeleton`

instead of inventing unrelated loading patterns.

---

# 24. COMPONENT REUSE

Before creating a component:

1. Search the repository.
2. Check existing UI primitives.
3. Check similar pages.
4. Check whether the component can be extended cleanly.

Do not duplicate components because creating a new file is easier.

But also do not force unrelated responsibilities into one giant component.

Prefer small, clear boundaries.

---

# 25. YAGNI

**You Aren't Gonna Need It.**

Do not add:

- speculative abstraction layers,
- unused helpers,
- generic factories,
- unnecessary providers,
- premature caching,
- unnecessary context providers,
- unused props,
- unnecessary libraries,
- future-proofing code without a current requirement.

Solve the requested problem with the smallest clean solution.

---

# 26. DEPENDENCY POLICY

Do not install a new package when the task can be solved reasonably with:

- existing project dependencies,
- React,
- Next.js,
- Tailwind,
- browser APIs,
- existing utilities.

Before installing anything:

1. inspect `package.json`,
2. search existing utilities,
3. confirm the dependency is truly necessary.

A new dependency must solve a real current requirement.

---

# 27. DO NOT REWRITE WORKING SYSTEMS

Avoid broad refactors unrelated to the requested task.

If asked to fix:

`ProductCard`

do not rewrite:

- authentication,
- checkout,
- database schema,
- header architecture,
- global state,

unless the task actually requires it.

Prefer focused diffs.

---

# 28. BEFORE EDITING CODE

Before changing files:

1. Understand the user's task.
2. Inspect relevant files.
3. Inspect related components.
4. Inspect related design source.
5. Inspect existing helpers/tokens.
6. Identify the minimum files that need modification.
7. Preserve existing patterns.

Before editing, briefly state:

**Files:**
the files you expect to modify.

**Purpose:**
what the changes will accomplish.

Do not provide a long essay.

---

# 29. IMPLEMENTATION STRATEGY

For each task:

### Step 1 — Inspect

Understand existing code and design.

### Step 2 — Compare

Identify the gap between implementation and expected behavior/design.

### Step 3 — Implement

Apply the smallest correct change.

### Step 4 — Validate

Check:

- UI accuracy
- RTL
- typography
- Persian digits
- responsive behavior
- TypeScript
- state behavior
- database interaction where applicable

### Step 5 — Test

Run required checks.

### Step 6 — Report

Explain exactly what changed and the validation result.

---

# 30. RESPONSIVE DESIGN

Do not implement desktop-only UI unless explicitly requested.

Inspect responsive behavior from:

- Figma frames,
- existing design conventions,
- existing components.

Verify at minimum:

- mobile
- tablet where relevant
- desktop

Avoid arbitrary breakpoints if existing Tailwind breakpoints already fit.

Do not destroy RTL behavior on narrow screens.

---

# 31. UI CONTENT RULES

Do not hardcode dynamic store data when it belongs in the database.

Examples:

Bad:

```tsx
<span>۴۸۳ دیدگاه</span>
```

when review count exists in the database.

Good:

derive the count from actual review data and format it with:

`toFa()`

The same rule applies to:

- product price
- stock
- discount
- rating
- category name
- images
- order totals
- shipping methods

---

# 32. ACCESSIBILITY

Preserve accessibility while matching Figma.

Use:

- semantic HTML
- button elements for actions
- labels for inputs
- alt text for meaningful images
- keyboard-accessible interactions
- focus behavior for dialogs/popovers
- appropriate ARIA only where needed

Do not sacrifice accessibility for visual similarity.

---

# 33. PERFORMANCE

Avoid unnecessary Client Components.

Avoid unnecessary re-renders.

Avoid shipping server-only data or logic to the browser.

Use appropriate Next.js primitives.

Do not prematurely optimize, but avoid obvious regressions such as:

- huge client bundles,
- duplicate data fetching,
- unbounded queries,
- unnecessary image loading,
- loading every product image eagerly.

---

# 34. SECURITY

Never expose secrets.

Never move secret values into:

`NEXT_PUBLIC_*`

unless the value is intentionally public.

Validate mutations on the server.

Do not trust client-provided:

- prices
- discounts
- user IDs
- order totals
- admin status
- shipping totals
- role information

Sensitive business calculations must be verified server-side.

---

# 35. AUTHORIZATION

Authentication does not automatically mean authorization.

For protected operations verify the current user and permission server-side.

For admin/staff operations respect existing:

`staff_roles`

architecture.

Never rely only on hidden UI buttons to secure actions.

---

# 36. PAYMENT SAFETY

Payment totals must be derived server-side.

Never accept the final payable amount directly from client state without validation.

Currency conversion:

`tomanToRial()`

must happen only at the payment provider boundary.

Keep provider-specific logic inside:

`src/lib/payment/`

---

# 37. DATABASE SAFETY

Do not modify schema casually.

When a schema change is genuinely necessary:

- inspect current schema,
- preserve existing data semantics,
- avoid destructive migration behavior,
- explain the reason,
- add/update migrations according to the existing project workflow.

Do not rename or delete production columns merely for code cleanliness.

---

# 38. CODE QUALITY

Prefer code that is:

- short
- explicit
- typed
- readable
- locally understandable

Avoid cleverness.

Avoid deeply nested conditionals.

Avoid unnecessary comments that simply repeat what the code does.

Comments should explain:

**why**

not:

**what**

---

# 39. TYPESCRIPT POLICY

Do not introduce avoidable:

`any`

Prefer inferred types where obvious.

Create explicit types when they clarify contracts.

Do not duplicate types already derived from:

- Drizzle schema,
- component props,
- existing domain types.

---

# 40. NO SILENT FAILURES

Do not swallow errors with empty catches such as:

```ts
try {
  // ...
} catch {}
```

Errors must either:

- be handled intentionally,
- be logged server-side,
- be converted into a safe `ActionResponse`,
- or be allowed to propagate to an appropriate error boundary.

---

# 41. TESTING — DEFINITION OF DONE

A task is not finished merely because the code looks correct.

Before declaring completion run:

```bash
npm run typecheck
```

Expected:

`tsc --noEmit`

with zero TypeScript errors.

---

Then run:

```bash
npm test
```

Expected:

`vitest run`

All existing tests must pass.

Current baseline should include at least:

`23+`

passing tests.

Do not modify tests just to hide a real regression.

---

# 42. WHEN TESTS FAIL

If a test fails:

1. determine whether the implementation is wrong,
2. determine whether the test is legitimately outdated,
3. fix the root cause.

Do not:

- delete tests,
- skip tests,
- weaken assertions,
- change expected values

merely to make CI green.

If an existing unrelated test is already failing, clearly report it.

---

# 43. VISUAL DEFINITION OF DONE

For visual tasks, completion requires more than passing TypeScript.

Compare the implementation against the design for:

- proportions
- spacing
- typography
- color
- icons
- alignment
- content density
- responsive behavior

If a page is technically correct but visually far from Figma, the task is not complete.

---

# 44. FORBIDDEN SHORTCUTS

Never use these as shortcuts:

- replacing Figma icons with generic Lucide icons without checking assets,
- replacing Doran with another font,
- using English digits,
- hardcoding fake prices/reviews,
- making the whole page `"use client"`,
- putting server data in Zustand,
- bypassing existing helpers,
- creating duplicate design tokens,
- hiding TypeScript errors,
- skipping tests,
- redesigning sections without permission,
- introducing unnecessary dependencies.

---

# 45. REPOSITORY PRESERVATION

Respect the existing architecture.

Do not rename or reorganize large directory trees unless explicitly requested.

Do not run destructive commands without a clear requirement.

Avoid touching unrelated files.

Keep diffs focused.

---

# 46. GIT SAFETY

Never automatically:

- force push,
- rewrite history,
- delete branches,
- reset unrelated work,
- discard uncommitted user changes,
- commit secrets.

When local changes already exist, preserve them.

Do not assume every uncommitted change belongs to you.

---

# 47. EXISTING USER CHANGES

The repository may contain work created manually or by another AI agent.

Never overwrite unrelated existing changes.

Before editing a file with existing modifications, understand the current state and preserve unrelated work.

---

# 48. WHEN INFORMATION IS UNCLEAR

Before guessing:

1. inspect code,
2. inspect Figma,
3. inspect local imports/assets,
4. inspect similar existing implementation.

If sufficient evidence exists locally, make the best supported implementation.

Only ask the user when a genuinely product-level decision cannot be derived from the repository or design.

---

# 49. PRIORITY DURING CONFLICTS

If architectural elegance conflicts with the approved design:

preserve design fidelity without violating security or correctness.

If the design contains fake data:

preserve the appearance, not the fake data.

If the design contains a known typo:

use the corrected content.

If existing implementation conflicts with Figma:

follow Figma unless the existing behavior represents a known functional requirement.

---

# 50. TASK COMPLETION REPORT

At the end of every implementation task return a concise report in this format:

```text
FILES_CHANGED:
- path/to/file: what changed
- path/to/file: what changed

IMPLEMENTED:
- ...
- ...

VALIDATION:
- npm run typecheck: PASS / FAIL
- npm test: PASS / FAIL
- Visual/RTL check: PASS / FAIL

NOTES:
- Only include important limitations or decisions.
```

Do not flood the final response with unnecessary details.

---

# 51. FINAL QUALITY GATE

Before saying a task is complete, mentally verify:

- Does it match Figma?
- Did I inspect local Figma resources before guessing?
- Did I preserve RTL?
- Is Doran the only UI font?
- Are visible digits Persian?
- Are prices in تومان?
- Is ریال limited to the payment boundary?
- Did I reuse the icon system?
- Did I avoid fake Figma business data?
- Did I keep Server Components as the default?
- Did I avoid unnecessary Zustand state?
- Are Server Actions returning `ActionResponse`?
- Are errors safe and Persian?
- Are loading/empty/error states handled?
- Did I avoid unnecessary dependencies?
- Did I keep the diff focused?
- Did TypeScript pass?
- Did tests pass?
- Did I preserve unrelated user work?

If any answer is **no**, the task is not complete yet.

---

# 52. PROJECT PHILOSOPHY

Accessory AS should feel:

- premium
- minimal
- calm
- precise
- Persian-native
- visually faithful to Figma

Engineering should feel:

- simple
- predictable
- typed
- server-first
- maintainable
- secure

The preferred solution is not the most complicated solution.

The preferred solution is:

**the smallest implementation that is visually accurate, architecturally correct, tested, and production-ready.**