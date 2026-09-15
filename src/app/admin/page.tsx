import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard } from "@/components/admin/ui";
import { adminStats } from "@/server/admin-orders";
import { formatToman, toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { bootstrapAdmin, getMyRoles, isStaff } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "پنل مدیریت | اکسسوری آس" };

export default async function AdminHome() {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  await bootstrapAdmin();
  if (!(await isStaff())) redirect("/login?next=/admin");
  const roles = await getMyRoles();
  const stats = await adminStats();
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin" roles={roles}>
          <AdminCard title={`داشبورد — نقش: ${roles.join("، ")}`}>
            {!stats ? (
              <p className="text-sm text-(--color-muted-fg)">دیتابیس در دسترس نیست.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {[
                  ["سفارش‌ها", stats.orderCount],
                  ["سفارش pending", stats.pendingOrders],
                  ["درآمد paid", stats.revenue, true],
                  ["محصولات", stats.productCount],
                  ["موجودی کم (≤۳)", stats.lowStock],
                  ["کاربران", stats.userCount],
                ].map(([label, n, money]) => (
                  <div key={label as string} className="rounded-xl border bg-(--color-mist) p-4 text-center">
                    <p className="text-xl font-extrabold">{money ? formatToman(n as number) : toFa(n as number)}</p>
                    <p className="mt-1 text-xs text-(--color-muted-fg)">{label}</p>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
          <AdminCard title="آخرین سفارش‌ها">
            <div className="space-y-2">
              {(stats?.recent ?? []).map((o) => (
                <a key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm hover:border-(--color-brand)">
                  <span>{o.status}</span>
                  <span className="font-bold">{formatToman(o.totalToman)}</span>
                </a>
              ))}
              {(stats?.recent.length ?? 0) === 0 && <p className="text-sm text-(--color-muted-fg)">سفارشی نیست.</p>}
            </div>
          </AdminCard>
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}
