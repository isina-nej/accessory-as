# نقشه‌ی پیاده‌سازی پنل مدیریت Accessory AS

تاریخ بررسی: ۱۴۰۵/۰۷/۲۰

آخرین به‌روزرسانی تحقیق UI: ۱۴۰۵/۰۷/۲۰

وضعیت سند: برنامه‌ریزی — بدون تغییر application code، dependency، schema یا migration

## خلاصه‌ی اجرایی

پروژه در حال حاضر یک پنل مدیریت اولیه اما پراکنده دارد. routeهای اصلی وجود دارند و بخش قابل‌توجهی از CRUD از طریق Server Action و Drizzle نوشته شده است، اما پنل هنوز «مرجع کامل و امن مدیریت فروشگاه» نیست. مهم‌ترین کار، اضافه‌کردن کتابخانه‌ی جدید نیست؛ اول باید مجوزها، پوشش موجودیت‌ها، تراکنش‌های حساس، مدل مشاهده‌ی داده و تجربه‌ی کاربری پنل یکپارچه شوند.

تحقیق جدید درباره‌ی NextAdmin، Studio Admin و Shadcn Dashboard تصمیم معماری را دقیق‌تر کرد: **NextAdmin به‌عنوان منبع الگو و componentهای منتخب UI ارزش بررسی دارد، اما نباید به‌صورت کامل clone/merge یا به‌عنوان backend، auth یا CRUD layer وارد پروژه شود.** منطق، دیتابیس، Better Auth، roleها، Server Actionها و payment فعلی مرجع باقی می‌مانند.

پیشنهاد این سند، بازسازی تدریجی و کم‌ریسک است: ابتدا مجوز و زیرساخت مشترک، سپس یک spike جدا و read-only برای ارزیابی UI، بعد انتقال محدود componentهای تأییدشده و در ادامه ماژول‌های عملیاتی اصلی. هیچ migration یا حذف داده‌ای نباید بدون بررسی دیتابیس واقعی و تأیید جداگانه انجام شود.

## تصمیم معماری UI

### تصمیم پیشنهادی

```text
NextAdmin (ارزیابی و الگوگیری محدود)
              ↓
Admin UI primitives منتخب و سازگار با پروژه
              ↓
AdminShell فعلی/تکمیل‌شده
              ↓
Server Actions و queryهای فعلی
              ↓
Drizzle + MySQL فعلی
```

NextAdmin را به‌عنوان یک template و UI toolkit در نظر می‌گیریم، نه محصول ecommerce آماده. هیچ mock REST API، auth، RBAC، schema، payment یا route architecture آن مستقیماً وارد production نمی‌شود.

### چیزهایی که از NextAdmin ممکن است استفاده شوند

پس از تأیید license و بررسی فنی، فقط این دسته‌ها قابل انتقال یا بازسازی هستند:

- ساختار بصری sidebar، header و shell
- cardهای آماری و dashboard layout
- table، pagination و filter bar
- status badge، modal و alert dialog
- loading skeleton و empty/error state
- chartهای مورد نیاز dashboard
- الگوهای accessibility و responsive behavior

هر component باید با Doran FaNum، RTL، رنگ‌های semantic پروژه، آیکون‌های local و معماری Server Component سازگار شود. انتقال کد بدون بررسی dependency یا کپی کل repository مجاز نیست.

### چیزهایی که از NextAdmin وارد نمی‌شوند

- auth و session
- Better Auth Admin plugin و مدل role آن
- mock API و mock data
- Prisma یا هر database layer دیگر
- user/product/order schema
- payment یا ecommerce logic
- routeهای کامل template
- فونت یا design token ناسازگار
- dependencyهایی که component انتخاب‌شده نیاز ندارد

### وضعیت رقیب‌ها

- **NextAdmin:** مناسب‌ترین منبع اولیه برای UI به‌دلیل نزدیکی به Next.js 16، Tailwind v4، table/dashboard و نمونه‌های Better Auth/RBAC؛ اما license repository در metadata رسمی GitHub مشخص نیست و فایل معمول `LICENSE` در مسیر بررسی‌شده پیدا نشد. این موضوع باید قبل از کپی کد روشن شود.
- **Studio Admin:** repository فعال و از نظر UI غنی است و در package خود Next.js 16، React، Tailwind، RHF، Zod و TanStack Table دارد؛ اما auth و backend آن جایگزین مستقیم Better Auth و Server Actionهای ما نیست. فقط fallback مقایسه‌ای است.
- **Shadcn Dashboard:** گزینه‌ی سبک‌تر برای الگوگیری از componentهاست، اما برای عملیات کامل ecommerce و پنل موجود پوشش مستقیم کم‌تری دارد.
- هیچ‌کدام جایگزین Drizzle، MySQL، Better Auth، permissionهای پروژه یا domain logic فعلی نیستند.

### دروازه‌ی تصمیم قبل از ادغام

قبل از هر انتقال کد یا نصب dependency جدید باید یک spike جدا و قابل حذف انجام شود:

