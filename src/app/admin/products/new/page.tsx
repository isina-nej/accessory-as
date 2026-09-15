import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard } from "@/components/admin/ui";
import { ProductNew } from "@/components/admin/ProductNew";
import { listAdminCats, listAttrOptions } from "@/server/admin-products";
import { getMegaMenu } from "@/lib/menu";
import { getMyRoles, isStaff } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "محصول جدید | پنل" };

export default async function ProductNewPage() {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  if (!(await isStaff())) redirect("/login?next=/admin/products/new");
  const roles = await getMyRoles();
  const [cats, opts] = await Promise.all([listAdminCats(), listAttrOptions()]);
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin/products" roles={roles}>
          <AdminCard title="محصول جدید">
            <ProductNew cats={cats} colors={opts.colors} sizes={opts.sizes} />
          </AdminCard>
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}
