import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { getMegaMenu } from "@/lib/menu";
import { ProductDetailGallery } from "@/components/shop/ProductDetailGallery";
import { ProductInfoPanel } from "@/components/shop/ProductInfoPanel";
import { ProductPerks } from "@/components/shop/ProductPerks";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { getProductBySlug, getRatingSummary, getRelated, getReviews } from "@/lib/get-products";
import { isFavorite } from "@/lib/account-actions";
import { getSessionUser } from "@/lib/session";

export const revalidate = 60;

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
  try {
    [related, reviewItems, summary] = await Promise.all([
      getRelated(p.categoryId, p.id),
      getReviews(p.id, 30),
      getRatingSummary(p.id),
    ]);
  } catch {
    related = [];
    reviewItems = [];
  }
  try {
    const u = await getSessionUser();
    if (u) fav = await isFavorite(p.id);
  } catch {
    fav = false;
  }

  return (
    <div className="flex min-h-full w-full max-w-full flex-1 flex-col overflow-x-hidden bg-[#F8FAF9]">
      <Header
        menu={await getMegaMenu().catch(
          (): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }),
        )}
      />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 md:px-20">
        {/* بریدکرامب عین فیگما: اکسسوری آس / دسته / صفحه محصول */}
        <div className="flex w-full justify-end">
          <Breadcrumb
            trail={[
              { href: "/", label: "اکسسوری آس" },
              { href: "/shop", label: p.categoryTitle ?? "فروشگاه" },
              { label: "صفحه محصول" },
            ]}
          />
        </div>

        {/* ردیف اصلی: گالری راست + پنل اطلاعات چپ (RTL) */}
        <div className="mt-6 grid w-full min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-6 xl:gap-6">
          <div className="flex min-w-0 flex-col gap-3">
            <ProductDetailGallery
              images={p.images}
              title={p.title}
              productId={p.id}
              initialFav={fav}
            />
            <ProductPerks />
          </div>
          <div className="min-w-0">
            <ProductInfoPanel
              product={{
                id: p.id,
                slug: decoded,
                title: p.title,
                sku: p.sku,
                categoryTitle: p.categoryTitle,
                description: p.description,
                priceToman: p.priceToman,
                oldPriceToman: p.oldPriceToman,
                discountPct: p.discountPct,
                stock: p.stock,
                sizes: p.sizes.map((s) => ({ id: s.id, value: s.value })),
                colors: p.colors.map((c) => ({ id: c.id, label: c.label })),
              }}
              initialTab={activeTab}
              initialReviews={reviewItems}
              totalReviews={summary.count}
            />
          </div>
        </div>

        {/* کالاهای مشابه عین فیگما */}
        {related.length > 0 ? (
          <section className="box-border mt-10 w-full rounded-[10px] border border-[#D6DBDE] bg-white p-6">
            <h2 className="text-center text-xl font-extrabold leading-[33px] text-[#161B22]">
              کالاهای مشابه
            </h2>
            <div className="mt-6">
              <ProductGrid items={related} />
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