1. clone/checkout نسخه‌ی دقیق template خارج از پروژه‌ی اصلی؛
2. بررسی license و شرایط استفاده‌ی تجاری؛
3. اجرای dev/build/lint همان template؛
4. inventory کردن dependencyهای هر component منتخب؛
5. بررسی RTL آزمایشی و Doran FaNum؛
6. بررسی keyboard/focus/accessibility؛
7. مقایسه‌ی screenshot با design tokenهای Accessory AS؛
8. تصمیم درباره‌ی انتقال محدود، بازسازی داخلی یا رد گزینه.

تا پایان این spike، نصب NextAdmin در پروژه‌ی اصلی، تغییر package.json و تغییر routeها ممنوع است.

برچسب شواهد این بخش:

- **CONFIRMED:** repository رسمی فعال و غیرآرشیوی است؛ README فعلی Next.js 16، Tailwind، صفحات/کامپوننت‌های متعدد، dashboardهای مختلف و mock REST API را اعلام می‌کند؛ package فعلی Next.js `16.2.7` و React `19.2.4` را نشان می‌دهد.
- **CONFIRMED:** README changelog درباره‌ی Better Auth و Admin plugin برای RBAC در نسخه‌های جدید صحبت می‌کند.
- **UNKNOWN:** مجوز MIT برای repository اصلی NextAdmin؛ metadata GitHub license ندارد و `main/LICENSE` در بررسی مستقیم پیدا نشد.
- **INFERRED:** استفاده‌ی محدود از componentهای UI می‌تواند با پروژه سازگار باشد؛ این موضوع تا اجرای spike و تست build/RTL قطعی نیست.

پیشنهاد این سند، بازسازی تدریجی و کم‌ریسک است: ابتدا زیرساخت مشترک و امنیت، سپس spike و تصمیم UI، بعد انتقال محدود componentهای تأییدشده و در ادامه پوشش کامل داده‌ها و polish بصری.

## محدودیت‌های صریح این تصمیم

- ادعای «NextAdmin مستقیماً Better Auth فعلی را target می‌کند» به‌عنوان واقعیت معماری پروژه پذیرفته نمی‌شود؛ فقط وجود نمونه/راهنمای Better Auth در changelog رسمی تأیید شده است.
- ادعای «مجوز MIT» تا پیدا شدن متن license معتبر، تأییدنشده است.
- شمارش ستاره‌ها، نسخه‌ها و وضعیت repository زمان‌مند هستند و باید قبل از هر اقدام اجرایی دوباره بررسی شوند.
- ادغام UI به‌معنی انتقال `node_modules` یا واردکردن تمام dependencyهای template نیست.
- داده‌های واقعی Accessory AS هرگز با mock API یا seed template جایگزین نمی‌شوند.

## اولویت‌های تصمیم‌گیری

```text
امنیت و مجوز استفاده
> حفظ داده و معماری فعلی
> سازگاری با RTL و Doran
> دسترسی و responsive
> نزدیکی ظاهری به template
> تعداد componentهای آماده
```

هر گزینه‌ای که license آن روشن نباشد یا برای استفاده از UI آن نیاز به تغییر auth/database/payment داشته باشد، در production رد می‌شود؛ حتی اگر ظاهر آن بهتر باشد.

## شواهد بررسی‌شده

### قطعی

- فریم‌ورک: Next.js `16.3.5` با App Router و TypeScript.
- رابط: React `19.2.8`، Tailwind CSS `4`، فونت Doran FaNum و RTL فارسی.
- دیتابیس: MySQL با Drizzle ORM و `mysql2`.
- احراز هویت: Better Auth با session دیتابیسی.
- اعتبارسنجی: Zod؛ `react-hook-form` در dependencies وجود دارد اما در پنل فعلی عملاً استفاده نشده است.
- استیت سراسری: Zustand برای سبد؛ TanStack Query در provider وجود دارد اما پنل فعلی از query/mutation آن استفاده نمی‌کند.
- ابزارهای نصب‌شده‌ی قابل استفاده: Zod، React Hook Form، `@hookform/resolvers`، TanStack Query، Radix Slot، CVA، `lucide-react`، Drizzle.
- تست پایه: ۵ فایل Vitest و ۲۳ تست سبز.
- `npm run typecheck`: سبز.
- `npm run lint`: بدون خطا، با ۶ warning موجود.
- repository تغییرات کاربر دارد؛ این تغییرات باید حفظ شوند و جزو scope پنل فرض نشوند.
- فایل آفلاین `accesssory as.fig` و تصاویر `.figma/imports/` موجودند. فایل آفلاین حدود ۵۱ مگابایت است.
- Figma MCP احراز هویت شد، ولی خواندن metadata آنلاین با HTTP 429 محدود شد. بنابراین این بررسی به منابع محلی و `PLAN.md` تکیه می‌کند و ادعای visual verification آنلاین ندارد.

### یافته‌های UI templateها

