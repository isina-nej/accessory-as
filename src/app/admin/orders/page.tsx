import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard, AdminTable } from "@/components/admin/ui";
import { listAdminOrders } from "@/server/admin-orders";
import { ORDER_STATUS_FA } from "@/lib/order-status";
import { formatToman, toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { getMyRoles, isStaff } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "سفارش‌ها | پنل" };

const FILTERS = [["", "همه"], ["pending", "pending"], ["paid", "paid"], ["preparing", "preparing"], ["shipped", "shipped"], ["delivered", "delivered"], ["cancelled", "cancelled"], ["refunded", "refunded"]] as const;

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ s?: string; page?: string }> }) {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  if (!(await isStaff())) redirect("/login?next=/admin/orders");
  const roles = await getMyRoles();
  const sp = await searchParams;
  const s = sp.s ?? "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const { items, total } = await listAdminOrders(s, page);
  const pages = Math.max(1, Math.ceil(total / 20));
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin/orders" roles={roles}>
          <AdminCard title={`سفارش‌ها (${toFa(total)})`}>
            <div className="mb-3 flex flex-wrap gap-1">
              {FILTERS.map(([v, l]) => (
                <Link key={v} href={`/admin/orders?s=${v}`} className={`rounded-full border px-3 py-1 text-xs ${s === v ? "bg-(--color-brand) text-white" : ""}`}>{l === "همه" ? l : (ORDER_STATUS_FA[l] ?? l)}</Link>
              ))}
            </div>
            <AdminTable head={["سفارش", "وضعیت", "مبلغ", ""]}>
              {items.map((o) => (
                <tr key={o.id} className="border-b">
                  <td className="px-2 py-2 text-xs" dir="ltr">{o.id.slice(0, 8)}…</td>
                  <td className="px-2 py-2 text-xs">{ORDER_STATUS_FA[o.status] ?? o.status}</td>
                  <td className="px-2 py-2 text-xs font-bold">{formatToman(o.totalToman)}</td>
                  <td className="px-2 py-2"><Link href={`/admin/orders/${o.id}`} className="text-xs text-(--color-brand)">جزئیات</Link></td>
                </tr>
              ))}
            </AdminTable>
            {pages > 1 && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                {page > 1 && <Link className="rounded border px-3 py-1" href={`/admin/orders?s=${s}&page=${page - 1}`}>قبلی</Link>}
                <span>{toFa(page)} از {toFa(pages)}</span>
                {page < pages && <Link className="rounded border px-3 py-1" href={`/admin/orders?s=${s}&page=${page + 1}`}>بعدی</Link>}
              </div>
            )}
          </AdminCard>
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}
