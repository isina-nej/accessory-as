# اکسسوری آس — فروشگاه (Next.js + MySQL)

بیس فاز اول. فیگما `4RqKMjYhwQ5FALfZdEbg6V` نود `708:439`. پلن کامل: `PLAN.md`.

## اجرا (لوکال)

```bash
cp .env.example .env   # DATABASE_URL را به MySQL خودت بده
npm install
npm run db:generate && npm run db:migrate && npm run db:seed
npm run dev
```

چک: `GET /api/health`، `GET /api/products` (بدون DB خطای 503 فارسی می‌دهد).

## استک

Next 16.3 + React 19 + TS + Tailwind v4 + Drizzle + mysql2 + Better Auth + Zod + RHF + TanStack Query + Zustand + shadcn/Radix + زرین‌پال SDK + Zibal REST + Vitest.

## اسکریپت‌ها

`dev build start lint typecheck test db:{generate,migrate,push,studio,seed}`
