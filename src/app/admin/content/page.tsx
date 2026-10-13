import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { BannerForm, BannerListRow, FaqForm, FaqListRow, PageForm } from "@/components/admin/ContentForms";
import { listBanners, listFaqs, listPages } from "@/server/admin-content";
import { toFa } from "@/lib/fa";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "بنر و صفحات | پنل" };

export default async function AdminContent() {
  const gate = await requirePermission("content.read");
  if (!gate.ok) redirect("/login?next=/admin/content");
  const [banners, pages, faqs] = await Promise.all([listBanners(), listPages(), listFaqs()]);
  return (
    <AdminPage active="/admin/content" roles={gate.roles}>
      <AdminCard title="بنر جدید">
        <BannerForm id={null} initial={{ slot: "hero", title: "", subtitle: null, ctaLabel: null, ctaHref: "/shop", imageUrl: null, sort: 0, active: true, startsAt: "", endsAt: "" }} />
      </AdminCard>
      <AdminCard title={`بنرها (${toFa(banners.length)})`}>
        {banners.length === 0 ? (
          <AdminEmpty text="هنوز بنری ثبت نشده است." />
        ) : (
          <div className="space-y-4">
            {banners.map((b) => (
              <BannerListRow key={b.id} banner={b} />
            ))}
          </div>
        )}
      </AdminCard>
      <AdminCard title="صفحات">
        {pages.length === 0 ? (
          <AdminEmpty text="صفحه‌ای برای ویرایش وجود ندارد." />
        ) : (
          <div className="space-y-4">
            {pages.map((p) => (
              <div key={p.slug} className="rounded-xl border p-3">
                <p className="mb-2 text-sm font-bold" dir="ltr">{p.slug}</p>
                <PageForm page={p} />
              </div>
            ))}
          </div>
        )}
      </AdminCard>
      <AdminCard title="سؤال جدید">
        <FaqForm id={null} initial={{ q: "", a: "", sort: faqs.length, active: true }} />
      </AdminCard>
      <AdminCard title={`سوالات (${toFa(faqs.length)})`}>
        {faqs.length === 0 ? (
          <AdminEmpty text="هنوز سؤالی ثبت نشده است." />
        ) : (
          <div className="space-y-4">
            {faqs.map((f) => (
              <FaqListRow key={f.id} faq={f} />
            ))}
          </div>
        )}
      </AdminCard>
    </AdminPage>
  );
}