- repository رسمی NextAdmin `NextAdminHQ/nextjs-admin-dashboard` فعال و غیرآرشیوی است؛ در زمان بررسی ۵۸۷ ستاره، ۲۵۸ fork و صفر issue باز داشت. این اعداد snapshot زمان بررسی‌اند، نه قرارداد دائمی.
- README رسمی NextAdmin نسخه‌ی ۲ را به‌عنوان template آزاد و open-source با بیش از ۲۰۰ component، dashboardهای ecommerce/analytics/CRM/marketing، table/form/chart/card/modal، mock REST API، Tailwind و Next.js 16 معرفی می‌کند.
- `package.json` فعلی NextAdmin در زمان بررسی Next.js `16.2.7`، React `19.2.4`، Tailwind v4 و dependencyهایی مانند TanStack Table، TanStack Query، Recharts، FullCalendar، Leaflet، React Aria و DnD Kit را نشان می‌دهد.
- README changelog رسمی NextAdmin درباره‌ی جایگزینی `next-auth` با Better Auth و اضافه‌شدن Admin plugin برای RBAC صحبت می‌کند؛ این به‌معنی سازگاری خودکار با session و roleهای Accessory AS نیست.
- metadata رسمی repository برای NextAdmin license مشخصی اعلام نمی‌کند و فایل `main/LICENSE` در بررسی مستقیم پیدا نشد؛ ادعای MIT فعلاً **تأییدنشده** است.
- Studio Admin repository در زمان بررسی فعال بود و package آن Next.js `16.3.8`، React `19.3.0`، Tailwind v4، React Hook Form، Zod، TanStack Table و Zustand را نشان می‌دهد. این فقط سازگاری stack را نشان می‌دهد، نه اتصال آماده به domain پروژه.
- Shadcn Dashboard package آن Next.js `16.3.0` و React `19.2.5` را نشان می‌دهد، اما به‌عنوان backend یا commerce integration پروژه قابل استفاده‌ی مستقیم نیست.

### وضعیت موجود پنل

## شواهد بررسی‌شده

### قطعی

- فریم‌ورک: Next.js `16.3.5` با App Router و TypeScript.
- رابط: React `19.2.8`، Tailwind CSS `4`، فونت Doran FaNum و RTL فارسی.
- دیتابیس: MySQL با Drizzle ORM و `mysql2`.
- احراز هویت: Better Auth با session دیتابیسی.
- اعتبارسنجی: Zod؛ `react-hook-form` در dependencies وجود دارد اما در پنل فعلی عملاً استفاده نشده است.
- استیت سراسری: Zustand برای سبد؛ TanStack Query در provider وجود دارد اما پنل فعلی از query/mutation آن استفاده نمی‌کند.
- ابزارهای نصب‌شده‌ی قابل استفاده: Zod، React Hook Form، `@hookform/resolvers`، TanStack Query، Radix Slot، CVA، `lucide-react`، Drizzle.
- تست پایه: ۵ فایل Vitest و ۲۳ تست سبز.
- `npm run typecheck`: سبز.
- `npm run lint`: بدون خطا، با ۶ warning موجود.
- repository تغییرات کاربر دارد؛ این تغییرات باید حفظ شوند و جزو scope پنل فرض نشوند.
- فایل آفلاین `accesssory as.fig` و تصاویر `.figma/imports/` موجودند. فایل آفلاین حدود ۵۱ مگابایت است.
- Figma MCP احراز هویت شد، ولی خواندن metadata آنلاین با HTTP 429 محدود شد. بنابراین این بررسی به منابع محلی و `PLAN.md` تکیه می‌کند و ادعای visual verification آنلاین ندارد.

### وضعیت موجود پنل

routeهای موجود:

- `/admin`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]`
- `/admin/categories`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/users`
- `/admin/reviews`
- `/admin/content`
- `/admin/marketing`
- `/admin/messages`
- `/admin/settings`

Server Action/Server functionهای موجود:

- محصولات، تصاویر، موجودی، دسته‌ها و attributeهای محصول در `src/server/admin-products.ts`
- سفارش‌ها و آمار داشبورد در `src/server/admin-orders.ts`
- کاربران و نقش‌ها در `src/server/admin-users.ts`
- بنر، صفحه، FAQ، تنظیمات، پیام، review، coupon، shipping و campaign در `src/server/admin-content.ts`
- upload تصویر در `src/server/admin-upload.ts`

## مدل داده‌ی فعلی و پوشش مدیریتی

### پوشش فعلی قابل استفاده

