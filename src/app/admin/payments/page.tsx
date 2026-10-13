import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty, AdminPager, AdminTable } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { listAdminPayments } from "@/server/admin-users";
import { PAYMENT_STATUS_FA, faDateTime, paymentProviderLabel, paymentStatusLabel, shortId } from "@/lib/admin-labels";
import { formatToman, toFa } from "@/lib/fa";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "پرداخت‌ها | پنل" };

const STATUSES = Object.keys(PAYMENT_STATUS_FA);

export default async function AdminPayments({ searchParams }: { searchParams: Promise<{ q?: string; s?: string; page?: string }> }) {
  const gate = await requirePermission("payments.read");
  if (!gate.ok) redirect("/login?next=/admin/payments");
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const s = STATUSES.includes(sp.s ?? "") ? sp.s! : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const { items, total, pageSize } = await listAdminPayments(q, s, page);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const query = new URLSearchParams({ ...(q ? { q } : {}), ...(s ? { s } : {}) });
  return (
    <AdminPage active="/admin/payments" roles={gate.roles}>
      <AdminCard title={`پرداخت‌ها (${toFa(total)})`}>
        <form className="mb-3 flex gap-2" action="/admin/payments">
          <input name="q" defaultValue={q} placeholder="جستجو با شناسه سفارش، کد پیگیری یا authority…" className="h-10 flex-1 rounded-lg border px-3 text-sm" aria-label="جستجوی پرداخت" />
          {s && <input type="hidden" name="s" value={s} />}
          <button className="h-10 rounded-lg bg-(--color-brand) px-4 text-sm text-white">جستجو</button>
          <Link href="/admin/payments" className="flex h-10 items-center rounded-lg border px-4 text-sm">پاک‌کردن</Link>
        </form>
        <div className="mb-3 flex flex-wrap gap-1">
          {["", ...STATUSES].map((v) => {
            const params = new URLSearchParams({ ...(v ? { s: v } : {}), ...(q ? { q } : {}) });
            return <Link key={v || "all"} href={`/admin/payments${params.size ? `?${params.toString()}` : ""}`} className={`rounded-full border px-3 py-1 text-xs ${s === v ? "bg-(--color-brand) text-white" : ""}`}>{v ? paymentStatusLabel(v) : "همه"}</Link>;
          })}
        </div>
        {items.length === 0 ? (
          <AdminEmpty text={query.size > 0 ? "پرداختی با این فیلترها پیدا نشد." : "هنوز پرداختی ثبت نشده است."} />
        ) : (
          <AdminTable head={["سفارش", "خریدار", "درگاه", "مبلغ سفارش", "وضعیت", "کد پیگیری", "تأیید"]}>
            {items.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="px-2 py-2 text-xs">
                  <Link href={`/admin/orders/${p.orderId}`} dir="ltr" className="text-(--color-brand) hover:underline">{shortId(p.orderId)}…</Link>
                </td>
                <td className="px-2 py-2 text-xs">{p.customer?.name ?? "مهمان"}{p.customer?.email ? <span className="block text-[11px] text-(--color-muted-fg)" dir="ltr">{p.customer.email}</span> : null}</td>
                <td className="px-2 py-2 text-xs">{paymentProviderLabel(p.provider)}</td>
                <td className="px-2 py-2 text-xs font-bold">{formatToman(p.order?.totalToman ?? 0)}</td>
                <td className="px-2 py-2 text-xs">{paymentStatusLabel(p.status)}</td>
                <td className="px-2 py-2 text-xs" dir="ltr">{p.refId ?? p.authority ?? "—"}</td>
                <td className="px-2 py-2 text-xs">{p.verifiedAt ? faDateTime(p.verifiedAt) : "—"}</td>
              </tr>
            ))}
          </AdminTable>
        )}
        <AdminPager basePath="/admin/payments" query={query} page={page} pages={pages} />
      </AdminCard>
    </AdminPage>
  );
}