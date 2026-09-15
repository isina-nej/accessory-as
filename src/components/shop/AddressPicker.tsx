"use client";

import { useState } from "react";
import { deleteAddress, setDefaultAddress } from "@/lib/address-actions";
import { toFa } from "@/lib/fa";
import { cn } from "@/lib/cn";

export type Addr = {
  id: string;
  recipient: string | null;
  province: string;
  city: string;
  detail: string;
  postal: string | null;
  phone: string;
  isDefault: boolean;
};

export function AddressPicker({
  list,
  selected,
  onSelect,
}: {
  list: Addr[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <p className="font-bold">انتخاب آدرس ارسال</p>
      {list.map((a) => (
        <label
          key={a.id}
          className={cn(
            "block cursor-pointer rounded-2xl border bg-white p-4",
            selected === a.id && "border-(--color-brand)",
          )}
        >
          <span className="flex items-start gap-2">
            <input
              type="radio"
              name="addr"
              checked={selected === a.id}
              onChange={() => onSelect(a.id)}
              className="mt-1"
            />
            <span className="flex-1 text-sm leading-7">
              {a.detail} — {a.city}، {a.province}
              <span className="block text-xs text-(--color-muted-fg)">
                گیرنده: {a.recipient ?? "—"} / کد پستی: {a.postal ? toFa(a.postal) : "—"}
              </span>
            </span>
          </span>
          <span className="mt-2 flex gap-3 text-xs">
            <button
              type="button"
              className="text-(--color-brand)"
              onClick={async () => {
                const r = await setDefaultAddress(a.id);
                setMsg(r.ok ? "پیش‌فرض شد" : r.error);
              }}
            >
              پیش‌فرض
            </button>
            <button
              type="button"
              className="text-(--color-wine)"
              onClick={async () => {
                if (!confirm("حذف شود؟")) return;
                const r = await deleteAddress(a.id);
                setMsg(r.ok ? "حذف شد" : r.error);
                if (r.ok && selected === a.id) onSelect("");
              }}
            >
              حذف
            </button>
          </span>
        </label>
      ))}
      {msg && <p className="text-xs text-(--color-muted-fg)">{msg}</p>}
    </div>
  );
}
