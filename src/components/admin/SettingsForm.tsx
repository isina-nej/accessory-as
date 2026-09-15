"use client";

import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/admin/Forms";
import { Field, TextInput } from "@/components/admin/ui";
import { saveSettings } from "@/server/admin-content";

const KEYS: { key: string; label: string; big?: boolean }[] = [
  { key: "site_title", label: "تیتر سایت" },
  { key: "site_desc", label: "توضیح سئو" },
  { key: "hero_title", label: "تیتر هیرو" },
  { key: "hero_sub", label: "زیرتیتر هیرو" },
  { key: "cat_title", label: "تیتر دسته‌ها" },
  { key: "cat_sub", label: "زیرتیتر دسته‌ها" },
  { key: "offer_title", label: "تیتر پیشنهاد" },
  { key: "new_title", label: "تیتر محصولات جدید" },
  { key: "shine_title", label: "تیتر بنر درخشش" },
  { key: "shine_sub", label: "زیرتیتر درخشش" },
  { key: "footer_seo_title", label: "تیتر سئو فوتر" },
  { key: "footer_address", label: "آدرس فوتر" },
  { key: "footer_phones", label: "تلفن‌های فوتر" },
  { key: "footer_seo_body", label: "متن سئو فوتر", big: true },
];

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  return (
    <AdminForm initial={initial} onSave={async (v) => {
      const r = await saveSettings(v as Record<string, string>);
      if (r.ok) router.refresh();
      return r;
    }} submitLabel="ذخیره تنظیمات">
      {(v, set) => (
        <div className="grid gap-3 md:grid-cols-2">
          {KEYS.map((k) => (
            <Field key={k.key} label={k.label}>
              {k.big ? (
                <textarea value={(v[k.key] as string) ?? ""} onChange={(e) => set({ [k.key]: e.target.value })} className="h-28 w-full rounded-lg border px-3 py-2 text-sm" maxLength={5000} />
              ) : (
                <input value={(v[k.key] as string) ?? ""} onChange={(e) => set({ [k.key]: e.target.value })} className="h-10 w-full rounded-lg border px-3 text-sm" maxLength={5000} />
              )}
            </Field>
          ))}
        </div>
      )}
    </AdminForm>
  );
}
