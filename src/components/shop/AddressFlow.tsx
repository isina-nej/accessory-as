"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AddressForm } from "./AddressForm";
import { AddressPicker, type Addr } from "./AddressPicker";

export function AddressFlow({ list }: { list: Addr[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(
    list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null,
  );
  const [showNew, setShowNew] = useState(list.length === 0);

  function goNext() {
    if (!selected) return;
    const url = `/checkout/shipping?addressId=${selected}`;
    router.push(url);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="rounded-2xl border bg-white p-4">
          <p className="font-bold">جزئیات مرسوله</p>
          <p className="mt-1 text-sm text-(--color-muted-fg)">سفارش‌ها به آدرسی که انتخاب می‌کنی ارسال می‌شود.</p>
        </div>
        {list.length > 0 && !showNew && (
          <div className="rounded-2xl border bg-white p-4">
            <AddressPicker list={list} selected={selected} onSelect={setSelected} />
            <button
              onClick={() => setShowNew(true)}
              className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
            >
              افزودن آدرس جدید
            </button>
          </div>
        )}
        {(showNew || list.length === 0) && (
          <AddressForm
            onDone={(id) => {
              setSelected(id);
              setShowNew(false);
              router.refresh();
            }}
          />
        )}
        {list.length > 0 && showNew && (
          <button onClick={() => setShowNew(false)} className="text-sm text-(--color-muted-fg)">
            برگشت به آدرس‌های ذخیره‌شده
          </button>
        )}
      </div>
      <aside className="h-fit space-y-3 rounded-2xl border bg-white p-4">
        <button
          disabled={!selected}
          onClick={goNext}
          className="w-full rounded-lg bg-(--color-brand) py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          تایید و ادامه
        </button>
        <Link href="/cart" className="block text-center text-sm text-(--color-muted-fg)">
          برگشت به مرحله قبلی
        </Link>
      </aside>
    </div>
  );
}
