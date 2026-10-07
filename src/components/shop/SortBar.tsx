import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { toFa } from "@/lib/fa";
import { SORT_LABELS, type ShopQuery, type SortKey } from "@/lib/products";
import { withQuery } from "@/lib/shop-query";

const order: SortKey[] = ["new", "cheap", "popular", "expensive"];

export function SortBar({ q, total, base = "/shop" }: { q: ShopQuery; total: number; base?: string }) {
  return (
    <div className="flex min-h-[27px] flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm font-bold text-[#161B22]">
        <Icon name="icons-20--sorting" className="h-5 w-5" alt="" />
        <span>مرتب‌سازی :</span>
        <nav aria-label="مرتب‌سازی محصولات" className="flex flex-wrap items-center gap-1 sm:gap-3">
          {order.map((sort) => (
            <Link key={sort} href={withQuery(base, q, { sort, page: 1 })}
              aria-current={q.sort === sort ? "page" : undefined}
              className={cn("rounded-md px-1.5 py-0.5 text-sm font-medium text-[#4B5563] hover:text-[#9F1239] focus-visible:outline-2 focus-visible:outline-[#9F1239]", q.sort === sort && "border border-[#9F1239] text-[#9F1239]")}
            >{SORT_LABELS[sort]}</Link>
          ))}
          <Link href={withQuery(base, q, { sort: "all", page: 1 })} aria-current={q.sort === "all" ? "page" : undefined}
            className={cn("rounded-md px-1.5 py-0.5 text-sm font-medium text-[#4B5563] hover:text-[#9F1239] focus-visible:outline-2 focus-visible:outline-[#9F1239]", q.sort === "all" && "border border-[#9F1239] text-[#9F1239]")}
          >همه</Link>
        </nav>
      </div>
      <p className="text-sm text-[#8A9398]">{toFa(total)} اکسسوری</p>
    </div>
  );
}
