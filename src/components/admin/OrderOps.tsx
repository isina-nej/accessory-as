"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setOrderStatus, setTracking } from "@/server/admin-orders";
import { ORDER_STATUS_FA, ORDER_STATUS_TRANSITIONS } from "@/lib/order-status";
import { ORDER_STATUSES } from "@/lib/admin-labels";

export function OrderOps({ id, status, tracking }: { id: string; status: string; tracking: string | null }) {
  const router = useRouter();
  const [t, setT] = useState(tracking ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const next = ORDER_STATUS_TRANSITIONS[status] ?? [];
  const targets = ORDER_STATUSES.filter((s) => s !== status);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {targets.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busy || !next.includes(s)}
            title={next.includes(s) ? undefined : "این تغییر وضعیت مجاز نیست"}
            onClick={async () => {
              setBusy(true);
              setMsg(null);
              const r = await setOrderStatus(id, s);
              setBusy(false);
              if (!r.ok) setMsg(r.error);
              else router.refresh();
            }}
            className={`rounded-full border px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40 ${s === status ? "bg-(--color-brand) text-white" : ""}`}
          >
            {ORDER_STATUS_FA[s] ?? s}
          </button>
        ))}
      </div>
      {next.length === 0 && <p className="text-xs text-(--color-muted-fg)">این سفارش در وضعیت نهایی است و تغییر وضعیت ندارد.</p>}
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const r = await setTracking(id, t);
          setBusy(false);
          setMsg(r.ok ? "کد رهگیری ثبت شد." : r.error);
          if (r.ok) router.refresh();
        }}
      >
        <input value={t} onChange={(e) => setT(e.target.value)} placeholder="کد رهگیری" className="h-10 flex-1 rounded-lg border px-3 text-sm" maxLength={100} dir="ltr" aria-label="کد رهگیری" />
        <button disabled={busy} className="h-10 rounded-lg bg-(--color-brand) px-4 text-sm text-white disabled:opacity-50">ثبت</button>
      </form>
      {msg && <p className="text-xs text-(--color-wine)">{msg}</p>}
    </div>
  );
}