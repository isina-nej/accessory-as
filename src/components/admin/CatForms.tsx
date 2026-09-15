"use client";

import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/admin/Forms";
import { Field, TextInput } from "@/components/admin/ui";
import { ConfirmBtn } from "@/components/admin/Forms";
import { deleteCategory, saveCategory } from "@/server/admin-products";

export function CatNew() {
  const router = useRouter();
  return (
    <AdminForm initial={{ title: "", slug: "" }} onSave={async (v) => {
      const r = await saveCategory(null, v);
      if (r.ok) router.refresh();
      return r.ok ? { ok: true } : r;
    }} submitLabel="ساخت دسته">
      {(v, set) => (
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="نام"><TextInput value={v.title} onChange={(x) => set({ title: x })} maxLength={100} /></Field>
          <Field label="اسلاگ"><TextInput value={v.slug} onChange={(x) => set({ slug: x })} maxLength={100} dir="ltr" /></Field>
        </div>
      )}
    </AdminForm>
  );
}

export function CatRow({ id, title, slug, count }: { id: string; title: string; slug: string; count: number }) {
  const router = useRouter();
  return (
    <tr className="border-b">
      <td className="px-2 py-2 font-bold">{title}<span className="block text-xs font-normal text-(--color-muted-fg)">{slug} — {count} محصول</span></td>
      <td className="px-2 py-2">
        <AdminForm initial={{ title, slug }} onSave={(v) => saveCategory(id, v)} submitLabel="ذخیره">
          {(v, set) => (
            <div className="flex gap-2">
              <input value={v.title} onChange={(e) => set({ title: e.target.value })} className="h-9 flex-1 rounded-lg border px-2 text-sm" maxLength={100} />
              <input value={v.slug} onChange={(e) => set({ slug: e.target.value })} className="h-9 w-32 rounded-lg border px-2 text-sm" maxLength={100} dir="ltr" />
              <button className="h-9 rounded-lg bg-(--color-brand) px-3 text-sm text-white">ذخیره</button>
            </div>
          )}
        </AdminForm>
      </td>
      <td className="px-2 py-2">
        <ConfirmBtn label="حذف" onConfirm={() => deleteCategory(id).then((r) => { if (r.ok) router.refresh(); return r; })} />
      </td>
    </tr>
  );
}
