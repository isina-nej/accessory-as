import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard, AdminTable } from "@/components/admin/ui";
import { CampaignForm, CouponDel, CouponForm, ShipForm } from "@/components/admin/MarketingForms";
import { getCampaign, listCoupons, listShipping } from "@/server/admin-content";
import { formatToman, toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { getMyRoles } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "مارکتینگ | پنل" };

export default async function AdminMarketing() {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  const roles = await getMyRoles();
  if (!roles.includes("admin")) redirect("/login?next=/admin/marketing");
  const [coupons, ships, camp] = await Promise.all([listCoupons(), listShipping(), getCampaign()]);
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin/marketing" roles={roles}>
          <AdminCard title="کمپین شگفت‌انگیز">
            <CampaignForm initial={{
              title: camp?.title ?? "پیشنهاد شگفت‌انگیز",
              active: camp?.active ?? true,
              endsAt: camp?.endsAt ? new Date(camp.endsAt).toISOString().slice(0, 16) : "",
            }} />
          </AdminCard>
          <AdminCard title="کوپن جدید">
            <CouponForm id={null} initial={{ code: "", pct: 10, maxToman: null, minToman: null, active: true }} />
          </AdminCard>
          <AdminCard title={`کوپن‌ها (${coupons.length})`}>
            <div className="space-y-4">
              {coupons.map((c) => (
                <div key={c.id} className="rounded-xl border p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold" dir="ltr">{c.code} — ٪{toFa(c.pct)}</span>
                    <CouponDel id={c.id} />
                  </div>
                  <CouponForm id={c.id} initial={{ code: c.code, pct: c.pct, maxToman: c.maxToman, minToman: c.minToman, active: c.active }} />
                </div>
              ))}
            </div>
          </AdminCard>
          <AdminCard title="روش ارسال جدید">
            <ShipForm id={null} initial={{ slug: "", title: "", feeToman: 0, freeOverToman: 500000 }} />
          </AdminCard>
          <AdminCard title={`روش‌های ارسال (${ships.length})`}>
            <AdminTable head={["روش", "هزینه", "فرم"]}>
              {ships.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="px-2 py-2 font-bold">{m.title}<span className="block text-xs font-normal text-(--color-muted-fg)" dir="ltr">{m.slug}</span></td>
                  <td className="px-2 py-2 text-xs">{formatToman(m.feeToman)}</td>
                  <td className="px-2 py-2"><ShipForm id={m.id} initial={{ slug: m.slug, title: m.title, feeToman: m.feeToman, freeOverToman: m.freeOverToman }} /></td>
                </tr>
              ))}
            </AdminTable>
          </AdminCard>
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}
