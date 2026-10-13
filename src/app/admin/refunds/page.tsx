import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty, AdminPager, AdminTable } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { RefundStatusBtns } from "@/components/admin/RefundForms";
import { listAdminRefunds } from "@/server/admin-users";
import { REFUND_STATUS_FA, faDate, refundStatusLabel } from "@/lib/admin-labels";
import { toFa } from "@/lib/fa";
import { canAccess, requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "بازپرداخت‌ها | پنل" };

export default async function AdminRefunds({ searchParams }: { searchParams: Promise<{ q?: string; s?: string; page?: string }> }) {
  const gate = await requirePermission("refunds.read");
  if (!gate.ok) redirect("/login?next=/admin/refunds");
  const canWrite = canAccess(gate.roles, "refunds.write");
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const s = sp.s && sp.s in REFUND_STATUS_FA ? sp.s : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const { items, total, pageSize } = await listAdminRefunds(q, s, page);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const query = new URLSearchParams({ ...(q ? { q } : {}), ...(s ? { s } : {}) });
  return (
    <AdminPage active="/admin/refunds" roles={gate.roles}>
      <AdminCard title={`بازپرداخت‌ها (${toFa(total)})`}>
        {!canWrite && <p className="mb-3 text-xs text-(--color-muted-fg)">شما فقط دسترسی مشاهده دارید؛ تغییر وضعیت بازپرداخت برای نقش شما فعال نیست.</p>}
        <form className="mb-3 flex gap-2" action="/admin/refunds">
          <input name="q" defaultValue={q} placeholder="جستجو با شناسه کاربر یا شماره شبا…" className="h-10 flex-1 rounded-lg border px-3 text-sm" aria-label="جستجوی بازپرداخت" />
          {s && <input type="hidden" name="s" value={s} />}
          <button className="h-10 rounded-lg bg-(--color-brand) px-4 text-sm text-white">جستجو</button>
          <Link href="/admin/refunds" className="flex h-10 items-center rounded-lg border px-4 text-sm">پاک‌کردن</Link>
        </form>
        <div className="mb-3 flex flex-wrap gap-1">
          {["", ...Object.keys(REFUND_STATUS_FA)].map((v) => {
            const params = new URLSearchParams({ ...(v ? { s: v } : {}), ...(q ? { q } : {}) });
            return <Link key={v || "all"} href={`/admin/refunds${params.size ? `?${params.toString()}` : ""}`} className={`rounded-full border px-3 py-1 text-xs ${s === v ? "bg-(--color-brand) text-white" : ""}`}>{v ? refundStatusLabel(v) : "همه"}</Link>;
          })}
        </div>
        {items.length === 0 ? (
          <AdminEmpty text={query.size > 0 ? "بازپرداختی با این فیلترها پیدا نشد." : "درخواست بازپرداختی ثبت نشده است."} />
        ) : (
          <AdminTable head={["کاربر", "شبا", "تاریخ", "وضعیت"]}>
            {items.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="px-2 py-2 text-xs">
                  {r.customer?.name ?? "کاربر حذف‌شده"}
                  <Link href={`/admin/users/${r.userId}`} className="block text-[11px] text-(--color-brand)">مشاهده پرونده</Link>
                </td>
                <td className="px-2 py-2 text-xs" dir="ltr">{r.iban}</td>
                <td className="px-2 py-2 text-xs">{faDate(r.createdAt)}</td>
                <td className="px-2 py-2"><RefundStatusBtns id={r.id} status={r.status} canWrite={canWrite} /></td>
              </tr>
            ))}
          </AdminTable>
        )}
        <AdminPager basePath="/admin/refunds" query={query} page={page} pages={pages} />
      </AdminCard>
    </AdminPage>
  );
}