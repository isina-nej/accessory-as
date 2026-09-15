"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setOrderStatus, setTracking } from "@/server/admin-orders";
import { ORDER_STATUS_FA } from "@/lib/order-status";

const ALL = ["pending", "paid", "preparing", "shipped", "delivered", "failed", "cancelled", "refunded"];

export function OrderOps({ id, status, tracking }: { id: string; status: string; tracking: string | null }) {
  const router = useRouter();
  const [t, setT] = useState(tracking ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {ALL.map((s) => (
          <button
            key={s}
            disabled={s === status}
            onClick={async () => {
              const r = await setOrderStatus(id, s);
              if (!r.ok) setMsg(r.error);
              else router.refresh();
            }}
            className={`rounded-full border px-3 py-1 text-xs ${s === status ? "bg-(--color-brand) text-white" : "disabled:opacity-40"}`}
          >
            {ORDER_STATUS_FA[s] ?? s}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const r = await setTracking(id, t);
          setMsg(r.ok ? "ثبت شد" : r.error);
          if (r.ok) router.refresh();
        }}
      >
        <input value={t} onChange={(e) => setT(e.target.value)} placeholder="کد رهگیری" className="h-10 flex-1 rounded-lg border px-3 text-sm" maxLength={100} dir="ltr" />
        <button className="h-10 rounded-lg bg-(--color-brand) px-4 text-sm text-white">ثبت</button>
      </form>
      {msg && <p className="text-xs text-(--color-muted-fg)">{msg}</p>}
    </div>
  );
}
