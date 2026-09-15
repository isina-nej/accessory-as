"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/admin/Forms";
import { Field, TextInput } from "@/components/admin/ui";
import { inputCls } from "@/components/admin/ui";
import { uploadAction as uploadProductImage } from "@/server/upload-actions";
import { deleteProductImage, saveProduct, type ProductInput } from "@/server/admin-products";

export function ProductEdit({
  id, initial, attrNames, colors, sizes, images,
}: {
  id: string | null;
  initial: ProductInput;
  attrNames: { colors: string[]; sizes: string[] };
  colors: string[];
  sizes: string[];
  images: { id: string; url: string }[];
}) {
  const router = useRouter();
  const [imgMsg, setImgMsg] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <AdminForm
        initial={{ ...initial, colors: attrNames.colors, sizes: attrNames.sizes }}
        onSave={async (v) => {
          const r = await saveProduct(id, v);
          if (r.ok) router.push("/admin/products");
          return r.ok ? { ok: true } : r;
        }}
        submitLabel={id ? "ذخیره تغییرات" : "ساخت محصول"}
      >
        {(v, set) => (
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="نام"><TextInput value={v.title} onChange={(x) => set({ title: x })} maxLength={200} /></Field>
            <Field label="اسلاگ (انگلیسی)"><TextInput value={v.slug} onChange={(x) => set({ slug: x })} maxLength={150} dir="ltr" /></Field>
            <Field label="قیمت تومان">
              <input type="number" min={0} value={v.priceToman} onChange={(e) => set({ priceToman: Number(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="قیمت قبل (اختیاری)">
              <input type="number" min={0} value={v.oldPriceToman ?? ""} onChange={(e) => set({ oldPriceToman: e.target.value === "" ? null : Number(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="درصد تخفیف">
              <input type="number" min={0} max={90} value={v.discountPct ?? ""} onChange={(e) => set({ discountPct: e.target.value === "" ? null : Number(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="موجودی">
              <input type="number" min={0} value={v.stock} onChange={(e) => set({ stock: Number(e.target.value) })} className={inputCls} />
            </Field>
            <Field label="وضعیت">
              <select value={v.status} onChange={(e) => set({ status: e.target.value as ProductInput["status"] })} className={inputCls}>
                <option value="active">فعال</option>
                <option value="draft">پیش‌نویس</option>
                <option value="archived">بایگانی</option>
              </select>
            </Field>
            <Field label="SKU"><TextInput value={v.sku ?? ""} onChange={(x) => set({ sku: x || null })} maxLength={50} dir="ltr" /></Field>
            <Field label="رنگ‌ها (چندتایی)">
              <select multiple value={v.colors} onChange={(e) => set({ colors: [...e.target.selectedOptions].map((o) => o.value) })} className={`${inputCls} h-24`}>
                {colors.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </Field>
            <Field label="سایزها (چندتایی)">
              <select multiple value={v.sizes} onChange={(e) => set({ sizes: [...e.target.selectedOptions].map((o) => o.value) })} className={`${inputCls} h-24`}>
                {sizes.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </Field>
            <Field label="لینک عکس (اختیاری — یا از آپلود زیر)">
              <TextInput value={v.imageUrl ?? ""} onChange={(x) => set({ imageUrl: x || null })} maxLength={500} dir="ltr" placeholder="/uploads/… یا https://…" />
            </Field>
            <div className="md:col-span-2">
              <Field label="توضیحات">
                <textarea value={v.description ?? ""} onChange={(e) => set({ description: e.target.value || null })} className={`${inputCls} h-28`} maxLength={5000} />
              </Field>
            </div>
          </div>
        )}
      </AdminForm>
      {id && (
        <div className="rounded-2xl border bg-white p-4">
          <p className="mb-2 text-sm font-bold">عکس‌ها</p>
          <div className="flex flex-wrap gap-2">
            {images.map((im) => (
              <span key={im.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.url} alt="" className="h-20 w-20 rounded-lg border object-cover" />
                <button
                  className="absolute top-0 left-0 rounded bg-white/90 px-1 text-xs text-(--color-wine)"
                  onClick={async () => {
                    if (!confirm("حذف عکس؟")) return;
                    await deleteProductImage(im.id, id);
                    router.refresh();
                  }}
                >×</button>
              </span>
            ))}
          </div>
          <form
            className="mt-3 flex items-center gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.target as HTMLFormElement);
              setImgMsg("…");
              const r = await uploadProductImage(f);
              setImgMsg(r.ok ? r.url : r.error);
              if (r.ok) router.refresh();
            }}
          >
            <input type="file" name="file" accept="image/jpeg,image/png,image/webp" className="text-sm" required />
            <button className="rounded-lg bg-(--color-brand) px-3 py-1.5 text-sm text-white">آپلود</button>
            {imgMsg && <span className="text-xs text-(--color-muted-fg)" dir="ltr">{imgMsg}</span>}
          </form>
        </div>
      )}
    </div>
  );
}

