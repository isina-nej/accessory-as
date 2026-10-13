import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty, AdminPager, AdminTable } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { RoleCell } from "@/components/admin/RoleBtns";
import { listAdminUsers } from "@/server/admin-users";
import { faDate } from "@/lib/admin-labels";
import { toFa } from "@/lib/fa";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "کاربران | پنل" };

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const gate = await requirePermission("users.read");
  if (!gate.ok) redirect("/login?next=/admin/users");
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const { items, total, pageSize } = await listAdminUsers(q, page);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const query = new URLSearchParams(q ? { q } : {});
  return (
    <AdminPage active="/admin/users" roles={gate.roles}>
      <AdminCard title={`کاربران (${toFa(total)})`}>
        <form className="mb-3 flex gap-2" action="/admin/users">
          <input name="q" defaultValue={q} placeholder="جستجو با نام، ایمیل یا موبایل…" className="h-10 flex-1 rounded-lg border px-3 text-sm" aria-label="جستجوی کاربر" />
          <button className="h-10 rounded-lg bg-(--color-brand) px-4 text-sm text-white">جستجو</button>
          <Link href="/admin/users" className="flex h-10 items-center rounded-lg border px-4 text-sm">پاک‌کردن</Link>
        </form>
        {items.length === 0 ? (
          <AdminEmpty text={q ? "کاربری با این جستجو پیدا نشد." : "هنوز کاربری ثبت نشده است."} />
        ) : (
          <AdminTable head={["کاربر", "موبایل", "عضویت", "نقش‌ها", ""]}>
            {items.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="px-2 py-2">
                  <span className="font-bold">{u.name ?? "—"}</span>
                  <span className="block text-xs text-(--color-muted-fg)" dir="ltr">{u.email}</span>
                </td>
                <td className="px-2 py-2 text-xs" dir="ltr">{u.phoneNumber ?? "—"}</td>
                <td className="px-2 py-2 text-xs">{faDate(u.createdAt)}</td>
                <td className="px-2 py-2"><RoleCell userId={u.id} roles={u.roles} /></td>
                <td className="px-2 py-2"><Link href={`/admin/users/${u.id}`} className="text-xs text-(--color-brand)">پرونده</Link></td>
              </tr>
            ))}
          </AdminTable>
        )}
        <AdminPager basePath="/admin/users" query={query} page={page} pages={pages} />
      </AdminCard>
    </AdminPage>
  );
}