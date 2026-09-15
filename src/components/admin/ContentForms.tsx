"use client";

import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/admin/Forms";
import { Field, TextInput } from "@/components/admin/ui";
import { ConfirmBtn } from "@/components/admin/Forms";
import { deleteBanner, saveBanner } from "@/server/admin-content";
import { deleteFaq, saveFaq, savePage } from "@/server/admin-content";

type Banner = {
  id: string; slot: string; title: string; subtitle: string | null;
  ctaLabel: string | null; ctaHref: string | null; imageUrl: string | null;
  sort: number; active: boolean;
};

export function BannerForm({ initial, id }: { initial: Omit<Banner, "id">; id: string | null }) {
  const router = useRouter();
  return (
    <AdminForm initial={initial} onSave={async (v) => {
      const r = await saveBanner(id, { ...v, slot: v.slot as Banner["slot"] as "hero" });
      if (r.ok) router.refresh();
      return r.ok ? { ok: true } : r;
    }} submitLabel={id ? "ذخیره" : "ساخت بنر"}>
      {(v, set) => (
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="اسلات">
            <select value={v.slot} onChange={(e) => set({ slot: e.target.value })} className="h-10 w-full rounded-lg border px-2 text-sm">
              {["hero", "offer-side", "mid-a", "mid-b", "shine"].map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </Field>
          <Field label="تیتر"><TextInput value={v.title} onChange={(x) => set({ title: x })} maxLength={200} /></Field>
          <Field label="زیرتیتر"><TextInput value={v.subtitle ?? ""} onChange={(x) => set({ subtitle: x || null })} maxLength={1000} /></Field>
          <Field label="متن دکمه"><TextInput value={v.ctaLabel ?? ""} onChange={(x) => set({ ctaLabel: x || null })} maxLength={100} /></Field>
          <Field label="لینک دکمه"><TextInput value={v.ctaHref ?? ""} onChange={(x) => set({ ctaHref: x || null })} maxLength={300} dir="ltr" /></Field>
          <Field label="عکس"><TextInput value={v.imageUrl ?? ""} onChange={(x) => set({ imageUrl: x || null })} maxLength={500} dir="ltr" /></Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.active} onChange={(e) => set({ active: e.target.checked })} /> فعال
          </label>
        </div>
      )}
    </AdminForm>
  );
}

export function BannerDel({ id }: { id: string }) {
  const router = useRouter();
  return <ConfirmBtn label="حذف" onConfirm={() => deleteBanner(id).then((r) => { if (r.ok) router.refresh(); return r; })} />;
}

type Page = { slug: string; title: string; body: string; seoTitle: string | null; seoDesc: string | null };

export function PageForm({ page }: { page: Page }) {
  const router = useRouter();
  return (
    <AdminForm initial={{ title: page.title, body: page.body, seoTitle: page.seoTitle ?? "", seoDesc: page.seoDesc ?? "" }} onSave={async (v) => {
      const r = await savePage(page.slug, { title: v.title, body: v.body, seoTitle: v.seoTitle || null, seoDesc: v.seoDesc || null });
      if (r.ok) router.refresh();
      return r;
    }} submitLabel="ذخیره صفحه">
      {(v, set) => (
        <div className="space-y-2">
          <Field label="تیتر"><TextInput value={v.title} onChange={(x) => set({ title: x })} maxLength={200} /></Field>
          <Field label="متن">
            <textarea value={v.body} onChange={(e) => set({ body: e.target.value })} className="h-32 w-full rounded-lg border px-3 py-2 text-sm" maxLength={20000} />
          </Field>
          <div className="grid gap-2 md:grid-cols-2">
            <Field label="SEO title"><TextInput value={v.seoTitle} onChange={(x) => set({ seoTitle: x })} maxLength={200} /></Field>
            <Field label="SEO desc"><TextInput value={v.seoDesc} onChange={(x) => set({ seoDesc: x })} maxLength={300} /></Field>
          </div>
        </div>
      )}
    </AdminForm>
  );
}

type Faq = { id: string; q: string; a: string; sort: number; active: boolean };

export function FaqForm({ initial, id }: { initial: { q: string; a: string; sort: number; active: boolean }; id: string | null }) {
  const router = useRouter();
  return (
    <AdminForm initial={initial} onSave={async (v) => {
      const r = await saveFaq(id, v);
      if (r.ok) router.refresh();
      return r.ok ? { ok: true } : r;
    }} submitLabel={id ? "ذخیره" : "ساخت سؤال"}>
      {(v, set) => (
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="سؤال"><TextInput value={v.q} onChange={(x) => set({ q: x })} maxLength={300} /></Field>
          <Field label="ترتیب">
            <input type="number" value={v.sort} onChange={(e) => set({ sort: Number(e.target.value) })} className="h-10 w-full rounded-lg border px-2 text-sm" />
          </Field>
          <div className="md:col-span-2">
            <Field label="جواب">
              <textarea value={v.a} onChange={(e) => set({ a: e.target.value })} className="h-24 w-full rounded-lg border px-3 py-2 text-sm" maxLength={5000} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.active} onChange={(e) => set({ active: e.target.checked })} /> فعال
          </label>
        </div>
      )}
    </AdminForm>
  );
}

export function FaqDel({ id }: { id: string }) {
  const router = useRouter();
  return <ConfirmBtn label="حذف" onConfirm={() => deleteFaq(id).then((r) => { if (r.ok) router.refresh(); return r; })} />;
}
