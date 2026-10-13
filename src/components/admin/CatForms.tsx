"use client";

import { useRouter } from "next/navigation";
import { AdminForm, ConfirmBtn } from "@/components/admin/Forms";
import { Field, TextInput, inputCls } from "@/components/admin/ui";
import { toFa } from "@/lib/fa";
import { deleteCategory, saveCategory } from "@/server/admin-products";

type Cat = { id: string; title: string; slug: string; parentId: string | null; count: number };

export function CatNew({ cats }: { cats: Cat[] }) {
  const router = useRouter();
  return (
    <AdminForm
      initial={{ title: "", slug: "", parentId: "" }}
      onSave={async (v) => {
        const r = await saveCategory(null, { title: v.title, slug: v.slug, parentId: v.parentId || null });
        if (r.ok) router.refresh();
        return r.ok ? { ok: true } : r;
      }}
      submitLabel="ساخت دسته"
    >
      {(v, set) => (
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="نام"><TextInput value={v.title} onChange={(x) => set({ title: x })} maxLength={100} /></Field>
          <Field label="اسلاگ"><TextInput value={v.slug} onChange={(x) => set({ slug: x })} maxLength={100} dir="ltr" /></Field>
          <Field label="زیرمجموعهٔ">
            <select value={v.parentId} onChange={(e) => set({ parentId: e.target.value })} className={inputCls} aria-label="دسته والد">
              <option value="">— بدون والد —</option>
              {cats.map((c) => (<option key={c.id} value={c.id}>{c.title}</option>))}
            </select>
          </Field>
        </div>
      )}
    </AdminForm>
  );
}

export function CatRow({ cat, parentTitle, cats }: { cat: Cat; parentTitle: string | null; cats: Cat[] }) {
  const router = useRouter();
  return (
    <tr className="border-b">
      <td className="px-2 py-2 font-bold">
        {cat.title}
        <span className="block text-xs font-normal text-(--color-muted-fg)" dir="ltr">{cat.slug}</span>
        <span className="block text-xs font-normal text-(--color-muted-fg)">
          {toFa(cat.count)} محصول{parentTitle ? ` — زیرمجموعهٔ «${parentTitle}»` : ""}
        </span>
      </td>
      <td className="px-2 py-2">
        <AdminForm
          initial={{ title: cat.title, slug: cat.slug, parentId: cat.parentId ?? "" }}
          onSave={async (v) => {
            const r = await saveCategory(cat.id, { title: v.title, slug: v.slug, parentId: v.parentId || null });
            if (r.ok) router.refresh();
            return r.ok ? { ok: true } : r;
          }}
          submitLabel="ذخیره"
        >
          {(v, set) => (
            <div className="flex flex-wrap gap-2">
              <input value={v.title} onChange={(e) => set({ title: e.target.value })} className="h-9 min-w-0 flex-1 rounded-lg border px-2 text-sm" maxLength={100} aria-label="نام دسته" />
              <input value={v.slug} onChange={(e) => set({ slug: e.target.value })} className="h-9 w-32 rounded-lg border px-2 text-sm" maxLength={100} dir="ltr" aria-label="اسلاگ دسته" />
              <select value={v.parentId} onChange={(e) => set({ parentId: e.target.value })} className="h-9 rounded-lg border px-2 text-sm" aria-label="دسته والد">
                <option value="">— بدون والد —</option>
                {cats.filter((c) => c.id !== cat.id).map((c) => (<option key={c.id} value={c.id}>{c.title}</option>))}
              </select>
              <button className="h-9 rounded-lg bg-(--color-brand) px-3 text-sm text-white">ذخیره</button>
            </div>
          )}
        </AdminForm>
      </td>
      <td className="px-2 py-2">
        <ConfirmBtn label="حذف" onConfirm={() => deleteCategory(cat.id).then((r) => { if (r.ok) router.refresh(); return r; })} />
      </td>
    </tr>
  );
}