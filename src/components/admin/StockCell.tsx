"use client";

import { adjustStock } from "@/server/admin-products";
import { toFa } from "@/lib/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function StockCell({ id, stock }: { id: string; stock: number }) {
  const router = useRouter();
  const [n, setN] = useState(stock);
  const [msg, setMsg] = useState<string | null>(null);
  const go = async (d: number) => {
    const r = await adjustStock(id, d);
    if (!r.ok) setMsg(r.error);
    else {
      setN(r.data);
      router.refresh();
    }
  };
  return (
    <span className="inline-flex items-center gap-1">
      <button onClick={() => go(-1)} className="rounded border px-2" type="button">−</button>
      <span className="min-w-8 text-center text-sm font-bold">{toFa(n)}</span>
      <button onClick={() => go(1)} className="rounded border px-2" type="button">+</button>
      {msg && <span className="text-[11px] text-(--color-wine)">{msg}</span>}
    </span>
  );
}
