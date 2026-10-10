import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { Icon } from "@/components/ui/Icon";
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
    <div className="flex min-h-full flex-1 flex-col bg-[#F8FAF9]">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-4 sm:px-8 lg:px-20 py-6">
        <div className="h-5">
          <Breadcrumb
            trail={[
              { href: "/", label: "اکسســـوری آس" },
              { href: "/account", label: "پروفایل کاربری" },
              { label: "علاقـه منـدی ها" },
            ]}
          />
        </div>

        <div className="flex flex-col-reverse lg:flex-row justify-end items-start gap-6">
          {/* پنل علاقه‌مندی‌ها سمت چپ ۹۲۷px */}
          <section aria-label="لیست علاقه‌مندی‌ها" className="w-full lg:w-[927px] rounded-[10px] border border-[#D6DBDE] bg-white p-6 space-y-6">
            <div className="flex flex-col gap-4 border-b border-[#D6DBDE] pb-4">
              <h1 className="text-[20px] font-extrabold text-[#161B22] text-right">لیست علاقه‌مندی‌ها</h1>

              {/* نوار فیلتر و مرتب‌سازی دقیقاً مطابق فیگما */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-black">
                    <Icon name="icons-20--sorting" className="h-5 w-5" alt="" />
                    <span>مرتــب سازی :</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {([["new", "جدیدترین"], ["cheap", "ارزان‌ترین"], ["expensive", "گران‌ترین"]] as const).map(([v, label]) => {
                      const isActive = s === v;
                      return (
                        <Link
                          key={v}
                          href={`/account/favorites?sort=${v}`}
                          className={cn(
                            "rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
                            isActive
                              ? "border border-[#9F1239] bg-white text-[#9F1239]"
                              : "text-[#4B5563] hover:text-[#0A5A55]"
                          )}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <span className="text-sm font-semibold text-[#8A9398]">
                  {toFa(rows.length)} کالا
                </span>
              </div>
            </div>

            {/* گرید محصولات علاقه‌مندی مطابق فریم ۳ ستونه فیگما */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {rows.map((p) => (
                <div
                  key={p.id}
                  className="relative flex flex-col justify-between overflow-hidden rounded-[10px] border border-[#D6DBDE] bg-white p-3 text-right transition hover:shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-[#9F1239] px-2 py-0.5 text-[11px] font-bold text-white">
                      تخفیف ویژه
                    </span>
                    <FavRemove id={p.id} />
                  </div>

                  <Link href={`/products/${p.slug}`} className="my-2 flex h-36 w-full items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image ?? "/images/product-01.webp"} alt={p.title} className="h-full w-full object-contain" />
                  </Link>

                  <div className="space-y-2">
                    <Link href={`/products/${p.slug}`} className="block text-sm font-bold text-[#161B22] truncate hover:text-[#0A5A55]">
                      {p.title}
                    </Link>

                    <div className="flex items-baseline justify-end gap-1">
                      <span className="text-base font-bold text-[#161B22]">{formatToman(p.priceToman)}</span>
                    </div>

                    <Link
                      href={`/products/${p.slug}`}
                      className="flex h-10 w-full items-center justify-center rounded-lg border border-[#D6DBDE] bg-white text-xs font-bold text-[#4B5563] hover:bg-[#F8FAF9]"
                    >
                      مشاهده و خرید
                    </Link>
                  </div>
                </div>
              ))}

              {rows.length === 0 && (
                <div className="col-span-full py-16 text-center text-sm font-medium text-[#8A9398]">
                  لیست علاقه‌مندی‌های شما خالی است.
                </div>
              )}
            </div>
          </section>

          {/* سایدبار سمت راست */}
          <AccountSidebar
            active="/account/favorites"
            name={user.name ?? "علی ملکی"}
            phone={user.email ?? "۰۹۳۵ ۱۷۹ ۰۸۵۳"}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
