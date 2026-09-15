import Link from "next/link";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { formatToman } from "@/lib/fa";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { getMegaMenu } from "@/lib/menu";

export default async function LandingPage() {
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-8">
        <Breadcrumb trail={[{ label: "اکسسوری آس" }]} />
        <section className="space-y-3 rounded-2xl bg-(--color-brand-deep) p-8 text-center text-white md:p-12">
          <h1 className="text-2xl font-extrabold md:text-4xl">اکسسوری آس — انتخابی برای خاص‌پسندان</h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-white/80 md:text-base">
            اکسسوری‌های خاص و ماندگار برای تکمیل استایل روزمره و رسمی شما.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/shop" className="rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-(--color-brand-deep)">
              مشاهده فروشگاه
            </Link>
            <Link href="/about" className="rounded-lg border border-white/40 px-6 py-2.5 text-sm">
              درباره ما
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6 text-center">
          <p className="text-lg font-extrabold text-(--color-wine)">٪۷۵ تخفیف به مناسبت روز دختر</p>
          <p className="mt-1 text-sm text-(--color-muted-fg)">اکسسوری‌هایی برای امروز و سال‌های بعد — فروش ویژه!</p>
          <Link href="/shop" className="mt-4 inline-block rounded-lg bg-(--color-wine) px-6 py-2 text-sm text-white">
            مشاهده پیشنهادها
          </Link>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold">دسته‌بندی‌ها</h2>
            <Link href="/shop" className="text-sm text-(--color-brand)">
              مشاهده همه
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {menu.cats.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?cat=${c.slug}`}
                className="rounded-2xl border bg-white p-6 text-center text-sm font-bold hover:border-(--color-brand)"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="text-lg font-extrabold">چرا اکسسوری آس؟</h2>
          <p className="mt-2 text-sm leading-7 text-(--color-muted-fg)">
            {formatToman(500000)} به بالا ارسال رایگان — ۷ روز ضمانت بازگشت — کیفیت پرمیوم.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
