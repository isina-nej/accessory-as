import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty, AdminPager, AdminTable } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { listAdminOrders } from "@/server/admin-orders";
import { orderStatusLabel } from "@/lib/order-status";
import { faDate, shortId } from "@/lib/admin-labels";
import { formatToman, toFa } from "@/lib/fa";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "سفارش‌ها | پنل" };

const FILTERS = [
  ["", "همه"], ["pending", "در انتظار پرداخت"], ["paid", "پرداخت شده"], ["preparing", "در حال آماده‌سازی"],
  ["shipped", "ارسال شده"], ["delivered", "تحویل داده شده"], ["failed", "ناموفق"], ["cancelled", "لغو شده"], ["refunded", "مرجوع شده"],
] as const;

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ s?: string; q?: string; from?: string; to?: string; page?: string }> }) {
  const gate = await requirePermission("orders.read");
  if (!gate.ok) redirect("/login?next=/admin/orders");
  const sp = await searchParams;
  const s = sp.s ?? "";
  const q = sp.q?.trim() ?? "";
  const from = /^\d{4}-\d{2}-\d{2}$/.test(sp.from ?? "") ? sp.from : undefined;
  const to = /^\d{4}-\d{2}-\d{2}$/.test(sp.to ?? "") ? sp.to : undefined;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const { items, total, pageSize } = await listAdminOrders({ status: s, q, from, to, page });
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const query = new URLSearchParams({ ...(s ? { s } : {}), ...(q ? { q } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}) });

  return (
    <AdminPage active="/admin/orders" roles={gate.roles}>
      <AdminCard title={`سفارش‌ها (${toFa(total)})`}>
        <form className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]" action="/admin/orders">
          <input name="q" defaultValue={q} placeholder="جستجو با شناسه، کد رهگیری، نام، ایمیل یا موبایل خریدار…" className="h-10 min-w-0 rounded-lg border px-3 text-sm" aria-label="جستجوی سفارش" />
          <input name="from" type="date" defaultValue={from ?? ""} className="h-10 rounded-lg border px-3 text-sm" aria-label="از تاریخ" />
          <input name="to" type="date" defaultValue={to ?? ""} className="h-10 rounded-lg border px-3 text-sm" aria-label="تا تاریخ" />
          <div className="flex gap-2">
            {s && <input type="hidden" name="s" value={s} />}
            <button className="h-10 rounded-lg bg-(--color-brand) px-4 text-sm text-white">جستجو</button>
            <Link href="/admin/orders" className="flex h-10 items-center justify-center rounded-lg border px-4 text-sm">پاک‌کردن</Link>
          </div>
        </form>
        <div className="mb-3 flex flex-wrap gap-1">
          {FILTERS.map(([v, l]) => {
            const params = new URLSearchParams({ ...(v ? { s: v } : {}), ...(q ? { q } : {}), ...(from ? { from } : {}), ...(to ? { to } : {}) });
            return <Link key={v} href={`/admin/orders${params.size ? `?${params.toString()}` : ""}`} className={`rounded-full border px-3 py-1 text-xs ${s === v ? "bg-(--color-brand) text-white" : ""}`}>{l}</Link>;
          })}
        </div>
        {items.length === 0 ? (
          <AdminEmpty text={query.size > 0 ? "سفارشی با این فیلترها پیدا نشد." : "هنوز سفارشی ثبت نشده است."} />
        ) : (
          <AdminTable head={["سفارش", "خریدار", "تاریخ", "وضعیت", "مبلغ", ""]}>
            {items.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="px-2 py-2 text-xs" dir="ltr">{shortId(o.id)}…</td>
                <td className="px-2 py-2 text-xs">
                  {o.buyerName ?? "مهمان"}
                  {o.buyerEmail ? <span className="block text-[11px] text-(--color-muted-fg)" dir="ltr">{o.buyerEmail}</span> : null}
                </td>
                <td className="px-2 py-2 text-xs">{faDate(o.createdAt)}</td>
                <td className="px-2 py-2 text-xs">{orderStatusLabel(o.status)}</td>
                <td className="px-2 py-2 text-xs font-bold">{formatToman(o.totalToman)}</td>
                <td className="px-2 py-2"><Link href={`/admin/orders/${o.id}`} className="text-xs text-(--color-brand)">جزئیات</Link></td>
              </tr>
            ))}
          </AdminTable>
        )}
        <AdminPager basePath="/admin/orders" query={query} page={page} pages={pages} />
      </AdminCard>
    </AdminPage>
  );
}