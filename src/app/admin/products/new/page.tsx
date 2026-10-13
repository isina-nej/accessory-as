import { redirect } from "next/navigation";
import { AdminCard } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { ProductEdit } from "@/components/admin/ProductEdit";
import { listAdminCats, listAttrOptions } from "@/server/admin-products";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "محصول جدید | پنل" };

export default async function ProductNewPage() {
  const gate = await requirePermission("products.write");
  if (!gate.ok) redirect("/login?next=/admin/products/new");
  const [cats, opts] = await Promise.all([listAdminCats(), listAttrOptions()]);
  const initial = {
    title: "", slug: "", categoryId: null, priceToman: 0, oldPriceToman: null,
    discountPct: null, stock: 0, status: "active" as const, sku: null, description: null,
    colors: [] as string[], sizes: [] as string[], imageUrl: null,
  };
  return (
    <AdminPage active="/admin/products" roles={gate.roles}>
      <AdminCard title="محصول جدید">
        <p className="mb-3 text-xs text-(--color-muted-fg)">
          دسته‌ها: {cats.map((c) => c.title).join("، ") || "—"}
        </p>
        <ProductEdit id={null} initial={initial} attrNames={{ colors: [], sizes: [] }} colors={opts.colors} sizes={opts.sizes} images={[]} />
      </AdminCard>
    </AdminPage>
  );
}