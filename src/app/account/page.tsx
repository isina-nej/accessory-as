import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { OrderCard } from "@/components/shop/OrderCard";
import { getDashboard } from "@/lib/account-actions";
import { getMegaMenu } from "@/lib/menu";
import { toFa } from "@/lib/fa";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  const dash = await getDashboard();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { href: "/account", label: "پروفایل کاربری" }, { label: "داشبورد" }]} />
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <AccountSidebar active="/account" name={user.name ?? "کاربر"} phone={user.email ?? ""} />
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                ["سفارش‌های فعال", dash?.active ?? 0],
                ["تحویل داده شده", dash?.delivered ?? 0],
                ["مرجوع شده", dash?.refunded ?? 0],
              ].map(([label, n]) => (
                <div key={label as string} className="rounded-2xl border bg-white p-4 text-center">
                  <p className="text-2xl font-extrabold">{toFa(n as number)}</p>
                  <p className="mt-1 text-xs text-(--color-muted-fg)">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold">لیست سفارشات</h2>
              <a href="/account/orders" className="text-sm text-(--color-brand)">مشاهده همه</a>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {(dash?.orders ?? []).slice(0, 4).map((o) => (
                <OrderCard key={o.id} o={o} />
              ))}
            </div>
            {(dash?.orders.length ?? 0) === 0 && (
              <p className="rounded-2xl border bg-white p-6 text-center text-sm text-(--color-muted-fg)">
                هنوز سفارشی ثبت نشده.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
