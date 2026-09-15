"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type ShopQuery } from "@/lib/products";
import { withQuery } from "@/lib/shop-query";

export function SearchBox({ q, base = "/shop" }: { q: ShopQuery; base?: string }) {
  const router = useRouter();
  const [v, setV] = useState(q.q);
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(withQuery(base, q, { q: v.trim(), page: 1 }));
      }}
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="جستجو: انگشتر…"
        className="h-10 flex-1 rounded-lg border bg-white px-3 text-sm"
      />
      <button className="h-10 rounded-lg bg-(--color-brand) px-4 text-sm text-white">جستجو</button>
    </form>
  );
}
