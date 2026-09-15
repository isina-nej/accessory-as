import { Suspense } from "react";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { CardSkeleton, GridSkeleton } from "@/components/shop/CardSkeleton";
import { FiltersSidebar } from "@/components/shop/FiltersSidebar";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { OffersCarousel } from "@/components/shop/OffersCarousel";
import { Pagination } from "@/components/shop/Pagination";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { SearchBox } from "@/components/shop/SearchBox";
import { SortBar } from "@/components/shop/SortBar";
import { getFilterMeta, getOffers, getProducts } from "@/lib/get-products";
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
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { label: "فروشگاه" }]} />
        <Suspense fallback={<CardSkeleton />}>
          <OffersCarousel items={offers} />
        </Suspense>
        <SearchBox q={q} base="/shop" />
        <div className="grid gap-4 lg:grid-cols-[330px_1fr]">
          <FiltersSidebar q={q} meta={meta} base="/shop" />
          <div className="space-y-4">
            <SortBar q={q} total={total} base="/shop" />
            {dbError ? (
              <div className="rounded-2xl border bg-white p-10 text-center">
                دیتابیس وصل نیست. MySQL را چک کن و seed بزن.
              </div>
            ) : (
              <Suspense fallback={<GridSkeleton />}>
                <ProductGrid items={items} />
              </Suspense>
            )}
            <Pagination q={q} total={total} base="/shop" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
