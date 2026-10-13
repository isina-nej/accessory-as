import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty, AdminTable } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { CampaignForm, CouponDel, CouponForm, ShipDel, ShipForm, toLocalInput } from "@/components/admin/MarketingForms";
import { getCampaign, listCoupons, listShipping } from "@/server/admin-content";
import { faDate } from "@/lib/admin-labels";
import { formatToman, toFa } from "@/lib/fa";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "مارکتینگ | پنل" };

export default async function AdminMarketing() {
  const gate = await requirePermission("marketing.read");
  if (!gate.ok) redirect("/login?next=/admin/marketing");
  const [coupons, ships, camp] = await Promise.all([listCoupons(), listShipping(), getCampaign()]);
  return (
    <AdminPage active="/admin/marketing" roles={gate.roles}>
      <AdminCard title="کمپین شگفت‌انگیز">
        <CampaignForm initial={{
          title: camp?.title ?? "پیشنهاد شگفت‌انگیز",
          active: camp?.active ?? true,
          endsAt: camp?.endsAt ? toLocalInput(camp.endsAt) : "",
        }} />
      </AdminCard>
      <AdminCard title="کوپن جدید">
        <CouponForm id={null} initial={{ code: "", pct: 10, maxToman: null, minToman: null, active: true, expiresAt: "" }} />
      </AdminCard>
      <AdminCard title={`کوپن‌ها (${toFa(coupons.length)})`}>
        {coupons.length === 0 ? (
          <AdminEmpty text="هنوز کوپنی ثبت نشده است." />
        ) : (
          <div className="space-y-4">
            {coupons.map((c) => (
              <div key={c.id} className="rounded-xl border p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-bold"><span dir="ltr">{c.code}</span> — {toFa(c.pct)}٪</span>
                  <span className="flex items-center gap-2">
                    {!c.active && <span className="text-[11px] text-(--color-wine)">غیرفعال</span>}
                    {c.expiresAt && <span className="text-[11px] text-(--color-muted-fg)">انقضا: {faDate(c.expiresAt)}</span>}
                    <CouponDel id={c.id} />
                  </span>
                </div>
                <CouponForm id={c.id} initial={{ code: c.code, pct: c.pct, maxToman: c.maxToman, minToman: c.minToman, active: c.active, expiresAt: c.expiresAt ? toLocalInput(c.expiresAt) : "" }} />
              </div>
            ))}
          </div>
        )}
      </AdminCard>
      <AdminCard title="روش ارسال جدید">
        <ShipForm id={null} initial={{ slug: "", title: "", feeToman: 0, freeOverToman: 500000 }} />
      </AdminCard>
      <AdminCard title={`روش‌های ارسال (${toFa(ships.length)})`}>
        {ships.length === 0 ? (
          <AdminEmpty text="هنوز روش ارسالی ثبت نشده است." />
        ) : (
          <AdminTable head={["روش", "هزینه", "ارسال رایگان بالای", "ویرایش", ""]}>
            {ships.map((m) => (
              <tr key={m.id} className="border-b">
                <td className="px-2 py-2 font-bold">{m.title}<span className="block text-xs font-normal text-(--color-muted-fg)" dir="ltr">{m.slug}</span></td>
                <td className="px-2 py-2 text-xs">{formatToman(m.feeToman)}</td>
                <td className="px-2 py-2 text-xs">{m.freeOverToman ? formatToman(m.freeOverToman) : "—"}</td>
                <td className="px-2 py-2"><ShipForm id={m.id} initial={{ slug: m.slug, title: m.title, feeToman: m.feeToman, freeOverToman: m.freeOverToman }} /></td>
                <td className="px-2 py-2"><ShipDel id={m.id} /></td>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminCard>
    </AdminPage>
  );
}