import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AddToCart } from "@/components/shop/AddToCart";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { formatToman, toFa } from "@/lib/fa";
import { getProductBySlug, getRelated } from "@/lib/get-products";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let p: Awaited<ReturnType<typeof getProductBySlug>>;
  try {
    p = await getProductBySlug(decodeURIComponent(slug));
  } catch {
    p = null;
  }
  if (!p) notFound();

  let related: Awaited<ReturnType<typeof getRelated>> = [];
  try {
    related = await getRelated(p.categoryId, p.id);
  } catch {
    related = [];
  }

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
        <div className="grid gap-6 rounded-2xl border bg-white p-4 md:grid-cols-2 md:p-6">
          <div className="aspect-square overflow-hidden rounded-2xl bg-(--color-mist)">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-7xl">💍</span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-xl font-bold">{p.title}</h1>
              <p className="mt-1 text-sm text-(--color-muted-fg)">
                {[p.categoryTitle, p.stock > 0 ? "موجود" : "ناموجود"].filter(Boolean).join(" · ")}
              </p>
            </div>
            {p.discountPct ? (
              <span className="w-fit rounded-full bg-(--color-wine) px-3 py-1 text-xs text-white">
                {toFa(`٪${p.discountPct}`)} تخفیف
              </span>
            ) : null}
            <div>
              {p.oldPriceToman ? (
                <p className="text-sm text-(--color-muted-fg) line-through">
                  {formatToman(p.oldPriceToman)}
                </p>
              ) : null}
              <p className="text-2xl font-bold">{formatToman(p.priceToman)}</p>
            </div>
            {p.colors.length > 0 ? (
              <div>
                <p className="text-sm font-bold">رنگ</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.colors.map((c) => (
                    <span key={c.id} className="rounded-full border px-3 py-1 text-xs">
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {p.sizes.length > 0 ? (
              <div>
                <p className="text-sm font-bold">سایز</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.sizes.map((s) => (
                    <span key={s.id} className="rounded-full border px-3 py-1 text-xs">
                      {toFa(s.value)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <AddToCart id={p.id} title={p.title} stock={p.stock} />
          </div>
        </div>
        {related.length > 0 ? (
          <section className="space-y-3">
            <h2 className="font-bold">محصولات مرتبط</h2>
            <ProductGrid items={related} />
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
