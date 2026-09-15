"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createDraftOrder } from "@/lib/order-actions";
import { startOrderPayment } from "@/lib/pay-actions";
import { formatToman } from "@/lib/fa";
import { useCart } from "@/stores/cart";

export function PayFlow({
  addressId,
  shippingSlug,
  coupon,
}: {
  addressId: string;
  shippingSlug: string;
  coupon?: string;
}) {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const [provider, setProvider] = useState<"zarinpal" | "zibal">("zarinpal");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const cartJson = useMemo(() => JSON.stringify(lines), [lines]);

  async function pay() {
    setPending(true);
    setErr(null);
    const parsed: { id: string; qty: number }[] = JSON.parse(cartJson);
    if (parsed.length === 0) {
      setPending(false);
      setErr("سبد خالی است");
      return;
    }
    const draft = await createDraftOrder({
      lines: parsed,
      addressId,
      couponCode: coupon,
      shippingSlug,
    });
    if (!draft.ok) {
      setPending(false);
      setErr(draft.error);
      return;
    }
    const started = await startOrderPayment(draft.data.orderId, provider);
    setPending(false);
    if (!started.ok) {
      setErr(started.error);
      return;
    }
    clear();
    router.push(started.data.url);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-4">
        <p className="font-bold">انتخاب درگاه پرداخت</p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {(
            [
              ["zarinpal", "زرین‌پال"],
              ["zibal", "زیبال"],
            ] as const
          ).map(([v, label]) => (
            <label
              key={v}
              className={`cursor-pointer rounded-xl border p-3 text-sm ${provider === v ? "border-(--color-brand)" : ""}`}
            >
              <span className="flex items-center gap-2">
                <input type="radio" name="pay" checked={provider === v} onChange={() => setProvider(v)} />
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-4 text-sm">
        <p>
          مبلغ قابل پرداخت پس از ثبت سفارش محاسبه می‌شود. واحد پرداخت ریال است (
          {formatToman(10)} = {formatToman(1)} × ۱۰).
        </p>
        {err && <p className="mt-2 text-(--color-wine)">{err}</p>}
        <button
          onClick={pay}
          disabled={pending || lines.length === 0}
          className="mt-3 h-11 w-full rounded-lg bg-(--color-brand) font-bold text-white disabled:opacity-50"
        >
          {pending ? "در حال اتصال به درگاه…" : "پرداخت"}
        </button>
      </div>
    </div>
  );
}