- `products`: مشاهده‌ی صفحه‌ای، ایجاد، ویرایش، حذف، تغییر سریع موجودی.
- `product_images`: آپلود/حذف محدود تصویر.
- `categories`: ایجاد، ویرایش، حذف مشروط به نداشتن محصول.
- `attributes` و `product_attributes`: اتصال رنگ/سایز به محصول، ولی مدیریت مستقل کامل attributeها وجود ندارد.
- `orders`, `order_items`, `order_events`: فهرست، جزئیات، تغییر status، tracking.
- `user` و `staff_roles`: فهرست کاربر و اعطای/لغو نقش.
- `reviews`: مشاهده، تأیید، حذف.
- `banners`, `pages`, `faqs`: CRUD/ویرایش محتوایی محدود.
- `coupons`, `shipping_methods`, `campaigns`: مدیریت محدود بازاریابی.
- `settings`: ویرایش key/valueهای تعریف‌شده.
- `contact_messages`: مشاهده و تغییر read/unread.
- `payments`, `addresses`, `favorites`, `wallet_refunds`: در schema هستند، اما پنل مشاهده/مدیریت کامل ندارند.
- `session`, `account`, `verification`: داده‌های حساس احراز هویت هستند و نباید CRUD عمومی پنل داشته باشند؛ فقط مشاهده‌ی محدود و audit در صورت نیاز.

### کمبودهای اصلی

1. **مجوزها یکپارچه نیستند.** بعضی routeها `isStaff` و بعضی مستقیماً `roles.includes` را صدا می‌زنند. بهتر است تمام routeها و تمام actionها از یک gate مشترک استفاده کنند.
2. **هر کارمند عملاً CRUD بیش از حد دارد.** `requireStaff()` بدون role برای محصولات و سفارش‌ها هر staff را قبول می‌کند؛ طبق نقش‌های موجود، باید permission matrix مشخص شود.
3. **مدیریت attributeها ناقص است.** ادمین نمی‌تواند رنگ/سایز را به‌صورت مستقل ایجاد، rename، غیرفعال یا پاک کند.
4. **پرداخت‌ها قابل مشاهده نیستند.** این برای عیب‌یابی پرداخت و پشتیبانی ضروری است.
5. **آدرس‌ها، علاقه‌مندی‌ها، بازپرداخت‌ها و جزئیات کامل کاربر قابل مشاهده نیستند.** صفحه‌ی کاربر یا detail route وجود ندارد.
6. **پیام‌ها فقط ۱۰۰ رکورد آخر را می‌خوانند و حذف/جزئیات/جستجو/صفحه‌بندی ندارند.**
7. **reviewها محصول را نشان نمی‌دهند** و فهرست آن‌ها محدود به ۱۰۰ رکورد است.
8. **فهرست سفارش‌ها search ندارد** و pagination ساده است؛ جزئیات payment/address کامل نیست.
9. **فهرست محصولات filterهای ضروری ندارد**؛ status/category/stock و sort باید server-side اضافه شوند.
10. **داشبورد آمار حداقلی دارد**؛ درآمد فقط `paid` را جمع می‌زند و بازه‌ی زمانی، وضعیت پرداخت، فروش روزانه و low-stock detail ندارد.
11. **عملیات حساس transaction ندارند.** تغییر status سفارش و ایجاد event باید اتمیک باشد. ارتباط محصول با attribute و delete محصول نیز باید با transaction/قواعد وابستگی امن‌تر شود.
12. **حذف محصول hard delete است.** اگر سفارش به محصول ارجاع دهد، در محیط‌های مختلف ممکن است شکست بخورد یا تاریخچه را آسیب‌پذیر کند. archive/disable باید مسیر اصلی باشد و حذف فقط برای رکورد بدون وابستگی مجاز باشد.
13. **آپلود روی `public/uploads` نوشته می‌شود.** در Vercel پایدار نیست و MIME تنها از header فایل پذیرفته می‌شود؛ برای production باید storage پایدار/CDN انتخاب شود.
14. **فرم‌ها state دستی دارند.** `AdminForm` برای فرم‌های کوچک کار می‌کند، اما برای فرم‌های چندبخشی، خطای field-level، reset و accessibility بهتر است از React Hook Form + Zod resolver استفاده شود.
15. **دو نسخه‌ی تکراری از `AdminCard` و `AdminTable` وجود دارد** در `Shell.tsx` و `ui.tsx`؛ باید یکی canonical شود.
16. **رشته‌های قابل مشاهده‌ی فنی انگلیسی هستند** مثل `pending` در داشبورد و slotهای banner؛ باید label فارسی با مقدار داخلی جدا شود.
17. **چند باگ یا debt کوچک lint وجود دارد** که قبل از بازسازی UI بهتر است در scope همان فایل‌ها پاک‌سازی شوند.
18. **audit log وجود ندارد.** برای تغییر نقش، status سفارش، قیمت، موجودی، کوپن و تنظیمات، حداقل یک ثبت رویداد مدیریتی لازم است؛ این نیازمند تصمیم و migration جداگانه است.

## کتابخانه‌ها: چه چیزهایی را استفاده کنیم؟

### استفاده‌ی قطعی از موجودی

