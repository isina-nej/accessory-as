"use client";

import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/admin/Forms";
import { Field, inputCls } from "@/components/admin/ui";
import { SETTINGS_KEYS } from "@/lib/admin-labels";
import { saveSettings } from "@/server/admin-content";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const values: Record<string, string> = {};
  for (const k of SETTINGS_KEYS) values[k.key] = initial[k.key] ?? "";
  return (
    <AdminForm
      initial={values}
      onSave={async (v) => {
        const r = await saveSettings(v as Record<string, string>);
        if (r.ok) router.refresh();
        return r.ok ? { ok: true } : r;
      }}
      submitLabel="ذخیره تنظیمات"
    >
      {(v, set) => (
        <div className="grid gap-3 md:grid-cols-2">
          {SETTINGS_KEYS.map((k) => (
            <Field key={k.key} label={k.label}>
              {k.big ? (
                <textarea value={(v[k.key] as string) ?? ""} onChange={(e) => set({ [k.key]: e.target.value })} className="h-28 w-full rounded-lg border px-3 py-2 text-sm" maxLength={5000} />
              ) : (
                <input value={(v[k.key] as string) ?? ""} onChange={(e) => set({ [k.key]: e.target.value })} className={inputCls} maxLength={5000} />
              )}
            </Field>
          ))}
        </div>
      )}
    </AdminForm>
  );
}