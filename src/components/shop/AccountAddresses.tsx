"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddressForm } from "@/components/shop/AddressForm";
import { deleteAddress, setDefaultAddress } from "@/lib/address-actions";
import { toFa } from "@/lib/fa";

export type AddrRow = {
  id: string;
  recipient: string | null;
  province: string;
  city: string;
  detail: string;
  postal: string | null;
  phone: string;
  isDefault: boolean;
};

export function AccountAddresses({ list }: { list: AddrRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AddrRow | null>(null);
  const [adding, setAdding] = useState(list.length === 0);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-extrabold">آدرس‌های من</h2>
        <button onClick={() => { setAdding(true); setEditing(null); }} className="rounded-lg border px-3 py-1.5 text-sm">
          افزودن آدرس جدید
        </button>
      </div>
      {list.map((a) => (
        <div key={a.id} className="rounded-2xl border bg-white p-4 text-sm leading-7">
          <p>{a.detail} — {a.city}، {a.province}</p>
          <p className="text-xs text-(--color-muted-fg)">
            گیرنده: {a.recipient ?? "—"} / کد پستی: {a.postal ? toFa(a.postal) : "—"}
            {a.isDefault ? " / پیش‌فرض" : ""}
          </p>
          <div className="mt-2 flex gap-3 text-xs">
            <button className="text-(--color-brand)" onClick={() => { setEditing(a); setAdding(false); }}>ویرایش</button>
            <button
              className="text-(--color-brand)"
              onClick={async () => {
                const r = await setDefaultAddress(a.id);
                setMsg(r.ok ? "پیش‌فرض شد" : r.error);
                if (r.ok) router.refresh();
              }}
            >
              پیش‌فرض
            </button>
            <button
              className="text-(--color-wine)"
              onClick={async () => {
                if (!confirm("حذف شود؟")) return;
                const r = await deleteAddress(a.id);
                setMsg(r.ok ? "حذف شد" : r.error);
                if (r.ok) router.refresh();
              }}
            >
              حذف
            </button>
          </div>
        </div>
      ))}
      {list.length === 0 && !adding && (
        <p className="rounded-2xl border bg-white p-6 text-center text-sm text-(--color-muted-fg)">آدرسی ثبت نشده.</p>
      )}
      {msg && <p className="text-xs text-(--color-muted-fg)">{msg}</p>}
      {adding && (
        <AddressForm
          onDone={() => {
            setAdding(false);
            router.refresh();
          }}
        />
      )}
      {editing && (
        <AddressForm
          editId={editing.id}
          initial={{
            recipient: editing.recipient ?? "",
            phone: editing.phone,
            province: editing.province,
            city: editing.city,
            detail: editing.detail,
            postal: editing.postal ?? "",
            isDefault: editing.isDefault,
          }}
          onDone={() => {
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
