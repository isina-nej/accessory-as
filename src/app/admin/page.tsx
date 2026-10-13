import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty, AdminErrorState } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { adminStats } from "@/server/admin-orders";
import { formatToman, toFa } from "@/lib/fa";
import { orderStatusLabel } from "@/lib/order-status";
import { faDateTime, shortId } from "@/lib/admin-labels";
import { bootstrapAdmin, requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "پنل مدیریت | اکسسوری آس" };

export default async function AdminHome() {
  await bootstrapAdmin();
  const gate = await requirePermission("dashboard.read");
  if (!gate.ok) redirect("/login?next=/admin");
  const roles = gate.roles;
  let stats: Awaited<ReturnType<typeof adminStats>> = null;
  try {
    stats = await adminStats();
  } catch {
    stats = null;
  }

  const cards: { label: string; value: string; href: string }[] = stats
    ? [
        { label: "سفارش‌ها", value: toFa(stats.orderCount), href: "/admin/orders" },
        { label: "سفارش در انتظار پرداخت", value: toFa(stats.pendingOrders), href: "/admin/orders?s=pending" },
        { label: "درآمد پرداخت‌شده", value: formatToman(stats.revenue), href: "/admin/payments" },
        { label: "پرداخت ناموفق", value: toFa(stats.failedPayments), href: "/admin/payments?s=failed" },
        { label: "محصولات فعال", value: toFa(stats.productCount), href: "/admin/products?status=active" },
        { label: "موجودی کم (۳ یا کمتر)", value: toFa(stats.lowStock), href: "/admin/products?stock=low" },
        { label: "کاربران", value: toFa(stats.userCount), href: "/admin/users" },
        { label: "دیدگاه‌های در انتظار", value: toFa(stats.pendingReviews), href: "/admin/reviews?pending=1" },
        { label: "پیام‌های نخوانده", value: toFa(stats.unreadMessages), href: "/admin/messages?unread=1" },
      ]
    : [];

  return (
    <AdminPage active="/admin" roles={roles}>
      {stats ? (
        <>
          <AdminCard title="نمای کلی">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {cards.map((c) => (
                <Link key={c.label} href={c.href} className="rounded-xl border bg-(--color-mist) p-4 text-center hover:border-(--color-brand)">
                  <p className="text-xl font-extrabold">{c.value}</p>
                  <p className="mt-1 text-xs text-(--color-muted-fg)">{c.label}</p>
                </Link>
              ))}
            </div>
          </AdminCard>
          <AdminCard title="آخرین سفارش‌ها">
            {stats.recent.length === 0 ? (
              <AdminEmpty text="سفارشی ثبت نشده است." />
            ) : (
              <div className="space-y-2">
                {stats.recent.map((o) => (
                  <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm hover:border-(--color-brand)">
                    <span className="flex items-center gap-2">
                      <span dir="ltr" className="text-xs text-(--color-muted-fg)">{shortId(o.id)}…</span>
                      <span>{orderStatusLabel(o.status)}</span>
                    </span>
                    <span className="text-xs text-(--color-muted-fg)">{o.buyerName ?? "مهمان"} — {faDateTime(o.createdAt)}</span>
                    <span className="font-bold">{formatToman(o.totalToman)}</span>
                  </Link>
                ))}
              </div>
            )}
          </AdminCard>
          <AdminCard title="محصولات رو به اتمام">
            {stats.lowStockItems.length === 0 ? (
              <AdminEmpty text="موجودی همه محصولات فعال کافی است." />
            ) : (
              <div className="space-y-2">
                {stats.lowStockItems.map((p) => (
                  <Link key={p.id} href={`/admin/products/${p.id}`} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm hover:border-(--color-brand)">
                    <span className="font-bold">{p.title}</span>
                    <span className={p.stock === 0 ? "text-(--color-wine)" : "text-(--color-muted-fg)"}>
                      موجودی: {toFa(p.stock)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </AdminCard>
        </>
      ) : (
        <AdminErrorState text="اطلاعات داشبورد در دسترس نیست. اتصال دیتابیس را بررسی کنید." />
      )}
    </AdminPage>
  );
}