"use client";

import { useRouter } from "next/navigation";
import { AdminForm, ConfirmBtn } from "@/components/admin/Forms";
import { Field, TextInput, inputCls } from "@/components/admin/ui";
import { BANNER_SLOTS, BANNER_SLOT_FA, bannerSlotLabel, faDate } from "@/lib/admin-labels";
import type { BannerSlot } from "@/lib/admin-labels";
import { deleteBanner, deleteFaq, saveBanner, saveFaq, savePage } from "@/server/admin-content";

type Banner = {
  slot: BannerSlot; title: string; subtitle: string | null;
  ctaLabel: string | null; ctaHref: string | null; imageUrl: string | null;
  sort: number; active: boolean; startsAt: Date | null; endsAt: Date | null;
};

const toLocalInput = (v: Date | null) => (v ? new Date(v).toISOString().slice(0, 16) : "");

export function BannerForm({ initial, id }: { initial: Omit<Banner, "startsAt" | "endsAt"> & { startsAt: string; endsAt: string }; id: string | null }) {
  const router = useRouter();
  return (
    <AdminForm
      initial={initial}
      onSave={async (v) => {
        const r = await saveBanner(id, v);
        if (r.ok) router.refresh();
        return r.ok ? { ok: true } : r;
      }}
      submitLabel={id ? "ذخیره" : "ساخت بنر"}
    >
      {(v, set) => (
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="محل نمایش">
            <select value={v.slot} onChange={(e) => set({ slot: e.target.value as BannerSlot })} className={inputCls} aria-label="محل نمایش بنر">
              {BANNER_SLOTS.map((s) => (<option key={s} value={s}>{BANNER_SLOT_FA[s]}</option>))}
            </select>
          </Field>
          <Field label="تیتر"><TextInput value={v.title} onChange={(x) => set({ title: x })} maxLength={200} /></Field>
          <Field label="زیرتیتر"><TextInput value={v.subtitle ?? ""} onChange={(x) => set({ subtitle: x || null })} maxLength={1000} /></Field>
          <Field label="متن دکمه"><TextInput value={v.ctaLabel ?? ""} onChange={(x) => set({ ctaLabel: x || null })} maxLength={100} /></Field>
          <Field label="لینک دکمه"><TextInput value={v.ctaHref ?? ""} onChange={(x) => set({ ctaHref: x || null })} maxLength={300} dir="ltr" /></Field>
          <Field label="لینک عکس"><TextInput value={v.imageUrl ?? ""} onChange={(x) => set({ imageUrl: x || null })} maxLength={500} dir="ltr" /></Field>
          <Field label="ترتیب">
            <input type="number" min={0} max={999} value={v.sort} onChange={(e) => set({ sort: Number(e.target.value) })} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="نمایش از">
              <input type="datetime-local" value={v.startsAt} onChange={(e) => set({ startsAt: e.target.value })} className={inputCls} />
            </Field>
            <Field label="نمایش تا">
              <input type="datetime-local" value={v.endsAt} onChange={(e) => set({ endsAt: e.target.value })} className={inputCls} />
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

export function BannerDel({ id }: { id: string }) {
  const router = useRouter();
  return <ConfirmBtn label="حذف" onConfirm={() => deleteBanner(id).then((r) => { if (r.ok) router.refresh(); return r; })} />;
}

export function BannerListRow({ banner }: { banner: Omit<Banner, "slot"> & { id: string; slot: string } }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-bold">{bannerSlotLabel(banner.slot)} — {banner.title}</span>
        <span className="flex items-center gap-2">
          {!banner.active && <span className="text-[11px] text-(--color-wine)">غیرفعال</span>}
          {(banner.startsAt || banner.endsAt) ? <span className="text-[11px] text-(--color-muted-fg)">{banner.startsAt ? `از ${faDate(banner.startsAt)}` : ""} {banner.endsAt ? `تا ${faDate(banner.endsAt)}` : ""}</span> : null}
          <BannerDel id={banner.id} />
        </span>
      </div>
      <BannerForm
        id={banner.id}
        initial={{ slot: (BANNER_SLOTS as readonly string[]).includes(banner.slot) ? (banner.slot as BannerSlot) : "hero", title: banner.title, subtitle: banner.subtitle, ctaLabel: banner.ctaLabel, ctaHref: banner.ctaHref, imageUrl: banner.imageUrl, sort: banner.sort, active: banner.active, startsAt: toLocalInput(banner.startsAt), endsAt: toLocalInput(banner.endsAt) }}
      />
    </div>
  );
}

type Page = { slug: string; title: string; body: string; seoTitle: string | null; seoDesc: string | null };

export function PageForm({ page }: { page: Page }) {
  const router = useRouter();
  return (
    <AdminForm
      initial={{ title: page.title, body: page.body, seoTitle: page.seoTitle ?? "", seoDesc: page.seoDesc ?? "" }}
      onSave={async (v) => {
        const r = await savePage(page.slug, { title: v.title, body: v.body, seoTitle: v.seoTitle || null, seoDesc: v.seoDesc || null });
        if (r.ok) router.refresh();
        return r.ok ? { ok: true } : r;
      }}
      submitLabel="ذخیره صفحه"
    >
      {(v, set) => (
        <div className="space-y-2">
          <Field label="تیتر"><TextInput value={v.title} onChange={(x) => set({ title: x })} maxLength={200} /></Field>
          <Field label="متن">
            <textarea value={v.body} onChange={(e) => set({ body: e.target.value })} className="h-32 w-full rounded-lg border px-3 py-2 text-sm" maxLength={20000} />
          </Field>
          <div className="grid gap-2 md:grid-cols-2">
            <Field label="عنوان سئو"><TextInput value={v.seoTitle} onChange={(x) => set({ seoTitle: x })} maxLength={200} /></Field>
            <Field label="توضیح سئو"><TextInput value={v.seoDesc} onChange={(x) => set({ seoDesc: x })} maxLength={300} /></Field>
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
    <AdminForm
      initial={initial}
      onSave={async (v) => {
        const r = await saveFaq(id, v);
        if (r.ok) router.refresh();
        return r.ok ? { ok: true } : r;
      }}
      submitLabel={id ? "ذخیره" : "ساخت سؤال"}
    >
      {(v, set) => (
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="سؤال"><TextInput value={v.q} onChange={(x) => set({ q: x })} maxLength={300} /></Field>
          <Field label="ترتیب">
            <input type="number" min={0} max={999} value={v.sort} onChange={(e) => set({ sort: Number(e.target.value) })} className={inputCls} />
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

export function FaqListRow({ faq }: { faq: Faq }) {
  const router = useRouter();
  return (
    <div className="rounded-xl border p-3">
      <div className="mb-2 flex justify-end">
        <ConfirmBtn label="حذف" onConfirm={() => deleteFaq(faq.id).then((r) => { if (r.ok) router.refresh(); return r; })} />
      </div>
      <FaqForm id={faq.id} initial={{ q: faq.q, a: faq.a, sort: faq.sort, active: faq.active }} />
    </div>
  );
}