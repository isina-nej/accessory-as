"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ShopProduct } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function OffersCarousel({ items }: { items: ShopProduct[] }) {
  const [i, setI] = useState(0);
  if (items.length === 0) return null;
  const perView = 4;
  const max = Math.max(0, items.length - perView);
  const shown = items.slice(i, i + perView);
  return (
    <section className="overflow-hidden rounded-2xl bg-(--color-brand-deep) p-4 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">پیشنهادها</h2>
        <div className="flex gap-2">
          <button
            className="rounded-full border border-white/30 p-2 disabled:opacity-40"
            disabled={i <= 0}
            onClick={() => setI((v) => Math.max(0, v - 1))}
            aria-label="قبلی"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            className="rounded-full border border-white/30 p-2 disabled:opacity-40"
            disabled={i >= max}
            onClick={() => setI((v) => Math.min(max, v + 1))}
            aria-label="بعدی"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {shown.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