- **Drizzle ORM** برای query/mutation و transaction؛ ORM جدید اضافه نشود.
- **Zod 4** برای schema مشترک server/client و validation در trust boundary.
- **React Hook Form + `@hookform/resolvers`** برای فرم‌های پیچیده‌ی پنل؛ فرم‌های خیلی کوچک می‌توانند native بمانند.
- **Radix primitives موجود** فقط اگر نیاز واقعی به dialog, dropdown, tabs, tooltip یا alert dialog داریم. نصب یک UI kit کامل لازم نیست.
- **CVA و `cn`** برای variantهای دکمه، badge، status و کنترل‌ها.
- **TanStack Query** فقط برای client-side server state تعاملی که واقعاً نیاز به refetch/optimistic update دارد. صفحه‌های اصلی همچنان Server Component بمانند.
- **Zustand** فقط برای UI state یا سبد؛ داده‌ی محصولات/سفارش‌ها/کاربران وارد Zustand نشود.
- **lucide-react** فقط برای آیکون‌های غیر Figma و بعد از جست‌وجوی `public/icons/manifest.json`. برای آیکون‌های طراحی از pipeline محلی استفاده شود.

### سیاست dependency پس از تحقیق templateها

- در شروع پروژه هیچ template کامل clone یا merge نمی‌شود.
- dependency جدید فقط وقتی اضافه می‌شود که یک component منتخب واقعاً به آن نیاز داشته باشد و جایگزین ساده‌ی موجود نداشته باشد.
- dependency باید نسخه‌ی دقیق، license، حجم، اثر روی build و سازگاری با Next/React فعلی داشته باشد.
- ابتدا component را در spike جدا بررسی می‌کنیم؛ سپس در صورت پذیرش، فقط dependencyهای مصرف‌شده را وارد می‌کنیم.
- NextAdmin، Studio Admin و Shadcn Dashboard منبع UI هستند؛ source of truth داده و business logic نیستند.

### چیزهایی که فعلاً اضافه نکنیم

- `tRPC`: برای این scope لازم نیست؛ Server Components برای read و Server Actions/Route Handler برای mutation کافی‌اند.
- `Prisma`: Drizzle موجود و منبع schema است.
- `MUI`, `Ant Design`, `shadcn full install`, `AG Grid`: بزرگ و ناسازگار با هدف minimal diff؛ جدول موجود با چند primitive داخلی کافی است.
- `React Admin`, `Refine`, `Payload`, CMS جدید: معماری فعلی را عوض می‌کنند و با domain/payment/auth موجود ریسک بالایی دارند.
- clone/merge کامل NextAdmin یا Studio Admin: به‌دلیل dependencyهای متعدد، mock API و route/auth مستقل، تا قبل از spike ممنوع است.
- dependencyهای template که در component منتخب استفاده نمی‌شوند؛ از جمله chart/map/calendar/drag-and-dropهای غیرضروری.
- `date-fns`, `dayjs`, `moment`: در این مرحله با `Intl.DateTimeFormat` یا helper کوچک موجود حل می‌شود.
- upload provider جدید: فقط بعد از تصمیم deployment و انتخاب storage واقعی.

نکته‌ی مهم درباره‌ی readهای client-side: راهنمای رسمی TanStack Query هشدار می‌دهد Server Actionها برای `queryFn` مناسب نیستند، چون فراخوانی آن‌ها serial است. بنابراین readهای پنل در Server Component و mutationها در Server Action بمانند؛ اگر بعداً جدول client-side با query لازم شد، Route Handler یا endpoint خواندنی مشخص بسازیم، نه اینکه Server Action را به‌عنوان queryFn استفاده کنیم.

## معماری پیشنهادی

### لایه‌ی دسترسی

یک gate canonical بسازیم:

- `requireAdminAccess(permission)` در سمت سرور.
- permissionها به‌صورت ثابت typed باشند، مثلاً `products.read`, `products.write`, `orders.read`, `orders.status`, `users.roles`, `content.write`, `finance.read`.
- نقش‌ها به permission map تبدیل شوند؛ `admin` دسترسی کامل، `content` فقط catalog/content، `support` فقط orders/reviews/messages.
- route page و action هر دو gate خودشان را اجرا کنند؛ مخفی‌کردن لینک، امنیت نیست.
- برای bootstrap از `ADMIN_EMAIL` فقط در setup استفاده شود و بعد از ایجاد اولین role خاموش/حذف شود.

### لایه‌ی خواندن

- queryهای server-side typed و صفحه‌بندی‌شده.
- فیلترها از URL search params خوانده شوند تا قابل share و refresh باشند.
- جستجو، sort و filter در SQL انجام شود.
- read modelهای مخصوص جدول ساخته شوند؛ `select *` برای جدول‌های حساس یا joinهای بزرگ استفاده نشود.
- برای جزئیات کاربر، سفارش، پرداخت و آدرس‌ها داده‌ی حداقلی مورد نیاز برگردد.

### لایه‌ی mutation

