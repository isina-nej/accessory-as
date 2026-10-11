import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { OrderCard } from "@/components/shop/OrderCard";
import { OrderSummaryCards } from "@/components/shop/OrderSummaryCards";
import { Icon } from "@/components/ui/Icon";
import { getDashboard } from "@/lib/account-actions";
import { getMegaMenu } from "@/lib/menu";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  const dash = await getDashboard();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#F8FAF9]">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-4 sm:px-8 lg:px-20 py-6">
        {/* مسیر راهنما عین فیگما */}
        <div className="h-5">
          <Breadcrumb
            trail={[
              { href: "/", label: "اکسســـوری آس" },
              { href: "/account", label: "پروفایل کاربری" },
              { label: "داشبورد" },
            ]}
          />
        </div>

        {/* بدنه دو ستونه: راست سایدبار ۳۲۹px، چپ پنل جزئیات ۹۲۷px */}
        <div className="flex flex-col-reverse items-start justify-end gap-6 lg:flex-row-reverse">
          {/* پنل جزئیات سمت چپ (در RTL) */}
          <section aria-label="خلاصه حساب کاربری" className="w-full lg:w-[927px] rounded-[10px] border border-[#D6DBDE] bg-white p-6 space-y-4">
            {/* ۳ کارت خلاصه وضعیت سفارش‌ها */}
            <OrderSummaryCards
              activeCount={dash?.active}
              deliveredCount={dash?.delivered}
              refundedCount={dash?.refunded}
            />

            {/* بخش لیست سفارشات */}
            <div className="w-full rounded-[10px] border border-[#D6DBDE] bg-white p-6 space-y-6">
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-[20px] font-extrabold text-[#161B22]">لیست سفارشـات</h2>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-1 text-sm font-bold text-[#4B5563] transition-colors hover:text-[#0A5A55]"
                >
                  <span>مشاهــده همه</span>
                  <Icon name="icons-20--direction-left" className="h-5 w-5" alt="" />
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {(dash?.orders ?? []).slice(0, 3).map((o) => (
                  <OrderCard key={o.id} o={o} />
                ))}
                {(dash?.orders.length ?? 0) === 0 && (
                  <div className="py-12 text-center text-sm font-medium text-[#8A9398]">
                    هنوز سفارشی ثبت نشده است.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* سایدبار سمت راست */}
          <AccountSidebar
            active="/account"
            name={user.name ?? "علی ملکی"}
            phone={user.email ?? "۰۹۳۵ ۱۷۹ ۰۸۵۳"}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
