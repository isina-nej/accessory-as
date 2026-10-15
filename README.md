# اکسسوری آس — فروشگاه (Next.js + MySQL)

بیس فاز اول. فیگما `4RqKMjYhwQ5FALfZdEbg6V` نود `708:439`. پلن کامل: `PLAN.md`.

## اجرا (لوکال)

```bash
cp .env.example .env   # DATABASE_URL را فقط به دیتابیس توسعهٔ جداگانه بده
npm install
npm run db:generate && npm run db:migrate
NODE_ENV=development npm run db:seed
npm run dev
```

`db:seed` فقط در `NODE_ENV=development` یا `test` و وقتی میزبان `DATABASE_URL` از loopback (`localhost`، `127.0.0.1` یا `::1`) باشد اجرا می‌شود. از MySQL محلی جدا برای seed استفاده کن؛ URLهای remote عمداً رد می‌شوند. داده‌های پایه فقط موارد مفقود را اضافه می‌کنند؛ محصولات موجود، موجودی/قیمت دستی، تصاویر/ویژگی‌های موجود، صفحات و تنظیمات مدیر را بازنویسی نمی‌کنند. با این حال seed به دیتابیس متصل می‌شود و نباید به دیتابیس production یا دارای دادهٔ حساس وصل شود.

### Fixtureهای آزمایشی (اختیاری)

برای ساخت مشتری غیرقابل‌ورود، آدرس ساختگی، سفارش، آیتم، رویداد، پرداخت mock و علاقه‌مندی، ابتدا seed پایه را روی دیتابیس توسعهٔ جداگانه اجرا کن و سپس:

```bash
NODE_ENV=development SEED_FIXTURES=1 npm run db:seed:fixtures
```

Fixtureها شناسه‌های پایدار دارند و فقط در نبود رکورد درج می‌شوند؛ اجرای مجددشان دادهٔ موجود را به‌روزرسانی/پاک نمی‌کند. حساب fixture رمز، account، session یا credential ورود ندارد و برای ورود به پنل قابل استفاده نیست. پرداخت با provider=`mock` و status=`initiated` ثبت می‌شود؛ سفارش `pending` و پرداخت‌نشده است و این تراکنش واقعی درگاه نیست. به‌دلیل نبود جدول refund مستقل و نیاز جدول `wallet_refunds` به IBAN، fixture استرداد ایجاد نمی‌شود. برای تست‌ها از MySQL آزمایشی جدا استفاده کن؛ تست‌های guard با `npm test -- tests/seed-guards.test.ts` بدون اتصال دیتابیس اجرا می‌شوند.

چک: `GET /api/health`، `GET /api/products` (بدون DB خطای 503 فارسی می‌دهد).

## بازسازی کامل دیتابیس روی داکر (سرور)

`init.sql` فقط روی volume خالی اجرا می‌شود و کل schema فعلی `src/db/schema.ts` را می‌سازد. همان DDL به‌صورت migration پایه در `src/db/drizzle/0000_initial_schema.sql` هست و `tests/init-sql-sync.test.ts` جلوی واگرایی این دو را می‌گیرد. `init.sql` ردیف پایه را در `__drizzle_migrations` ثبت می‌کند، پس بعد از bootstrap، `drizzle-kit migrate` روی volume تازه no-op است و migrationهای بعدی از همان‌جا ادامه می‌دهند.

```bash
cd /opt/accessory-as

# ۱) بکاپ قبل از هر حذف (نام متغیرها MARIADB_* است، نه MYSQL_*)
install -d -m 700 backups
docker compose exec db sh -c \
  'exec mariadb-dump --single-transaction --routines --triggers -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' \
  > backups/accessory_as-$(date +%F-%H%M%S).sql

# ۲) بازسازی از صفر — ⚠ این خط volume دیتابیس را پاک می‌کند
docker compose down -v
docker compose up -d          # init.sql روی volume خالی اجرا می‌شود

# ۳) seed پایه، داخل شبکهٔ compose (نیازی به پورت منتشرشده نیست).
#    میزبان غیر-loopback فقط با مجوز صریح پذیرفته می‌شود:
SEED_ALLOW_REMOTE_HOSTS=db docker compose --profile tools run --rm seed

# ۴) بررسی
docker compose exec db sh -c \
  'exec mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE" -e "SELECT (SELECT COUNT(*) FROM products) products, (SELECT COUNT(*) FROM categories) categories, (SELECT COUNT(*) FROM settings) settings, (SELECT COUNT(*) FROM banners) banners, (SELECT COUNT(*) FROM faqs) faqs, (SELECT COUNT(*) FROM pages) pages, (SELECT COUNT(*) FROM orders) orders;"'
```

نکته‌ها:

- `SEED_ALLOW_REMOTE_HOSTS` پیش‌فرض خالی است؛ بدون آن seed روی هر میزبان غیر-loopback (از جمله `db`) رد می‌شود. فقط نام سرویس را بده.
- `docker compose up -d` عادی سرویس `seed` را اجرا نمی‌کند (پروفایل `tools`).
- کانتینر seed بدون TLS به دیتابیس وصل می‌شود؛ CA محلی Aiven عمداً وارد ایمیج نمی‌شود (`certs/` در `.dockerignore`). برای دیتابیس TLS دار، `MYSQL_SSL_CA` را به‌صورت env بده.
- fixtureها (`src/db/seed-fixtures.ts`) برای فروشگاه زنده نیستند؛ فقط لوکال با `SEED_FIXTURES=1`.
- اگر `DB_PASSWORD` یا `BETTER_AUTH_SECRET` جایی لو رفته، قبل از بازسازی در `.env` عوض شود.
- seed پایه فقط رکوردهای مفقود را اضافه می‌کند؛ روی دیتابیس خالی همهٔ کاتالوگ و CMS را می‌سازد.

## استک

Next 16.3 + React 19 + TS + Tailwind v4 + Drizzle + mysql2 + Better Auth + Zod + RHF + TanStack Query + Zustand + shadcn/Radix + زرین‌پال SDK + Zibal REST + Vitest.

## اسکریپت‌ها

`dev build start lint typecheck test db:{generate,migrate,push,studio,seed}`
