import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard } from "@/components/admin/ui";
import { OrderOps } from "@/components/admin/OrderOps";
import { getAdminOrder } from "@/server/admin-orders";
import { ORDER_STATUS_FA } from "@/lib/order-status";
import { formatToman, toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { getMyRoles, isStaff } from "@/lib/staff";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  if (!(await isStaff())) redirect("/login?next=/admin/orders");
  const roles = await getMyRoles();
  const { id } = await params;
  const d = await getAdminOrder(id);
  if (!d) redirect("/admin/orders");
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin/orders" roles={roles}>
          <AdminCard title={`سفارش ${d.order.id.slice(0, 8)}… — ${ORDER_STATUS_FA[d.order.status] ?? d.order.status}`}>
            <p className="text-sm">خریدار: {d.buyer?.name ?? "—"} ({d.buyer?.email ?? "مهمان"}) {d.buyer?.phone ? <span dir="ltr">{d.buyer.phone}</span> : null}</p>
            <p className="mt-1 text-sm font-bold">جمع: {formatToman(d.order.totalToman)} (تخفیف {formatToman(d.order.discountToman)} + ارسال {formatToman(d.order.shippingFeeToman)})</p>
            <div className="mt-3 space-y-1">
              {d.items.map((it) => (
                <p key={it.id} className="text-sm">{it.title} × {toFa(it.qty)} — {formatToman(it.unitToman)}</p>
              ))}
            </div>
            <div className="mt-3">
              <p className="mb-2 text-sm font-bold">تغییر وضعیت و رهگیری</p>
              <OrderOps id={d.order.id} status={d.order.status} tracking={d.order.trackingCode} />
            </div>
            <div className="mt-3">
              <p className="mb-1 text-sm font-bold">رویدادها</p>
              {d.events.map((e) => (
                <p key={e.id} className="text-xs text-(--color-muted-fg)">{e.status} — {toFa(String(e.createdAt))}</p>
              ))}
            </div>
          </AdminCard>
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}
