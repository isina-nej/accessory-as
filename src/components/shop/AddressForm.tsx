"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAddress, updateAddress, type AddressInput } from "@/lib/address-actions";

const PROVINCES = ["تهران", "اصفهان", "فارس", "خراسان رضوی", "آذربایجان شرقی", "خوزستان"];

export function AddressForm({
  initial,
  editId,
  onDone,
}: {
  initial?: Partial<AddressInput>;
  editId?: string;
  onDone?: (id: string) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState<AddressInput>({
    recipient: initial?.recipient ?? "",
    phone: initial?.phone ?? "",
    province: initial?.province ?? "تهران",
    city: initial?.city ?? "",
    detail: initial?.detail ?? "",
    postal: initial?.postal ?? "",
    isDefault: initial?.isDefault ?? false,
  });
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const set = (k: keyof AddressInput, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr(null);
    const r = editId ? await updateAddress(editId, form) : await createAddress(form);
    setPending(false);
    if (r.ok) {
      if (onDone) onDone(editId ?? (r.data as string));
      else router.refresh();
    } else setErr(r.error);
  }

  const input = "h-10 w-full rounded-lg border bg-white px-3 text-sm";

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-white p-4">
      <p className="font-bold">{editId ? "ویرایش آدرس" : "آدرس جدید"}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <input className={input} placeholder="نام گیرنده" value={form.recipient} onChange={(e) => set("recipient", e.target.value)} maxLength={100} />
        <input className={input} placeholder="موبایل ۰۹…" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} maxLength={11} />
        <select className={input} value={form.province} onChange={(e) => set("province", e.target.value)}>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input className={input} placeholder="شهر" value={form.city} onChange={(e) => set("city", e.target.value)} maxLength={50} />
      </div>
      <textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm" rows={3} placeholder="متن آدرس" value={form.detail} onChange={(e) => set("detail", e.target.value)} maxLength={500} />
      <input className={input} placeholder="کد پستی ۱۰ رقمی (اختیاری)" inputMode="numeric" value={form.postal} onChange={(e) => set("postal", e.target.value)} maxLength={10} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isDefault} onChange={(e) => set("isDefault", e.target.checked)} />
        پیش‌فرض شود
      </label>
      {err && <p className="text-sm text-(--color-wine)">{err}</p>}
      <button disabled={pending} className="h-10 w-full rounded-lg bg-(--color-brand) text-sm font-bold text-white disabled:opacity-50">
        {pending ? "در حال ثبت…" : "تایید و ادامه"}
      </button>
    </form>
  );
}
