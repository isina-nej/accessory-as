"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adjustStock } from "@/server/admin-products";
import { toFa } from "@/lib/fa";

export function StockCell({ id, stock }: { id: string; stock: number }) {
  const router = useRouter();
  const [n, setN] = useState(stock);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const go = async (d: number) => {
    setBusy(true);
    const r = await adjustStock(id, d);
    setBusy(false);
    if (!r.ok) setMsg(r.error);
    else {
      setMsg(null);
      setN(r.data);
      router.refresh();
    }
  };
  return (
    <span className="inline-flex items-center gap-1">
      <button onClick={() => go(-1)} disabled={busy || n === 0} className="rounded border px-2 disabled:opacity-40" type="button" aria-label="کاهش موجودی">−</button>
      <span className="min-w-8 text-center text-sm font-bold">{toFa(n)}</span>
      <button onClick={() => go(1)} disabled={busy} className="rounded border px-2 disabled:opacity-40" type="button" aria-label="افزایش موجودی">+</button>
      {msg && <span className="text-[11px] text-(--color-wine)">{msg}</span>}
    </span>
  );
}