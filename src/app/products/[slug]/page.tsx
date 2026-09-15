import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { getMegaMenu } from "@/lib/menu";
import { AddToCart } from "@/components/shop/AddToCart";
import { FavToggle } from "@/components/shop/FavRemove";
import { Gallery } from "@/components/shop/Gallery";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ReviewModal } from "@/components/shop/ReviewModal";
import { RatingBadge, ReviewList } from "@/components/shop/Reviews";
import { ReviewForm } from "@/components/shop/ReviewForm";
import { formatToman, toFa } from "@/lib/fa";
import { getProductBySlug, getRatingSummary, getRelated, getReviews } from "@/lib/get-products";
import { isFavorite } from "@/lib/account-actions";
import { getSessionUser } from "@/lib/session";

export const revalidate = 60;

function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 border-b py-2 text-sm last:border-0">
      <span className="text-(--color-muted-fg)">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const { tab } = await searchParams;
  const activeTab = tab === "reviews" ? "reviews" : "specs";
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
  let fav = false;
  let loggedIn = false;
  try {
    [related, reviewItems, summary] = await Promise.all([
      getRelated(p.categoryId, p.id),
      getReviews(p.id, activeTab === "reviews" ? 30 : 10),
      getRatingSummary(p.id),
    ]);
  } catch {
    related = [];
    reviewItems = [];
  }
  try {
    const u = await getSessionUser();
    loggedIn = !!u;
    if (u) fav = await isFavorite(p.id);
  } catch {
    fav = false;
  }

  const discountUntil = "۵ اسفند";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }))} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6">
        <Breadcrumb
          trail={[
            { href: "/", label: "اکسسوری آس" },
            { href: "/", label: "فروشگاه" },
            { label: p.title },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Gallery images={p.images} title={p.title} />

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
              <div className="flex items-center gap-2">
                <span className="flex-1">
                  <AddToCart id={p.id} title={p.title} stock={p.stock} />
                </span>
                {loggedIn ? <FavToggle id={p.id} initial={fav} /> : null}
              </div>
              <p className="text-xs text-(--color-muted-fg)">
                {p.stock > 0 ? `${toFa(p.stock)} عدد موجود` : "ناموجود"}
              </p>
            </div>
          </div>
        </div>

        {/* تب مشخصات / نظرات */}
        <section className="space-y-4 rounded-2xl border bg-white p-4 md:p-6">
          <div className="flex items-center gap-4 border-b pb-3 text-sm font-bold">
            <a
              href={`/products/${p.slug}?tab=specs`}
              className={activeTab === "specs" ? "border-b-2 border-(--color-brand) pb-3 text-(--color-brand)" : "pb-3 text-(--color-muted-fg)"}
            >
              مشخصات محصول
            </a>
            <a
              href={`/products/${p.slug}?tab=reviews`}
              className={activeTab === "reviews" ? "border-b-2 border-(--color-brand) pb-3 text-(--color-brand)" : "pb-3 text-(--color-muted-fg)"}
            >
              نظرات کاربران ({toFa(summary.count)})
            </a>
            <span className="mr-auto">
              <ReviewModal slug={decoded} />
            </span>
          </div>
          {activeTab === "specs" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <SpecRow k="جنس" v="استیل ضد زنگ" />
                <SpecRow k="کشور تولیدکننده" v="ایران" />
                {p.sku ? <SpecRow k="کد کالا" v={p.sku} /> : null}
                {p.categoryTitle ? <SpecRow k="دسته" v={p.categoryTitle} /> : null}
              </div>
              <div className="space-y-4">
                <ReviewList items={reviewItems.slice(0, 3)} />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ReviewList items={reviewItems} />
              <ReviewForm slug={decoded} />
            </div>
          )}
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
