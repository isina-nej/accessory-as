import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard, AdminTable } from "@/components/admin/ui";
import { ProductDel } from "@/components/admin/ProductDel";
import { StockCell } from "@/components/admin/StockCell";
import { listAdminProducts } from "@/server/admin-products";
import { formatToman, toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { getMyRoles, isStaff } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "محصولات | پنل" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  if (!(await isStaff())) redirect("/login?next=/admin/products");
  const roles = await getMyRoles();
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const { items, total } = await listAdminProducts(q, page);
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin/products" roles={roles}>
          <AdminCard
            title={`محصولات (${toFa(total)})`}
            action={<Link href="/admin/products/new" className="rounded-lg bg-(--color-brand) px-3 py-1.5 text-sm text-white">جدید</Link>}
          >
            <form className="mb-3 flex gap-2" action="/admin/products">
              <input name="q" defaultValue={q} placeholder="جستجو نام…" className="h-10 flex-1 rounded-lg border px-3 text-sm" />
              <button className="h-10 rounded-lg border px-4 text-sm">بگرد</button>
            </form>
            <AdminTable head={["نام", "قیمت", "موجودی", "وضعیت", "عملیات"]}>
              {items.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="px-2 py-2">
                    <Link href={`/admin/products/${p.id}`} className="font-bold hover:underline">{p.title}</Link>
                    <span className="block text-xs text-(--color-muted-fg)">{p.slug}</span>
                  </td>
                  <td className="px-2 py-2 text-xs">{formatToman(p.priceToman)}</td>
                  <td className="px-2 py-2">
                    <StockCell id={p.id} stock={p.stock} />
                  </td>
                  <td className="px-2 py-2 text-xs">{p.status}</td>
                  <td className="px-2 py-2">
                    <ProductDel id={p.id} />
                  </td>
                </tr>
              ))}
            </AdminTable>
            <Pager q={q} page={page} total={total} />
          </AdminCard>
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}

function Pager({ q, page, total }: { q: string; page: number; total: number }) {
  const pages = Math.max(1, Math.ceil(total / 20));
  if (pages <= 1) return null;
  return (
    <div className="mt-3 flex items-center gap-2 text-sm">
      {page > 1 && <Link className="rounded border px-3 py-1" href={`/admin/products?q=${encodeURIComponent(q)}&page=${page - 1}`}>قبلی</Link>}
      <span>{toFa(page)} از {toFa(pages)}</span>
      {page < pages && <Link className="rounded border px-3 py-1" href={`/admin/products?q=${encodeURIComponent(q)}&page=${page + 1}`}>بعدی</Link>}
    </div>
  );
}
