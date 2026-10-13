import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty, AdminTable } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { CatNew, CatRow } from "@/components/admin/CatForms";
import { listAdminCats } from "@/server/admin-products";
import { requirePermission } from "@/lib/staff";
import { toFa } from "@/lib/fa";

export const dynamic = "force-dynamic";
export const metadata = { title: "دسته‌ها | پنل" };

export default async function AdminCats() {
  const gate = await requirePermission("categories.read");
  if (!gate.ok) redirect("/login?next=/admin/categories");
  const cats = await listAdminCats();
  const titleById = new Map(cats.map((c) => [c.id, c.title]));
  return (
    <AdminPage active="/admin/categories" roles={gate.roles}>
      <AdminCard title="دسته جدید">
        <CatNew cats={cats} />
      </AdminCard>
      <AdminCard title={`دسته‌ها (${toFa(cats.length)})`}>
        {cats.length === 0 ? (
          <AdminEmpty text="هنوز دسته‌ای ثبت نشده است." />
        ) : (
          <AdminTable head={["دسته", "ویرایش", ""]}>
            {cats.map((c) => (
              <CatRow key={c.id} cat={c} parentTitle={c.parentId ? titleById.get(c.parentId) ?? null : null} cats={cats} />
            ))}
          </AdminTable>
        )}
      </AdminCard>
    </AdminPage>
  );
}