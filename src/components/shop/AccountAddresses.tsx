"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
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
    <div className="w-full space-y-6">
      <div className="rounded-[10px] border border-[#D6DBDE] bg-white p-6 space-y-6 text-right">
        {/* سربرگ آدرس‌ها */}
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-extrabold text-[#161B22]">آدرس ها</h1>
        </div>

        {/* دکمه افزودن آدرس جدید خط‌چین مطابق فیگما */}
        <button
          type="button"
          onClick={() => { setAdding(true); setEditing(null); }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#4B5563] bg-white text-sm font-bold text-[#4B5563] transition hover:bg-[#F8FAF9]"
        >
          <Icon name="icons-other--plus-2" className="h-4 w-4" alt="" />
          <span>افـزودن آدرس جدیـد</span>
        </button>

        {/* بخش عنوان آدرس‌های من */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#D6DBDE] pb-2">
            <h2 className="text-base font-bold text-[#4B5563]">آدرس های من</h2>
          </div>

          {/* لیست کارت‌های آدرس */}
          <div className="flex flex-col gap-3">
            {list.map((a) => (
              <div
                key={a.id}
                className={`relative flex flex-col justify-between rounded-[10px] border p-4 text-right transition ${
                  a.isDefault ? "border-[#0A5A55] shadow-xs" : "border-[#D6DBDE] bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => { setEditing(a); setAdding(false); }}
                      className="text-xs font-bold text-[#1889F2] hover:underline"
                    >
                      ویرایش
                    </button>
                    {!a.isDefault && (
                      <button
                        type="button"
                        onClick={async () => {
                          const r = await setDefaultAddress(a.id);
                          if (r.ok) router.refresh();
                        }}
                        className="text-xs font-bold text-[#0A5A55] hover:underline"
                      >
                        انتخاب به عنوان پیش‌فرض
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm("آیا این آدرس حذف شود؟")) return;
                        const r = await deleteAddress(a.id);
                        if (r.ok) router.refresh();
                      }}
                      className="text-xs font-bold text-[#9F1239] hover:underline"
                    >
                      حذف
                    </button>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#161B22]">
                      {a.detail} — {a.city}، {a.province}
                    </p>
                    <p className="text-xs font-medium text-[#8A9398]">
                      گیرنده: {a.recipient ?? "—"} / تلفن: {toFa(a.phone)} / کد پستی: {a.postal ? toFa(a.postal) : "—"}
                    </p>
                  </div>
                </div>

                {a.isDefault && (
                  <div className="mt-2 flex items-center justify-end">
                    <span className="rounded bg-[#0A5A55] px-2 py-0.5 text-[11px] font-bold text-white">
                      آدرس پیش‌فرض
                    </span>
                  </div>
                )}
              </div>
            ))}

            {list.length === 0 && !adding && (
              <p className="py-12 text-center text-sm font-medium text-[#8A9398]">
                هنوز آدرسی ثبت نشده است.
              </p>
            )}
          </div>
        </div>

        {/* فرم ثبت یا ویرایش آدرس */}
        {adding && (
          <div className="rounded-[10px] border border-[#D6DBDE] bg-[#F8FAF9] p-4">
            <AddressForm
              onDone={() => {
                setAdding(false);
                router.refresh();
              }}
            />
          </div>
        )}

        {editing && (
          <div className="rounded-[10px] border border-[#D6DBDE] bg-[#F8FAF9] p-4">
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
          </div>
        )}

        {msg && <p className="text-xs text-[#9F1239]">{msg}</p>}
      </div>
    </div>
  );
}
