import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { OrderCard } from "@/components/shop/OrderCard";
import { Icon } from "@/components/ui/Icon";
import { getOrders } from "@/lib/account-actions";
import { toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { getSessionUser } from "@/lib/session";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

const TABS = [
  ["all", "همه"],
  ["active", "درحال انجام شدن"],
  ["delivered", "تحویل داده شده"],
  ["refunded", "مرجوع شده"],
] as const;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/orders");
  const { status } = await searchParams;
  const tab = TABS.some(([v]) => v === status) ? status! : "all";
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  const rows = (await getOrders(tab)) ?? [];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#F8FAF9]">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-4 sm:px-8 lg:px-20 py-6">
        <div className="h-5">
          <Breadcrumb
            trail={[
              { href: "/", label: "اکسســـوری آس" },
              { href: "/account", label: "پروفایل کاربری" },
              { label: "سفـارش ها" },
            ]}
          />
        </div>

        <div className="flex flex-col-reverse lg:flex-row justify-end items-start gap-6">
          {/* پنل سفارش‌ها سمت چپ ۹۲۷px */}
          <section aria-label="لیست سفارش‌ها" className="w-full lg:w-[927px] rounded-[10px] border border-[#D6DBDE] bg-white p-6 space-y-6">
            <div className="flex flex-col gap-4 border-b border-[#D6DBDE] pb-4">
              <h1 className="text-[20px] font-extrabold text-[#161B22] text-right">لیست سفارشـات</h1>

              {/* نوار فیلتر و مرتب‌سازی دقیقاً مطابق فیگما */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-black">
                    <Icon name="icons-20--sorting" className="h-5 w-5" alt="" />
                    <span>مرتــب سازی :</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {TABS.map(([v, label]) => {
                      const isActive = tab === v;
                      return (
                        <Link
                          key={v}
                          href={`/account/orders?status=${v}`}
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
                  {toFa(rows.length)} سفارش
                </span>
              </div>
            </div>

            {/* لیست آیتم‌های سفارش */}
            <div className="flex flex-col gap-3">
              {rows.map((o) => (
                <OrderCard key={o.id} o={o} />
              ))}
              {rows.length === 0 && (
                <div className="py-16 text-center text-sm font-medium text-[#8A9398]">
                  در این بخش سفارشی یافت نشد.
                </div>
              )}
            </div>
          </section>

          {/* سایدبار سمت راست ۳۲۹px */}
          <AccountSidebar
            active="/account/orders"
            name={user.name ?? "علی ملکی"}
            phone={user.email ?? "۰۹۳۵ ۱۷۹ ۰۸۵۳"}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
