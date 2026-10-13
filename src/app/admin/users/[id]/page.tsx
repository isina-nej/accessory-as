import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty, AdminTable } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { RoleCell } from "@/components/admin/RoleBtns";
import { getAdminCustomer } from "@/server/admin-users";
import { orderStatusLabel } from "@/lib/order-status";
import { faDate, faDateTime, paymentProviderLabel, paymentStatusLabel, refundStatusLabel, shortId } from "@/lib/admin-labels";
import { formatToman, toFa } from "@/lib/fa";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "پرونده کاربر | پنل" };

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission("users.read");
  if (!gate.ok) redirect("/login?next=/admin/users");
  const { id } = await params;
  const d = await getAdminCustomer(id);
  if (!d) redirect("/admin/users");
  const c = d.customer;
  return (
    <AdminPage active="/admin/users" roles={gate.roles}>
      <AdminCard
        title={`پرونده: ${c.name ?? "کاربر"}`}
        action={<Link href="/admin/users" className="text-xs text-(--color-brand)">بازگشت به فهرست</Link>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="text-sm">
            <p><span className="text-(--color-muted-fg)">ایمیل: </span><span dir="ltr">{c.email}</span> {c.emailVerified ? "✓" : ""}</p>
            <p><span className="text-(--color-muted-fg)">موبایل: </span><span dir="ltr">{c.phoneNumber ?? "—"}</span> {c.phoneNumberVerified ? "✓" : ""}</p>
            <p className="text-(--color-muted-fg)">عضویت: {faDateTime(c.createdAt)}</p>
          </div>
          <div>
            <p className="mb-1 text-sm font-bold">نقش‌های پنل</p>
            <RoleCell userId={c.id} roles={d.roles.map((r) => r.key)} />
          </div>
        </div>
      </AdminCard>

      <AdminCard title={`سفارش‌ها (${toFa(d.orders.length)})`}>
        {d.orders.length === 0 ? (
          <AdminEmpty text="این کاربر سفارشی ثبت نکرده است." />
        ) : (
          <AdminTable head={["سفارش", "تاریخ", "وضعیت", "پرداخت", "مبلغ"]}>
            {d.orders.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="px-2 py-2 text-xs" dir="ltr">{shortId(o.id)}…</td>
                <td className="px-2 py-2 text-xs">{faDate(o.createdAt)}</td>
                <td className="px-2 py-2 text-xs">{orderStatusLabel(o.status)}</td>
                <td className="px-2 py-2 text-xs">{o.payment ? `${paymentProviderLabel(o.payment.provider)} — ${paymentStatusLabel(o.payment.status)}` : "—"}</td>
                <td className="px-2 py-2 text-xs font-bold">{formatToman(o.totalToman)}</td>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminCard>

      <AdminCard title={`آدرس‌ها (${toFa(d.addresses.length)})`}>
        {d.addresses.length === 0 ? (
          <AdminEmpty text="آدرسی ثبت نشده است." />
        ) : (
          <ul className="space-y-2">
            {d.addresses.map((a) => (
              <li key={a.id} className="rounded-xl border px-3 py-2 text-sm">
                <p>{a.label ? `${a.label} — ` : ""}{a.recipient ?? ""} {a.isDefault ? "(پیش‌فرض)" : ""}</p>
                <p className="text-xs text-(--color-muted-fg)">{a.province}، {a.city} — {a.detail}</p>
                <p className="text-xs text-(--color-muted-fg)" dir="ltr">{a.phone}{a.postal ? ` — کد پستی: ${a.postal}` : ""}</p>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <AdminCard title={`علاقه‌مندی‌ها (${toFa(d.favorites.length)})`}>
        {d.favorites.length === 0 ? (
          <AdminEmpty text="علاقه‌مندی‌ای ثبت نشده است." />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {d.favorites.map((f) => (
              <li key={f.productId}>
                <Link href={`/admin/products/${f.productId}`} className="inline-block rounded-lg border px-3 py-1.5 text-xs hover:border-(--color-brand)">{f.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      <AdminCard title={`بازپرداخت‌ها (${toFa(d.refunds.length)})`}>
        {d.refunds.length === 0 ? (
          <AdminEmpty text="درخواست بازپرداختی ثبت نشده است." />
        ) : (
          <AdminTable head={["شبا", "وضعیت", "تاریخ"]}>
            {d.refunds.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="px-2 py-2 text-xs" dir="ltr">{r.iban}</td>
                <td className="px-2 py-2 text-xs">{refundStatusLabel(r.status)}</td>
                <td className="px-2 py-2 text-xs">{faDate(r.createdAt)}</td>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminCard>
    </AdminPage>
  );
}