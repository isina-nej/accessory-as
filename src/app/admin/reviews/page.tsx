import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard, AdminTable } from "@/components/admin/ui";
import { ReviewBtns } from "@/components/admin/ModerForms";
import { listAdminReviews } from "@/server/admin-content";
import { toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { getMyRoles, isStaff } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "دیدگاه‌ها | پنل" };

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ pending?: string }> }) {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  if (!(await isStaff("support"))) redirect("/login?next=/admin/reviews");
  const roles = await getMyRoles();
  const sp = await searchParams;
  const pending = sp.pending === "1";
  const rows = await listAdminReviews(pending);
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin/reviews" roles={roles}>
          <AdminCard
            title={`دیدگاه‌ها (${toFa(rows.length)})`}
            action={<Link href={pending ? "/admin/reviews" : "/admin/reviews?pending=1"} className="rounded-lg border px-3 py-1 text-xs">{pending ? "همه" : "فقط در انتظار"}</Link>}
          >
            <AdminTable head={["دیدگاه", "امتیاز", "وضعیت", ""]}>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="px-2 py-2">
                    <span className="font-bold">{r.author}</span>
                    <span className="block max-w-100 truncate text-xs text-(--color-muted-fg)">{r.body}</span>
                  </td>
                  <td className="px-2 py-2 text-xs">{toFa(r.rating)} از ۵</td>
                  <td className="px-2 py-2 text-xs">{r.verified ? "تأییدشده" : "در انتظار"}</td>
                  <td className="px-2 py-2"><ReviewBtns id={r.id} verified={r.verified} /></td>
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
