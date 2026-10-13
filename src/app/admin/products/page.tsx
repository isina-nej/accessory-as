import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty, AdminPager, AdminTable } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { ProductDel } from "@/components/admin/ProductDel";
import { StockCell } from "@/components/admin/StockCell";
import { listAdminCats, listAdminProducts } from "@/server/admin-products";
import { formatToman, toFa } from "@/lib/fa";
import { productStatusLabel } from "@/lib/order-status";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "محصولات | پنل" };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; stock?: string; cat?: string; min?: string; max?: string; page?: string }> }) {
  const gate = await requirePermission("products.read");
  if (!gate.ok) redirect("/login?next=/admin/products");
  const roles = gate.roles;
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = ["active", "draft", "archived"].includes(sp.status ?? "") ? sp.status : "";
  const stock = ["available", "low", "out"].includes(sp.stock ?? "") ? (sp.stock as "available" | "low" | "out") : "all";
  const cat = sp.cat && /^[0-9a-f-]{36}$/i.test(sp.cat) ? sp.cat : "";
  const minPrice = sp.min ? Number(sp.min) : undefined;
  const maxPrice = sp.max ? Number(sp.max) : undefined;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const [{ items, total, pageSize }, cats] = await Promise.all([
    listAdminProducts({ q, status, stock, categoryId: cat, minPrice, maxPrice, page }),
    listAdminCats(),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const query = new URLSearchParams({
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(stock !== "all" ? { stock } : {}),
    ...(cat ? { cat } : {}),
    ...(sp.min ? { min: sp.min } : {}),
    ...(sp.max ? { max: sp.max } : {}),
  });
  const catTitle = cats.find((c) => c.id === cat)?.title;

  return (
    <AdminPage active="/admin/products" roles={roles}>
      <AdminCard
        title={`محصولات (${toFa(total)})`}
        action={<Link href="/admin/products/new" className="rounded-lg bg-(--color-brand) px-3 py-1.5 text-sm text-white">محصول جدید</Link>}
      >
        <form className="mb-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5" action="/admin/products">
          <input name="q" defaultValue={q} placeholder="جستجوی نام، اسلاگ یا SKU…" className="h-10 rounded-lg border px-3 text-sm lg:col-span-2" aria-label="جستجوی محصول" />
          <select name="status" defaultValue={status} className="h-10 rounded-lg border px-3 text-sm" aria-label="فیلتر وضعیت">
            <option value="">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="draft">پیش‌نویس</option>
            <option value="archived">بایگانی‌شده</option>
          </select>
          <select name="stock" defaultValue={stock} className="h-10 rounded-lg border px-3 text-sm" aria-label="فیلتر موجودی">
            <option value="all">همه موجودی‌ها</option>
            <option value="available">موجود</option>
            <option value="low">موجودی کم</option>
            <option value="out">ناموجود</option>
          </select>
          <select name="cat" defaultValue={cat} className="h-10 rounded-lg border px-3 text-sm" aria-label="فیلتر دسته">
            <option value="">همه دسته‌ها</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <button className="h-10 rounded-lg bg-(--color-brand) px-4 text-sm text-white">اعمال فیلتر</button>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-5">
            <input name="min" defaultValue={sp.min ?? ""} inputMode="numeric" placeholder="حداقل قیمت تومان" className="h-10 min-w-0 flex-1 rounded-lg border px-3 text-sm" aria-label="حداقل قیمت" />
            <input name="max" defaultValue={sp.max ?? ""} inputMode="numeric" placeholder="حداکثر قیمت تومان" className="h-10 min-w-0 flex-1 rounded-lg border px-3 text-sm" aria-label="حداکثر قیمت" />
            <Link href="/admin/products" className="flex h-10 items-center rounded-lg border px-4 text-sm">پاک‌کردن</Link>
          </div>
        </form>
        {items.length === 0 ? (
          <AdminEmpty
            text={query.size > 0 ? "محصولی با این فیلترها پیدا نشد." : "هنوز محصولی ثبت نشده است."}
            action={<Link href="/admin/products/new" className="rounded-lg bg-(--color-brand) px-3 py-1.5 text-sm text-white">ثبت اولین محصول</Link>}
          />
        ) : (
          <AdminTable head={["نام", "دسته", "قیمت", "موجودی", "فروش", "وضعیت", "عملیات"]}>
            {items.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="px-2 py-2">
                  <Link href={`/admin/products/${p.id}`} className="font-bold hover:underline">{p.title}</Link>
                  <span className="block text-xs text-(--color-muted-fg)" dir="ltr">{p.slug}</span>
                </td>
                <td className="px-2 py-2 text-xs">{p.categoryTitle ?? "—"}</td>
                <td className="px-2 py-2 text-xs">
                  {formatToman(p.priceToman)}
                  {p.oldPriceToman ? <span className="block text-[11px] text-(--color-muted-fg) line-through">{formatToman(p.oldPriceToman)}</span> : null}
                  {p.discountPct ? <span className="block text-[11px] text-(--color-wine)">{toFa(p.discountPct)}٪ تخفیف</span> : null}
                </td>
                <td className="px-2 py-2">
                  <StockCell id={p.id} stock={p.stock} />
                </td>
                <td className="px-2 py-2 text-xs">{toFa(p.soldCount)}</td>
                <td className="px-2 py-2 text-xs">{productStatusLabel(p.status)}</td>
                <td className="px-2 py-2">
                  <ProductDel id={p.id} title={p.title} />
                </td>
              </tr>
            ))}
          </AdminTable>
        )}
        <AdminPager basePath="/admin/products" query={query} page={page} pages={pages} />
        {catTitle ? <p className="mt-2 text-xs text-(--color-muted-fg)">فیلتر دسته: {catTitle}</p> : null}
      </AdminCard>
    </AdminPage>
  );
}