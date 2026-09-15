import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard } from "@/components/admin/ui";
import { ProductEdit } from "@/components/admin/ProductEdit";
import { getAdminProduct, getProductAttrNames, listAdminCats, listAttrOptions } from "@/server/admin-products";
import { getMegaMenu } from "@/lib/menu";
import { getMyRoles, isStaff } from "@/lib/staff";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: id === "new" ? "محصول جدید | پنل" : "ویرایش محصول | پنل" };
}

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  if (!(await isStaff())) redirect("/login?next=/admin/products");
  const roles = await getMyRoles();
  const { id } = await params;
  const isNew = id === "new";
  const [row, cats, opts] = await Promise.all([
    isNew ? Promise.resolve(null) : getAdminProduct(id),
    listAdminCats(),
    listAttrOptions(),
  ]);
  const attrNames = isNew ? { colors: [], sizes: [] } : await getProductAttrNames(id);
  if (!isNew && !row) redirect("/admin/products");
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin/products" roles={roles}>
          <AdminCard title={isNew ? "محصول جدید" : `ویرایش: ${row?.title}`}>
            <CatNote cats={cats} />
            <ProductEdit
              id={isNew ? null : id}
              initial={{
                title: row?.title ?? "", slug: row?.slug ?? "",
                categoryId: row?.categoryId ?? null,
                priceToman: row?.priceToman ?? 0, oldPriceToman: row?.oldPriceToman ?? null,
                discountPct: row?.discountPct ?? null, stock: row?.stock ?? 0,
                status: (row?.status as "active" | "draft" | "archived") ?? "active",
                sku: row?.sku ?? null, description: row?.description ?? null,
                colors: [], sizes: [],
                imageUrl: row?.images?.[0]?.url ?? null,
              }}
              attrNames={attrNames}
              colors={opts.colors}
              sizes={opts.sizes}
              images={(row?.images ?? []).map((i) => ({ id: i.id, url: i.url }))}
            />
          </AdminCard>
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}

function CatNote({ cats }: { cats: { id: string; title: string }[] }) {
  return (
    <p className="mb-3 text-xs text-(--color-muted-fg)">
      دسته‌ها: {cats.map((c) => c.title).join("، ") || "—"} (تغییر دسته از پنل دسته‌ها)
    </p>
  );
}