- هر action: gate → Zod parse → business rule → transaction در صورت چند query → revalidate → `ActionResponse`.
- خطای فنی log داخلی شود و پیام فارسی امن به UI برگردد.
- status order فقط با state transition معتبر تغییر کند؛ event در همان transaction ثبت شود.
- مبالغ سفارش و payment فقط read-only نمایش داده شوند؛ تغییر مبلغ با action عمومی پنل مجاز نباشد.
- soft archive برای محصول/محتوا، و حذف hard فقط وقتی وابستگی اجازه دهد.

### لایه‌ی UI

- یک `AdminShell` canonical با header پنل، breadcrumb، sidebar responsive، role badge و خروج.
- یک `AdminTable` با empty/loading/error، pagination، action column، density و mobile card fallback.
- یک `AdminFilters` قابل استفاده مجدد برای search/status/category/date.
- `AdminForm`های پیچیده با RHF + Zod و field-level error.
- `AlertDialog` واقعی برای حذف و عملیات حساس؛ `confirm()` فقط fallback ساده نباشد.
- status badge، money/date/number formatter فارسی و label map مستقل از enum داخلی.
- Server Component پیش‌فرض؛ client island فقط جدول/فرم/دیالوگ واقعاً تعاملی.
- در صورت پذیرش NextAdmin، این primitiveها **بازسازی‌شده و سازگارشده در کد خودمان** خواهند بود؛ انتقال مستقیم shell یا routeهای template انجام نمی‌شود.
- هر component منتقل‌شده باید از نظر RTL، Doran FaNum، local icon, keyboard/focus و bundle size بررسی شود.
- UI template فقط لایه‌ی presentation است و نباید به mock API یا data cache مستقل وابسته شود.

### قرارداد استفاده از template UI

```text
spike جداگانه
→ تأیید license
→ انتخاب component
→ inventory dependency
→ بازسازی در components/admin/ui
→ اتصال به Server Component/Action فعلی
→ typecheck/test/visual QA
```

اگر license یا dependency یک component روشن نباشد، آن component بازسازی داخلی می‌شود یا کنار گذاشته خواهد شد.

### قاعده‌ی انتخاب بین گزینه‌ها

NextAdmin گزینه‌ی اولیه برای spike است، نه تصمیم قطعی برای production. اگر license آن تأیید نشود یا componentهای آن با RTL، Doran، accessibility یا bundle budget ناسازگار باشند، از Studio Admin فقط به‌عنوان گزینه‌ی مقایسه‌ای استفاده می‌کنیم. اگر هر دو نیاز به dependency و override بیش از حد داشته باشند، primitiveهای داخلی فعلی با الگوگیری از Shadcn/Radix انتخاب می‌شوند.

معیار انتخاب بر اساس تعداد ستاره یا تعداد component نیست؛ معیار اصلی حفظ داده، امنیت، license، سادگی نگهداری و سازگاری با معماری فعلی است.

## محدوده‌ی پیشنهادی محصول

### فاز صفر — پایه‌ی امنیت و یکپارچگی

هدف: قبل از افزایش امکانات، جلوی دسترسی اشتباه و regression را بگیریم.

- canonical کردن `AdminCard/AdminTable/inputCls` و حذف duplicate.
- permission matrix و gate واحد.
- رفع هر actionی که بدون role مناسب اجازه‌ی تغییر می‌دهد.
- typed Persian status labels.
- error contract واحد.
- تست permission matrix و ruleهای status/delete.

خروجی: هیچ route/action مدیریتی بدون authorization داخلی باقی نماند.

### فاز صفر-الف — UI integration spike (خارج از پروژه‌ی اصلی)

هدف: تصمیم‌گیری مستند درباره‌ی استفاده از NextAdmin به‌عنوان منبع UI، بدون ریسک برای کد یا دیتابیس production.

- checkout نسخه‌ی دقیق NextAdmin در مسیر موقت؛
- بررسی license و شرایط استفاده‌ی تجاری؛
- اجرای `dev`, `build`, `lint` و ثبت نسخه‌های واقعی؛
- انتخاب حداکثر سه نمونه: shell، table/filter، dashboard card/chart؛
- ثبت dependencyهای مستقیم و غیرمستقیم هر نمونه؛
- تست RTL، Doran FaNum، keyboard/focus، responsive و screenshot؛
- مقایسه با primitiveهای فعلی و محاسبه‌ی هزینه‌ی نگهداری؛
- خروجی یکی از این سه تصمیم: `adopt-limited`, `rebuild-inspired`, `reject`.

تا پایان این spike، هیچ package، route، schema یا component production تغییر نمی‌کند.

### فاز صفر-ب — انتقال محدود UI پس از پذیرش

فقط در صورت `adopt-limited` یا `rebuild-inspired`:

- انتقال یا بازسازی `AdminShell`، `AdminTable`، filter، badge، dialog و skeleton؛
- نگه‌داشتن Server Component و Server Action فعلی؛
- حذف mock API و اتصال مستقیم به read modelهای پروژه؛
- اضافه‌کردن فقط dependencyهایی که واقعاً مصرف می‌شوند؛
- اجرای typecheck/test/lint/build و visual QA؛
- ثبت license، نسخه، فایل‌های منتقل‌شده و دلیل هر deviation.

