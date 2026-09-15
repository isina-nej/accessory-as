import Link from "next/link";
import { cn } from "@/lib/cn";
import { toFa } from "@/lib/fa";
import { SORTS, SORT_LABELS, type ShopQuery } from "@/lib/products";
import { withQuery } from "@/lib/shop-query";

export function SortBar({ q, total }: { q: ShopQuery; total: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-2">
      <p className="text-sm text-(--color-muted-fg)">{toFa(total)} اکسسوری</p>
      <div className="flex flex-wrap items-center gap-1 text-sm">
        <span className="ml-2 text-(--color-muted-fg)">مرتب‌سازی:</span>
        {SORTS.map((s) => (
          <Link
            key={s}
            href={withQuery("/", q, { sort: s, page: 1 })}
            className={cn(
              "rounded-full px-3 py-1",
              q.sort === s ? "bg-(--color-brand) text-white" : "hover:bg-black/5",
            )}
          >
            {SORT_LABELS[s]}
          </Link>
        ))}
      </div>
    </div>
  );
}
