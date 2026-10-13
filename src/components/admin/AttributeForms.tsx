"use client";

import { useRouter } from "next/navigation";
import { AdminForm, ConfirmBtn } from "@/components/admin/Forms";
import { Field, TextInput } from "@/components/admin/ui";
import { toFa } from "@/lib/fa";
import { deleteAttribute, saveAttribute } from "@/server/admin-products";

const TYPE_FA = { color: "رنگ", size: "سایز" } as const;

export function AttrNew() {
  const router = useRouter();
  return (
    <AdminForm
      initial={{ type: "color" as "color" | "size", label: "", value: "" }}
      onSave={async (v) => {
        const r = await saveAttribute(null, v);
        if (r.ok) router.refresh();
        return r.ok ? { ok: true } : r;
      }}
      submitLabel="افزودن ویژگی"
    >
      {(v, set) => (
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="نوع">
            <select
              value={v.type}
              onChange={(e) => {
                const type = e.target.value as "color" | "size";
                set(type === "size" ? { type, label: v.value, value: v.value } : { type });
              }}
              className="h-10 w-full rounded-lg border px-3 text-sm"
              aria-label="نوع ویژگی"
            >
              <option value="color">رنگ</option>
              <option value="size">سایز</option>
            </select>
          </Field>
          <Field label="برچسب"><TextInput value={v.label} onChange={(x) => set({ label: x })} maxLength={50} /></Field>
          <Field label="مقدار"><TextInput value={v.value} onChange={(x) => set({ value: x, ...(v.type === "size" ? { label: x } : {}) })} maxLength={50} dir={v.type === "size" ? "ltr" : undefined} /></Field>
        </div>
      )}
    </AdminForm>
  );
}

export function AttrRow({ id, type, label, value, productCount }: { id: string; type: string; label: string; value: string; productCount: number }) {
  const router = useRouter();
  return (
    <tr className="border-b">
      <td className="px-2 py-2 font-bold">
        {label}
        <span className="block text-xs font-normal text-(--color-muted-fg)">{TYPE_FA[type as "color" | "size"] ?? type}</span>
      </td>
      <td className="px-2 py-2 text-xs" dir="ltr">{value}</td>
      <td className="px-2 py-2 text-xs">{toFa(productCount)} محصول</td>
      <td className="px-2 py-2">
        <div className="flex flex-wrap gap-2">
          <AdminForm
            initial={{ type: (type === "size" ? "size" : "color") as "color" | "size", label, value }}
            onSave={async (v) => {
              const r = await saveAttribute(id, v);
              if (r.ok) router.refresh();
              return r.ok ? { ok: true } : r;
            }}
            submitLabel="ذخیره"
          >
            {(v, set) => (
              <div className="flex flex-wrap gap-2">
                <input value={v.label} onChange={(e) => set({ label: e.target.value })} className="h-9 w-28 rounded-lg border px-2 text-sm" maxLength={50} aria-label="برچسب" />
                <input value={v.value} onChange={(e) => set({ value: e.target.value, ...(v.type === "size" ? { label: e.target.value } : {}) })} className="h-9 w-28 rounded-lg border px-2 text-sm" maxLength={50} dir="ltr" aria-label="مقدار" />
                <button className="h-9 rounded-lg bg-(--color-brand) px-3 text-sm text-white">ذخیره</button>
              </div>
            )}
          </AdminForm>
          <ConfirmBtn label="حذف" onConfirm={() => deleteAttribute(id).then((r) => { if (r.ok) router.refresh(); return r; })} />
        </div>
      </td>
    </tr>
  );
}