import { redirect } from "next/navigation";
import { AdminCard } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { ProductEdit } from "@/components/admin/ProductEdit";
import { getAdminProduct, getProductAttrNames, listAdminCats, listAttrOptions } from "@/server/admin-products";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "ویرایش محصول | پنل" };

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission("products.write");
  if (!gate.ok) redirect("/login?next=/admin/products");
  const { id } = await params;
  const [row, cats, opts] = await Promise.all([
    getAdminProduct(id),
    listAdminCats(),
    listAttrOptions(),
  ]);
  if (!row) redirect("/admin/products");
  const attrNames = await getProductAttrNames(id);
  return (
    <AdminPage active="/admin/products" roles={gate.roles}>
      <AdminCard title={`ویرایش: ${row.title}`}>
        <p className="mb-3 text-xs text-(--color-muted-fg)">
          دسته‌ها: {cats.map((c) => c.title).join("، ") || "—"} (تغییر دسته از صفحه محصول)
        </p>
        <ProductEdit
          id={id}
          initial={{
            title: row.title, slug: row.slug,
            categoryId: row.categoryId ?? null,
            priceToman: row.priceToman, oldPriceToman: row.oldPriceToman ?? null,
            discountPct: row.discountPct ?? null, stock: row.stock,
            status: (row.status as "active" | "draft" | "archived") ?? "active",
            sku: row.sku ?? null, description: row.description ?? null,
            colors: [], sizes: [],
            imageUrl: row.images?.[0]?.url ?? null,
          }}
          attrNames={attrNames}
          colors={opts.colors}
          sizes={opts.sizes}
          images={(row.images ?? []).map((i) => ({ id: i.id, url: i.url }))}
        />
      </AdminCard>
    </AdminPage>
  );
}