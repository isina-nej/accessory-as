"use client";

import { useState } from "react";
import { toggleFavorite } from "@/lib/account-actions";

export function FavRemove({ id }: { id: string }) {
  const [gone, setGone] = useState(false);
  if (gone) return null;
  return (
    <button
      className="text-xs text-(--color-wine)"
      onClick={async () => {
        const r = await toggleFavorite(id);
        if (r.ok) setGone(true);
      }}
    >
      حذف از علاقه‌مندی‌ها
    </button>
  );
}

export function FavToggle({ id, initial }: { id: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button
      aria-pressed={on}
      aria-label="علاقه‌مندی"
      className={`rounded-full border px-3 py-1 text-xs ${on ? "border-(--color-wine) text-(--color-wine)" : ""}`}
      onClick={async () => {
        const r = await toggleFavorite(id);
        if (r.ok) setOn(r.data);
      }}
    >
      {on ? "♥ در علاقه‌مندی‌ها" : "♡ علاقه‌مندی"}
    </button>
  );
}
