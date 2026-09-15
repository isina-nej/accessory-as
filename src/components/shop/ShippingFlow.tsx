"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { validateCoupon } from "@/lib/order-actions";
import { formatToman, toFa } from "@/lib/fa";
import { cn } from "@/lib/cn";

export type ShipM = { slug: string; title: string; feeToman: number; freeOverToman: number | null };

export function ShippingFlow({
  addressId,
  methods,
  subtotal,
}: {
  addressId: string;
  methods: ShipM[];
  subtotal: number | null;
}) {
  const router = useRouter();
  const [ship, setShip] = useState<string>(methods[0]?.slug ?? "");
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const m = methods.find((x) => x.slug === ship);
  const shipping = useMemo(() => {
    if (!m || subtotal == null) return 0;
    const after = subtotal - discount;
    if (m.freeOverToman != null && after >= m.freeOverToman) return 0;
    return m.feeToman;
  }, [m, subtotal, discount]);

  const total = subtotal == null ? null : subtotal - discount + shipping;

  async function applyCoupon() {
    if (subtotal == null) return;
    setPending(true);
    setMsg(null);
    const r = await validateCoupon(code, subtotal);
    setPending(false);
    if (r.ok) {
      setDiscount(r.data);
      setMsg("کد تخفیف با موفقیت اعمال شد!");
    } else {
      setDiscount(0);
      setMsg(r.error);
    }
  }

  function goNext() {
    const p = new URLSearchParams({ addressId, shippingSlug: ship });
    if (code.trim()) p.set("coupon", code.trim().toUpperCase());
    router.push(`/checkout/pay?${p.toString()}`);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="space-y-2 rounded-2xl border bg-white p-4">
          <p className="font-bold">انتخاب روش ارسال</p>
          {methods.map((x) => (
            <label
              key={x.slug}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm",
                ship === x.slug && "border-(--color-brand)",
              )}
            >
              <span className="flex items-center gap-2">
                <input type="radio" name="ship" checked={ship === x.slug} onChange={() => setShip(x.slug)} />
                {x.title}
              </span>
              <span className="text-(--color-muted-fg)">
                {x.feeToman === 0 ? "رایگان" : formatToman(x.feeToman)}
                {x.freeOverToman ? ` (رایگان بالای ${formatToman(x.freeOverToman)})` : ""}
              </span>
            </label>
          ))}
        </div>
        <div className="rounded-2xl border bg-white p-4">
          <p className="font-bold">کد تخفیف</p>
          <div className="mt-2 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="GH632LO"
              dir="ltr"
              className="h-10 flex-1 rounded-lg border bg-white px-3 text-sm"
              maxLength={50}
            />
            <button
              onClick={applyCoupon}
              disabled={pending || !code.trim()}
              className="h-10 rounded-lg border px-4 text-sm disabled:opacity-50"
            >
              ثبت
            </button>
          </div>
          {msg && <p className={cn("mt-2 text-sm", discount > 0 ? "text-(--color-brand)" : "text-(--color-wine)")}>{msg}</p>}
          {discount > 0 && <p className="mt-1 text-sm">تخفیف: {formatToman(discount)}</p>}
        </div>
      </div>
      <aside className="h-fit space-y-3 rounded-2xl border bg-white p-4">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>جمع کالاها</span>
            <span>{subtotal == null ? "—" : formatToman(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>ارسال</span>
            <span>{subtotal == null ? "—" : shipping === 0 ? "رایگان" : formatToman(shipping)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>قابل پرداخت ({toFa(1)} مرحله بعد)</span>
            <span>{total == null ? "—" : formatToman(total)}</span>
          </div>
        </div>
        <button
          onClick={goNext}
          disabled={!ship}
          className="w-full rounded-lg bg-(--color-brand) py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          تایید و ادامه
        </button>
      </aside>
    </div>
  );
}