این فاز جای permission gate نیست؛ gate باید قبل از اتصال mutationهای جدید کامل باشد.

### فاز یک — Catalog کامل

- محصولات: جستجو، status/category/stock filter، sort، pagination بهتر، مشاهده‌ی تصویر/attribute، ایجاد/ویرایش، archive.
- تصاویر: چند تصویر، sort/reorder، حذف امن، محدودیت واقعی فایل.
- دسته‌بندی‌ها: parent/child مطابق `parentId`، شمارش، rename و archive/delete امن.
- attributeها: صفحه‌ی مستقل رنگ/سایز و اتصال به محصول.
- موجودی: bulk یا حداقل تغییر سریع با audit.

اولویت: P0/P1 چون عملیات روزمره‌ی فروشگاه به آن وابسته است.

### فاز دو — Operations و مالی خواندنی

- سفارش‌ها: search با id/code/email/phone، filter status/date، جزئیات buyer/address/items/payment، tracking، timeline.
- پرداخت‌ها: فهرست read-only، provider/status/authority/refId/verifiedAt، link به سفارش؛ `raw` فقط برای admin و با redaction.
- بازپرداخت: فهرست `wallet_refunds`، جزئیات کاربر، تغییر status با permission مالی؛ عملیات بانکی واقعی جدا از UI.
- shipping: CRUD با active/status در صورت نیاز مدل؛ جلوگیری از حذف روشی که در order استفاده شده است.
- داشبورد: آمار بازه‌ای، سفارش‌های اخیر، low-stock، پرداخت‌های ناموفق، پیام/نظر pending.

### فاز سه — Customer 360 و پشتیبانی

- کاربران: search name/email/phone، detail route.
- در detail: آدرس‌ها، سفارش‌ها، favorites، reviewها، نقش‌ها؛ secrets/session/token/password هرگز نمایش داده نشود.
- نقش‌ها: toggle امن، جلوگیری از حذف آخرین admin، ثبت audit.
- پیام‌ها: صفحه‌بندی، search، unread filter، detail/read/unread، archive/delete فقط اگر نیاز محصولی تأیید شود.
- review: نمایش محصول، search/filter/pagination، approve/reject/delete.

### فاز چهار — CMS و Marketing کامل

- banner: preview تصویر، upload پایدار، slot label فارسی، زمان شروع/پایان و sort.
- pages: ویرایش body و SEO، preview؛ rich text فقط اگر نیاز واقعی و امن وجود داشته باشد، وگرنه textarea.
- FAQ: sort و active.
- settings: whitelist کلیدها؛ ویرایش key دلخواه نباید UI عمومی باشد.
- coupons: expiry که در schema وجود دارد ولی فرم فعلی آن را مدیریت نمی‌کند، min/max، active و مصرف/اعتبارسنجی.
- campaigns: زمان‌بندی و وضعیت.

### فاز پنج — audit و QA

- اگر از نظر عملیاتی لازم بود migration کم‌حجم برای `admin_audit_logs` با actor, action, entity, entityId, before/after summary, createdAt.
- ثبت عملیات حساس: role، price/stock، order status، refund، coupon/settings.
- تست actionها و business ruleها.
- visual QA در برابر منابع محلی Figma؛ تا رفع 429، verification آنلاین ادعا نشود.
- Playwright فقط برای happy pathهای پرریسک پنل بعد از پایدارشدن routeها.

## ترتیب اجرای پیشنهادی و وابستگی‌ها

```text
TASK-ADMIN-001  inventory + permission matrix
        ↓
TASK-ADMIN-002  secure action contract + transaction rules
        ↓
TASK-ADMIN-003  UI integration spike خارج از پروژه‌ی اصلی
        ↓
TASK-ADMIN-004  canonical admin shell/primitives و تصمیم UI
        ↓
TASK-ADMIN-005  catalog complete
        ↓
TASK-ADMIN-006  order/payment operations
        ↓
TASK-ADMIN-007  customer/support
        ↓
TASK-ADMIN-008  CMS/marketing completion
        ↓
TASK-ADMIN-009  audit log + visual/functional QA
```

از نظر اجرای موازی، فقط کارهای کم‌تداخل قابل موازی‌سازی هستند: مستندسازی permissionها، نوشتن تست business rule و spike مستقل UI. تغییر هم‌زمان در `AdminShell`, `roles`, `schema` یا actionهای shared توصیه نمی‌شود.

## نکات امنیتی و داده‌ای مهم

