import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { getFavorites } from "@/lib/account-actions";
import { formatToman, toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { getSessionUser } from "@/lib/session";
import { cn } from "@/lib/cn";
import { FavRemove } from "@/components/shop/FavRemove";

export const dynamic = "force-dynamic";

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/favorites");
  const { sort } = await searchParams;
  const s = sort === "cheap" || sort === "expensive" ? sort : "new";
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  const rows = (await getFavorites(s)) ?? [];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { href: "/account", label: "پروفایل کاربری" }, { label: "علاقه‌مندی‌ها" }]} />
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <AccountSidebar active="/account/favorites" name={user.name ?? "کاربر"} phone={user.email ?? ""} />
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border bg-white px-4 py-2">
              <p className="text-sm">لیست علاقه‌مندی‌ها — {toFa(rows.length)} کالا</p>
              <span className="flex gap-1 text-sm">
                <span className="ml-2 text-(--color-muted-fg)">مرتب‌سازی:</span>
                {([["new", "جدیدترین"], ["cheap", "ارزان‌ترین"], ["expensive", "گران‌ترین"]] as const).map(([v, label]) => (
                  <Link key={v} href={`/account/favorites?sort=${v}`} className={cn("rounded-full px-3 py-1", s === v ? "bg-(--color-brand) text-white" : "hover:bg-black/5")}>
                    {label}
                  </Link>
                ))}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {rows.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-2xl border bg-white p-3">
                  <Link href={`/products/${p.slug}`} className="text-sm font-bold hover:underline">{p.title}</Link>
                  <span className="mr-auto text-sm">{formatToman(p.priceToman)}</span>
                  <FavRemove id={p.id} />
                </div>
              ))}
            </div>
            {rows.length === 0 && (
              <p className="rounded-2xl border bg-white p-6 text-center text-sm text-(--color-muted-fg)">علاقه‌مندی خالی است.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
