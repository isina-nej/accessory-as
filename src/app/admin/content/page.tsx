import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard } from "@/components/admin/ui";
import { BannerDel, BannerForm, FaqDel, FaqForm, PageForm } from "@/components/admin/ContentForms";
import { listBanners, listFaqs, listPages } from "@/server/admin-content";
import { getMegaMenu } from "@/lib/menu";
import { getMyRoles, isStaff } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "بنر و صفحات | پنل" };

export default async function AdminContent() {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  if (!(await isStaff("content"))) redirect("/login?next=/admin/content");
  const roles = await getMyRoles();
  const [banners, pages, faqs] = await Promise.all([listBanners(), listPages(), listFaqs()]);
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin/content" roles={roles}>
          <AdminCard title="بنر جدید">
            <BannerForm id={null} initial={{ slot: "hero", title: "", subtitle: null, ctaLabel: null, ctaHref: "/shop", imageUrl: null, sort: 0, active: true }} />
          </AdminCard>
          <AdminCard title={`بنرها (${banners.length})`}>
            <div className="space-y-4">
              {banners.map((b) => (
                <div key={b.id} className="rounded-xl border p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold">{b.slot} — {b.title}</span>
                    <BannerDel id={b.id} />
                  </div>
                  <BannerForm id={b.id} initial={{ slot: b.slot, title: b.title, subtitle: b.subtitle, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref, imageUrl: b.imageUrl, sort: b.sort, active: b.active }} />
                </div>
              ))}
            </div>
          </AdminCard>
          <AdminCard title="صفحات">
            <div className="space-y-4">
              {pages.map((p) => (
                <div key={p.slug} className="rounded-xl border p-3">
                  <p className="mb-2 text-sm font-bold">{p.slug}</p>
                  <PageForm page={p} />
                </div>
              ))}
            </div>
          </AdminCard>
          <AdminCard title="سؤال جدید">
            <FaqForm id={null} initial={{ q: "", a: "", sort: faqs.length, active: true }} />
          </AdminCard>
          <AdminCard title={`سوالات (${faqs.length})`}>
            <div className="space-y-4">
              {faqs.map((f) => (
                <div key={f.id} className="rounded-xl border p-3">
                  <div className="mb-2 flex justify-end"><FaqDel id={f.id} /></div>
                  <FaqForm id={f.id} initial={{ q: f.q, a: f.a, sort: f.sort, active: f.active }} />
                </div>
              ))}
            </div>
          </AdminCard>
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}
