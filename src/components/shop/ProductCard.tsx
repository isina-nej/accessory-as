"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { formatToman, toFa } from "@/lib/fa";
import { type ShopProduct } from "@/lib/products";
import { useCart } from "@/stores/cart";
import { Button } from "../ui/button";

export function ProductCard({ p }: { p: ShopProduct }) {
  const add = useCart((s) => s.add);
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-white">
      <Link href={`/products/${p.slug}`} className="relative block aspect-square bg-(--color-mist)">
        {p.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/product-02.webp" alt={p.title} className="h-full w-full object-cover" loading="lazy" />
          </span>
        )}
        {p.discountPct ? (
          <span className="absolute top-2 right-2 rounded-full bg-(--color-wine) px-2 py-0.5 text-xs text-white">
            {toFa(`٪${p.discountPct}`)} تخفیف
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/products/${p.slug}`} className="text-sm font-medium">
          {p.title}
        </Link>
        <div className="mt-auto flex items-end justify-between">
          <div>
            {p.oldPriceToman ? (
              <p className="text-xs text-(--color-muted-fg) line-through">{formatToman(p.oldPriceToman)}</p>
            ) : null}
            <p className="font-bold">{formatToman(p.priceToman)}</p>
          </div>
          <Button size="sm" onClick={() => add(p.id)} aria-label={`افزودن ${p.title} به سبد`}>
            <Icon name="icons-20--add-to-cart-button" className="h-4 w-4 brightness-0 invert" />
          </Button>
        </div>
        {p.stock === 0 ? <p className="text-xs text-(--color-wine)">ناموجود</p> : null}
      </div>
    </div>
  );
}
