"use client";

import { useRouter } from "next/navigation";
import { AdminForm, ConfirmBtn } from "@/components/admin/Forms";
import { Field, TextInput } from "@/components/admin/ui";
import { deleteCoupon, saveCampaign, saveCoupon, saveShipping } from "@/server/admin-content";
import { inputCls } from "@/components/admin/ui";

export function CouponForm({ initial, id }: { initial: { code: string; pct: number; maxToman: number | null; minToman: number | null; active: boolean }; id: string | null }) {
  const router = useRouter();
  return (
    <AdminForm initial={initial} onSave={async (v) => {
      const r = await saveCoupon(id, v);
      if (r.ok) router.refresh();
      return r.ok ? { ok: true } : r;
    }} submitLabel={id ? "ذخیره" : "ساخت کوپن"}>
      {(v, set) => (
        <div className="grid gap-2 md:grid-cols-3">
          <Field label="کد"><TextInput value={v.code} onChange={(x) => set({ code: x })} maxLength={50} dir="ltr" /></Field>
          <Field label="درصد">
            <input type="number" min={1} max={90} value={v.pct} onChange={(e) => set({ pct: Number(e.target.value) })} className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.active} onChange={(e) => set({ active: e.target.checked })} /> فعال
          </label>
          <Field label="سقف تومان">
            <input type="number" min={0} value={v.maxToman ?? ""} onChange={(e) => set({ maxToman: e.target.value === "" ? null : Number(e.target.value) })} className={inputCls} />
          </Field>
          <Field label="کف تومان">
            <input type="number" min={0} value={v.minToman ?? ""} onChange={(e) => set({ minToman: e.target.value === "" ? null : Number(e.target.value) })} className={inputCls} />
          </Field>
        </div>
      )}
    </AdminForm>
  );
}

export function CouponDel({ id }: { id: string }) {
  const router = useRouter();
  return <ConfirmBtn label="حذف" onConfirm={() => deleteCoupon(id).then((r) => { if (r.ok) router.refresh(); return r; })} />;
}

export function ShipForm({ initial, id }: { initial: { slug: string; title: string; feeToman: number; freeOverToman: number | null }; id: string | null }) {
  const router = useRouter();
  return (
    <AdminForm initial={initial} onSave={async (v) => {
      const { saveShipping } = await import("@/server/admin-content");
      const r = await saveShipping(id, v);
      if (r.ok) router.refresh();
      return r.ok ? { ok: true } : r;
    }} submitLabel={id ? "ذخیره" : "ساخت روش"}>
      {(v, set) => (
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="نام"><TextInput value={v.title} onChange={(x) => set({ title: x })} maxLength={100} /></Field>
          <Field label="اسلاگ"><TextInput value={v.slug} onChange={(x) => set({ slug: x })} maxLength={50} dir="ltr" /></Field>
          <Field label="هزینه تومان">
            <input type="number" min={0} value={v.feeToman} onChange={(e) => set({ feeToman: Number(e.target.value) })} className={inputCls} />
          </Field>
          <Field label="رایگان بالای">
            <input type="number" min={0} value={v.freeOverToman ?? ""} onChange={(e) => set({ freeOverToman: e.target.value === "" ? null : Number(e.target.value) })} className={inputCls} />
          </Field>
        </div>
      )}
    </AdminForm>
  );
}

export function CampaignForm({ initial }: { initial: { title: string; active: boolean; endsAt: string } }) {
  const router = useRouter();
  return (
    <AdminForm initial={initial} onSave={async (v) => {
      const r = await saveCampaign({ title: v.title, active: v.active, endsAt: v.endsAt || null });
      if (r.ok) router.refresh();
      return r;
    }} submitLabel="ذخیره کمپین">
      {(v, set) => (
        <div className="grid gap-2 md:grid-cols-3">
          <Field label="تیتر"><TextInput value={v.title} onChange={(x) => set({ title: x })} maxLength={200} /></Field>
          <Field label="پایان (میلادی)">
            <TextInput value={v.endsAt} onChange={(x) => set({ endsAt: x })} maxLength={30} dir="ltr" placeholder="2026-12-31T23:59" />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.active} onChange={(e) => set({ active: e.target.checked })} /> فعال
          </label>
        </div>
      )}
    </AdminForm>
  );
}
