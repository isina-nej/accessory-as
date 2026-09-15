import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { OrderCard } from "@/components/shop/OrderCard";
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
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { href: "/account", label: "پروفایل کاربری" }, { label: "سفارش‌ها" }]} />
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <AccountSidebar active="/account/orders" name={user.name ?? "کاربر"} phone={user.email ?? ""} />
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border bg-white px-4 py-2">
              <p className="text-sm text-(--color-muted-fg)">{toFa(rows.length)} سفارش</p>
              <div className="flex gap-1 text-sm">
                <span className="ml-2 text-(--color-muted-fg)">مرتب‌سازی:</span>
                {TABS.map(([v, label]) => (
                  <Link
                    key={v}
                    href={`/account/orders?status=${v}`}
                    className={cn("rounded-full px-3 py-1", tab === v ? "bg-(--color-brand) text-white" : "hover:bg-black/5")}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {rows.map((o) => (
                <OrderCard key={o.id} o={o} />
              ))}
            </div>
            {rows.length === 0 && (
              <p className="rounded-2xl border bg-white p-6 text-center text-sm text-(--color-muted-fg)">سفارشی نیست.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
