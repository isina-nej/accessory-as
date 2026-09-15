"use client";

import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/admin/Forms";
import { Field, TextInput } from "@/components/admin/ui";
import { saveProduct, type ProductInput } from "@/server/admin-products";

export function ProductNew({ cats, colors, sizes }: { cats: { id: string; title: string }[]; colors: string[]; sizes: string[] }) {
  const router = useRouter();
  const initial: ProductInput = {
    title: "", slug: "", categoryId: null, priceToman: 0, oldPriceToman: null,
    discountPct: null, stock: 0, status: "active", sku: null, description: null,
    colors: [], sizes: [], imageUrl: null,
  };
  return (
    <AdminForm
      initial={initial}
      onSave={async (v) => {
        const r = await saveProduct(null, v);
        if (r.ok) router.push("/admin/products");
        return r.ok ? { ok: true } : r;
      }}
      submitLabel="ساخت محصول"
    >
      {(v, set) => (
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="نام"><TextInput value={v.title} onChange={(x) => set({ title: x })} maxLength={200} /></Field>
          <Field label="اسلاگ (انگلیسی)"><TextInput value={v.slug} onChange={(x) => set({ slug: x })} maxLength={150} dir="ltr" /></Field>
          <Field label="دسته">
            <select value={v.categoryId ?? ""} onChange={(e) => set({ categoryId: e.target.value || null })} className="h-10 w-full rounded-lg border px-3 text-sm">
              <option value="">— بدون دسته —</option>
              {cats.map((c) => (<option key={c.id} value={c.id}>{c.title}</option>))}
            </select>
          </Field>
          <Field label="وضعیت">
            <select value={v.status} onChange={(e) => set({ status: e.target.value as ProductInput["status"] })} className="h-10 w-full rounded-lg border px-3 text-sm">
              <option value="active">فعال</option>
              <option value="draft">پیش‌نویس</option>
              <option value="archived">بایگانی</option>
            </select>
          </Field>
          <Field label="قیمت تومان">
            <input type="number" min={0} value={v.priceToman} onChange={(e) => set({ priceToman: Number(e.target.value) })} className="h-10 w-full rounded-lg border px-3 text-sm" />
          </Field>
          <Field label="موجودی">
            <input type="number" min={0} value={v.stock} onChange={(e) => set({ stock: Number(e.target.value) })} className="h-10 w-full rounded-lg border px-3 text-sm" />
          </Field>
          <Field label="رنگ‌ها">
            <select multiple value={v.colors} onChange={(e) => set({ colors: [...e.target.selectedOptions].map((o) => o.value) })} className="h-24 w-full rounded-lg border px-3 text-sm">
              {colors.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </Field>
          <Field label="سایزها">
            <select multiple value={v.sizes} onChange={(e) => set({ sizes: [...e.target.selectedOptions].map((o) => o.value) })} className="h-24 w-full rounded-lg border px-3 text-sm">
              {sizes.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </Field>
        </div>
      )}
    </AdminForm>
  );
}
