import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard, AdminTable } from "@/components/admin/ui";
import { CatNew, CatRow } from "@/components/admin/CatForms";
import { listAdminCats } from "@/server/admin-products";
import { getMegaMenu } from "@/lib/menu";
import { getMyRoles, isStaff } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "دسته‌ها | پنل" };

export default async function AdminCats() {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  if (!(await isStaff())) redirect("/login?next=/admin/categories");
  const roles = await getMyRoles();
  const cats = await listAdminCats();
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin/categories" roles={roles}>
          <AdminCard title="دسته جدید"><CatNew /></AdminCard>
          <AdminCard title={`دسته‌ها (${cats.length})`}>
            <AdminTable head={["دسته", "ویرایش", ""]}>
              {cats.map((c) => (
                <CatRow key={c.id} id={c.id} title={c.title} slug={c.slug} count={c.count} />
              ))}
            </AdminTable>
          </AdminCard>
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}
