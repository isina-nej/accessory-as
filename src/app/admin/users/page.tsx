import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard, AdminTable } from "@/components/admin/ui";
import { RoleCell } from "@/components/admin/RoleBtns";
import { listAdminUsers } from "@/server/admin-users";
import { toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { getMyRoles } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "کاربران | پنل" };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  const roles = await getMyRoles();
  if (!roles.includes("admin")) redirect("/login?next=/admin/users");
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const { items, total } = await listAdminUsers(q, page);
  const pages = Math.max(1, Math.ceil(total / 20));
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin/users" roles={roles}>
          <AdminCard title={`کاربران (${toFa(total)}) — کلیک روی نقش = تغییر`}>
            <form className="mb-3 flex gap-2" action="/admin/users">
              <input name="q" defaultValue={q} placeholder="جستجو ایمیل…" className="h-10 flex-1 rounded-lg border px-3 text-sm" dir="ltr" />
              <button className="h-10 rounded-lg border px-4 text-sm">بگرد</button>
            </form>
            <AdminTable head={["کاربر", "نقش‌ها"]}>
              {items.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="px-2 py-2">
                    <span className="font-bold">{u.name ?? "—"}</span>
                    <span className="block text-xs text-(--color-muted-fg)" dir="ltr">{u.email}</span>
                  </td>
                  <td className="px-2 py-2"><RoleCell userId={u.id} roles={u.roles} /></td>
                </tr>
              ))}
            </AdminTable>
            {pages > 1 && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                {page > 1 && <Link className="rounded border px-3 py-1" href={`/admin/users?q=${encodeURIComponent(q)}&page=${page - 1}`}>قبلی</Link>}
                <span>{toFa(page)} از {toFa(pages)}</span>
                {page < pages && <Link className="rounded border px-3 py-1" href={`/admin/users?q=${encodeURIComponent(q)}&page=${page + 1}`}>بعدی</Link>}
              </div>
            )}
          </AdminCard>
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}
