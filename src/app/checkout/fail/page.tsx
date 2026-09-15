import Link from "next/link";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { getMegaMenu } from "@/lib/menu";

const REASONS: Record<string, string> = {
  verify: "اختلال در سیستم بانکی! لطفاً کمی دیگر دوباره تلاش بکنید.",
  mock: "موجودی کالاها کافی نبود.",
  invalid: "اطلاعات پرداخت نامعتبر است.",
  "no-order": "سفارشی پیدا نشد.",
};

export default async function FailPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; reason?: string }>;
}) {
  const sp = await searchParams;
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { label: "نتیجه پرداخت" }]} />
        <div className="space-y-3 rounded-2xl border bg-white p-6 text-center">
          <p className="text-xl font-extrabold text-(--color-wine)">عدم موفقیت در پرداخت!</p>
          <p className="text-sm text-(--color-muted-fg)">پرداخت صورتحساب شما دچار مشکل شد.</p>
          <p className="text-sm">خطا سیستم: {REASONS[sp.reason ?? ""] ?? REASONS.verify}</p>
          <div className="flex justify-center gap-2 pt-2">
            <Link href="/cart" className="rounded-lg bg-(--color-brand) px-5 py-2 text-sm text-white">
              سفارش دوباره
            </Link>
            <Link href="/shop" className="rounded-lg border px-5 py-2 text-sm">
              برگشت به فروشگاه
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