- طبق مستندات رسمی Next.js، Server Functionها مستقیماً با POST قابل فراخوانی‌اند؛ بنابراین authorization باید درون هر Server Action بررسی شود، نه فقط در صفحه.
- اطلاعات حساس `account.password`, tokenهای session، access/refresh token، verification value و `payments.raw` نباید در table عمومی/JSON ادمین expose شوند.
- ادمین نباید مبلغ نهایی سفارش یا amount پرداخت را از client بگیرد یا تغییر دهد.
- همه‌ی mutationهای چندمرحله‌ای Drizzle باید transaction داشته باشند تا update و event از هم جدا نشوند.
- حذف hard برای product/user/order مناسب نیست مگر با business rule و وابستگی‌های مشخص.
- upload باید signature/type/size و در صورت نیاز ابعاد و محتوای واقعی فایل را بررسی کند؛ مسیر `public/uploads` برای Vercel durable نیست.
- secretهای موجود در `.env` و هر token Figma هرگز وارد source، plan یا log نشوند.
- هیچ کد، asset یا component از NextAdmin/Studio Admin نباید پیش از تأیید license وارد repository production شود.
- license dependencyهای جدید باید در تصمیم ادغام ثبت شوند؛ «open-source» به‌تنهایی به معنی مجوز کپی و استفاده‌ی تجاری نیست.

## Definition of Done پنل کامل

- تمام routeهای پنل با permission gate سمت سرور محافظت شده‌اند.
- همه‌ی entityهای عملیاتی قابل مشاهده‌اند: products, categories, attributes, orders, order items/events, payments, users, addresses, favorites, reviews, messages, refunds, coupons, shipping, banners, pages, FAQs, campaigns, settings؛ داده‌های auth حساس فقط حداقل لازم و redacted.
- عملیات write مجاز، اعتبارسنجی‌شده، transaction-safe و با خطای فارسی هستند.
- search/filter/sort/pagination برای فهرست‌های بزرگ server-side است.
- loading/empty/error/success/disabled در UIهای مربوط وجود دارد.
- RTL، Doran، اعداد فارسی و تومان رعایت شده‌اند؛ ریال فقط لایه‌ی پرداخت.
- mobile/tablet/desktop بررسی شده است.
- اگر UI template استفاده شده، license، نسخه، componentهای منتقل‌شده، dependencyهای اضافه‌شده و دلیل پذیرش ثبت شده‌اند.
- هیچ mock API یا mock business data در production استفاده نمی‌شود.
- `npm run typecheck` سبز، `npm test` سبز با حفظ baseline حداقل ۲۳ تست، و `npm run lint` بدون error است.
- برای هر انحراف از Figma یا محدودیت ناشی از API/production decision، decision record نوشته شده است.

## نتیجه‌ی بررسی و توصیه‌ی عملی

الان لازم نیست کتابخانه‌ی جدید نصب کنیم. پروژه ابزارهای کافی دارد؛ مشکل اصلی کمبود coverage، gate یکپارچه، transaction و UI primitiveهای منسجم است. تحقیق templateها این نتیجه را تقویت می‌کند: NextAdmin برای **spike و الگوگیری محدود UI** گزینه‌ی اول است، اما ادغام کامل آن بدون تأیید license، بررسی dependency و تطبیق RTL/Doran توصیه نمی‌شود. اولین implementation امن باید با `TASK-ADMIN-001` و سپس `TASK-ADMIN-002` شروع شود؛ بعد از آن spike UI خارج از پروژه‌ی اصلی اجرا شود. این مسیر کم‌ریسک‌تر از اضافه‌کردن یک admin framework آماده است و architecture فعلی Next/Drizzle/Better Auth را حفظ می‌کند.

این سند فقط نقشه است و در این مرحله هیچ application code، dependency، schema یا migration تغییر نکرده است.

## منابع تحقیق UI

- [NextAdmin official repository](https://github.com/NextAdminHQ/nextjs-admin-dashboard)
- [NextAdmin official README](https://raw.githubusercontent.com/NextAdminHQ/nextjs-admin-dashboard/main/README.md)
- [NextAdmin current package.json](https://raw.githubusercontent.com/NextAdminHQ/nextjs-admin-dashboard/main/package.json)
- [NextAdmin official website](https://nextadmin.co/)
- [NextAdmin official documentation](https://nextadmin.co/docs)
- [Studio Admin repository](https://github.com/arhamkhnz/next-shadcn-admin-dashboard)
- [Shadcn Dashboard repository](https://github.com/shadcndashboard/next-shadcn-dashboard)
- [GitHub repository metadata for NextAdmin](https://api.github.com/repos/NextAdminHQ/nextjs-admin-dashboard)
- [Accessory AS package.json](computer:///home/sina/Documents/project/accessory-as/package.json)
- [Accessory AS admin shell](computer:///home/sina/Documents/project/accessory-as/src/components/admin/Shell.tsx)
- [Accessory AS admin product actions](computer:///home/sina/Documents/project/accessory-as/src/server/admin-products.ts)

## منابع پایه‌ی معماری

- [Next.js Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Drizzle ORM Transactions](https://orm.drizzle.team/docs/transactions)
- [Zod Documentation](https://zod.dev/)
- [React Hook Form Documentation](https://react-hook-form.com/docs/useform)
- [TanStack Query Advanced Server Rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr)
