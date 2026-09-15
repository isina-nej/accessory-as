import Link from "next/link";
import { toFa } from "@/lib/fa";
import { PAGE_SIZE, type ShopQuery } from "@/lib/products";
import { withQuery } from "@/lib/shop-query";

export function Pagination({ q, total }: { q: ShopQuery; total: number }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={withQuery("/", q, { page: p })}
          className={
            p === q.page
              ? "rounded-lg bg-(--color-brand) px-3 py-1 text-sm text-white"
              : "rounded-lg border bg-white px-3 py-1 text-sm"
          }
        >
          {toFa(p)}
        </Link>
      ))}
    </div>
  );
}
