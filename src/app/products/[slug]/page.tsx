import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AddToCart } from "@/components/shop/AddToCart";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { RatingBadge, ReviewList } from "@/components/shop/Reviews";
import { ReviewForm } from "@/components/shop/ReviewForm";
import { formatToman, toFa } from "@/lib/fa";
import { getProductBySlug, getRatingSummary, getRelated, getReviews } from "@/lib/get-products";

export const revalidate = 60;

function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 border-b py-2 text-sm last:border-0">
      <span className="text-(--color-muted-fg)">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  let p: Awaited<ReturnType<typeof getProductBySlug>>;
  try {
    p = await getProductBySlug(decoded);
  } catch {
    p = null;
  }
  if (!p) notFound();

  let related: Awaited<ReturnType<typeof getRelated>> = [];
  let reviewItems: Awaited<ReturnType<typeof getReviews>> = [];
  let summary = { avg: 0, count: 0 };
  try {
    [related, reviewItems, summary] = await Promise.all([
      getRelated(p.categoryId, p.id),
      getReviews(p.id, 10),
      getRatingSummary(p.id),
    ]);
  } catch {
    related = [];
    reviewItems = [];
  }

  const discountUntil = "۵ اسفند";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6">
        <Breadcrumb
          trail={[
            { href: "/", label: "اکسسوری آس" },
            { href: "/", label: "فروشگاه" },
            { label: p.title },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* گالری: راست در RTL */}
          <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded-2xl border bg-white">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-7xl">💍</span>
              )}
            </div>
            {p.images.length > 1 ? (
              <div className="grid grid-cols-4 gap-2">
                {p.images.slice(0, 4).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src + i}
                    src={src}
                    alt={`${p.title} ${toFa(i + 1)}`}
                    className="aspect-square rounded-xl border bg-white object-cover"
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* اطلاعات: چپ در RTL */}
          <div className="flex flex-col gap-4 rounded-2xl border bg-white p-4 md:p-6">
            <div>
              <p className="text-xs text-(--color-muted-fg)">{p.categoryTitle ?? "اکسسوری"}</p>
              <h1 className="mt-1 text-xl font-extrabold">
                {p.title}
                {p.sku ? <span className="mr-2 text-sm font-medium text-(--color-muted-fg)">{p.sku}</span> : null}
              </h1>
              <div className="mt-2">
                <RatingBadge avg={summary.avg} count={summary.count} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-y py-3">
              <div>
                {p.oldPriceToman ? (
                  <p className="text-sm text-(--color-muted-fg) line-through">{formatToman(p.oldPriceToman)}</p>
                ) : null}
                <p className="text-2xl font-extrabold">{formatToman(p.priceToman)}</p>
              </div>
              {p.discountPct ? (
                <span className="rounded-full bg-(--color-wine) px-3 py-1 text-xs font-bold text-white">
                  {toFa(`٪${p.discountPct}`)} تخفیف
                </span>
              ) : null}
              {p.discountPct ? (
                <span className="text-sm text-(--color-muted-fg)">تخفیف ویژه تا {discountUntil}</span>
              ) : null}
            </div>

            {p.description ? (
              <div>
                <p className="text-sm font-bold">توضیحات محصول</p>
                <p className="mt-1 text-sm leading-7">{p.description}</p>
              </div>
            ) : null}

            {p.sizes.length > 0 ? (
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">سایز</p>
                  <span className="text-xs text-(--color-muted-fg)">راهنمای انتخاب سایز</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.sizes.map((s) => (
                    <span key={s.id} className="min-w-10 rounded-lg border bg-(--color-mist) px-3 py-2 text-center text-sm font-bold">
                      {toFa(s.value)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {p.colors.length > 0 ? (
              <div>
                <p className="text-sm font-bold">رنگ</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.colors.map((c) => (
                    <span key={c.id} className="rounded-full border px-3 py-1 text-xs">
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-auto space-y-2 border-t pt-4">
              <AddToCart id={p.id} title={p.title} stock={p.stock} />
              <p className="text-xs text-(--color-muted-fg)">
                {p.stock > 0 ? `${toFa(p.stock)} عدد موجود` : "ناموجود"}
              </p>
            </div>
          </div>
        </div>

        {/* تب مشخصات / نظرات */}
        <section className="space-y-4 rounded-2xl border bg-white p-4 md:p-6">
          <div className="flex items-center gap-4 border-b pb-3 text-sm font-bold">
            <span className="border-b-2 border-(--color-brand) pb-3 text-(--color-brand)">مشخصات محصول</span>
            <span className="pb-3 text-(--color-muted-fg)">نظرات کاربران ({toFa(summary.count)})</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <SpecRow k="جنس" v="استیل ضد زنگ" />
              <SpecRow k="کشور تولیدکننده" v="ایران" />
              {p.sku ? <SpecRow k="کد کالا" v={p.sku} /> : null}
              {p.categoryTitle ? <SpecRow k="دسته" v={p.categoryTitle} /> : null}
            </div>
            <div className="space-y-4">
              <ReviewList items={reviewItems} />
              <ReviewForm slug={decoded} />
            </div>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold">کالاهای مشابه</h2>
            <ProductGrid items={related} />
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
