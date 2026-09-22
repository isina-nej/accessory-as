"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { toFa } from "@/lib/fa";
import { useCart } from "@/stores/cart";
import { Button } from "../ui/button";

export function AddToCart({ id, title, stock }: { id: string; title: string; stock: number }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  if (stock === 0) {
    return (
      <Button disabled className="w-full">
        ناموجود
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-lg border bg-white">
        <button
          className="px-3 py-2 text-lg"
          onClick={() => setQty((v) => Math.max(1, v - 1))}
          aria-label="کمتر"
        >
          −
        </button>
        <span className="min-w-8 text-center text-sm font-bold">{toFa(qty)}</span>
        <button
          className="px-3 py-2 text-lg"
          onClick={() => setQty((v) => Math.min(stock, v + 1))}
          aria-label="بیشتر"
        >
          ＋
        </button>
      </div>
      <Button
        className="flex-1"
        onClick={() => {
          for (let n = 0; n < qty; n++) add(id);
        }}
        aria-label={`افزودن ${title} به سبد`}
      >
        <Icon name="icons-20--add-to-cart-button" className="h-4 w-4 brightness-0 invert" />
        افزودن به سبد
      </Button>
    </div>
  );
}
