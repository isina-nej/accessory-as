import { Suspense } from "react";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { CardSkeleton, GridSkeleton } from "@/components/shop/CardSkeleton";
import { FiltersSidebar } from "@/components/shop/FiltersSidebar";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { OffersCarousel } from "@/components/shop/OffersCarousel";
import { Pagination } from "@/components/shop/Pagination";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SortBar } from "@/components/shop/SortBar";
import { getFilterMeta, getOffers, getProducts } from "@/lib/get-products";
import { getPublicCampaign } from "@/lib/cms-public";
import { getMegaMenu } from "@/lib/menu";
import { shopQuerySchema } from "@/lib/products";

export const revalidate = 60;
export const metadata = { title: "فروشگاه | اکسسوری آس" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const parsed = shopQuerySchema.safeParse(flat);
  const q = parsed.success
    ? parsed.data
    : { sort: "all" as const, q: "", cat: "", color: "", size: "", inStock: false, min: 250000, max: 25050000, page: 1 };

  let items: Awaited<ReturnType<typeof getProducts>>["items"] = [];
  let total = 0;
  let offers: Awaited<ReturnType<typeof getOffers>> = [];
  let meta = { cats: [], colors: [], sizes: [] } as Awaited<ReturnType<typeof getFilterMeta>>;
  let menu: Awaited<ReturnType<typeof getMegaMenu>> = { cats: [], byCat: {} };
  let dbError = false;
  const campaign = await getPublicCampaign();
  try {
    [{ items, total }, offers, meta, menu] = await Promise.all([
      getProducts(q),
      getOffers(),
      getFilterMeta(),
      getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} })),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-16 pt-6 lg:px-20 lg:pt-5">
        <div className="mb-6 text-xs text-[#8A9398]">
          <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { label: "فروشگاه" }]} />
        </div>
        <Suspense fallback={<CardSkeleton />}>
          <OffersCarousel items={offers} endsAt={campaign?.active ? campaign.endsAt?.toISOString() : null} />
        </Suspense>
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
          <div className="order-2 min-w-0 space-y-6">
            <SortBar q={q} total={total} base="/shop" />
            {dbError ? (
              <div className="rounded-[10px] border border-[#D6DBDE] bg-white p-10 text-center">
                محصولات فعلاً در دسترس نیستند. لطفاً دوباره تلاش کنید.
              </div>
            ) : (
              <Suspense fallback={<GridSkeleton />}>
                <ProductGrid items={items} />
              </Suspense>
            )}
            <Pagination q={q} total={total} base="/shop" />
          </div>
          <div className="order-1">
            <FiltersSidebar q={q} meta={meta} base="/shop" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
