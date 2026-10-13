import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty, AdminPager, AdminTable } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { ReviewBtns } from "@/components/admin/ModerForms";
import { listAdminReviews } from "@/server/admin-content";
import { faDate } from "@/lib/admin-labels";
import { toFa } from "@/lib/fa";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "دیدگاه‌ها | پنل" };

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ pending?: string; q?: string; page?: string }> }) {
  const gate = await requirePermission("reviews.read");
  if (!gate.ok) redirect("/login?next=/admin/reviews");
  const sp = await searchParams;
  const pending = sp.pending === "1";
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const { items, total, pageSize } = await listAdminReviews({ pendingOnly: pending, q, page });
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const query = new URLSearchParams({ ...(pending ? { pending: "1" } : {}), ...(q ? { q } : {}) });
  return (
    <AdminPage active="/admin/reviews" roles={gate.roles}>
      <AdminCard
        title={`دیدگاه‌ها (${toFa(total)})`}
        action={<Link href={pending ? "/admin/reviews" : "/admin/reviews?pending=1"} className="rounded-lg border px-3 py-1 text-xs">{pending ? "همه" : "فقط در انتظار"}</Link>}
      >
        <form className="mb-3 flex gap-2" action="/admin/reviews">
          <input name="q" defaultValue={q} placeholder="جستجو با نویسنده، متن یا نام محصول…" className="h-10 flex-1 rounded-lg border px-3 text-sm" aria-label="جستجوی دیدگاه" />
          {pending && <input type="hidden" name="pending" value="1" />}
          <button className="h-10 rounded-lg bg-(--color-brand) px-4 text-sm text-white">جستجو</button>
          <Link href="/admin/reviews" className="flex h-10 items-center rounded-lg border px-4 text-sm">پاک‌کردن</Link>
        </form>
        {items.length === 0 ? (
          <AdminEmpty text={query.size > 0 ? "دیدگاهی با این فیلترها پیدا نشد." : "هنوز دیدگاهی ثبت نشده است."} />
        ) : (
          <AdminTable head={["محصول", "دیدگاه", "امتیاز", "تاریخ", "وضعیت", ""]}>
            {items.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="px-2 py-2 text-xs">
                  <Link href={`/admin/products/${r.productId}`} className="text-(--color-brand) hover:underline">{r.productTitle ?? "محصول حذف‌شده"}</Link>
                </td>
                <td className="px-2 py-2 text-xs">
                  <span className="font-bold">{r.author}</span>
                  <span className="block max-w-100 truncate text-(--color-muted-fg)">{r.body}</span>
                </td>
                <td className="px-2 py-2 text-xs">{toFa(r.rating)} از {toFa(5)}</td>
                <td className="px-2 py-2 text-xs">{faDate(r.createdAt)}</td>
                <td className="px-2 py-2 text-xs">{r.verified ? "تأییدشده" : "در انتظار"}</td>
                <td className="px-2 py-2"><ReviewBtns id={r.id} verified={r.verified} /></td>
              </tr>
            ))}
          </AdminTable>
        )}
        <AdminPager basePath="/admin/reviews" query={query} page={page} pages={pages} />
      </AdminCard>
    </AdminPage>
  );
}