import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatToman } from "@/lib/fa";
import { type ShopQuery } from "@/lib/products";
import { withQuery } from "@/lib/shop-query";

type Meta = {
  cats: { slug: string; title: string }[];
  colors: { label: string }[];
  sizes: { value: string }[];
};

export function FiltersSidebar({ q, meta }: { q: ShopQuery; meta: Meta }) {
  const clearHref = "/?sort=" + q.sort;
  return (
    <aside className="space-y-4 rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">فیلترها</h2>
        <Link href={clearHref} className="text-xs text-(--color-wine)">
          حذف فیلترها
        </Link>
      </div>

      <Link
        href={withQuery("/", q, { inStock: !q.inStock, page: 1 })}
        className="flex items-center gap-2 text-sm"
      >
        <span
          aria-hidden
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border text-xs",
            q.inStock ? "bg-(--color-brand) text-white" : "bg-white",
          )}
        >
          {q.inStock ? "✓" : ""}
        </span>
        فقط کالاهای موجود
      </Link>
      <div>
        <p className="text-sm font-bold">محدوده قیمت</p>
        <p className="mt-1 text-xs text-(--color-muted-fg)">
          {formatToman(q.min)} تا {formatToman(q.max)}
        </p>
        <div className="mt-2 flex gap-2">
          <Link
            href={withQuery("/", q, { min: 250000, max: 5000000, page: 1 })}
            className="rounded-full border px-3 py-1 text-xs"
          >
            تا ۵ میلیون
          </Link>
          <Link
            href={withQuery("/", q, { min: 5000000, max: 25050000, page: 1 })}
            className="rounded-full border px-3 py-1 text-xs"
          >
            بالای ۵ میلیون
          </Link>
        </div>
      </div>

      <div>
        <p className="text-sm font-bold">محصولات</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {meta.cats.map((c) => (
            <Link
              key={c.slug}
              href={withQuery("/", q, { cat: q.cat === c.slug ? "" : c.slug, page: 1 })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                q.cat === c.slug && "bg-(--color-brand) text-white",
              )}
            >
              {c.title}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold">رنگ</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {meta.colors.map((c) => (
            <Link
              key={c.label}
              href={withQuery("/", q, { color: q.color === c.label ? "" : c.label, page: 1 })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                q.color === c.label && "bg-(--color-brand) text-white",
              )}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold">سایز</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {meta.sizes.map((s) => (
            <Link
              key={s.value}
              href={withQuery("/", q, { size: q.size === s.value ? "" : s.value, page: 1 })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                q.size === s.value && "bg-(--color-brand) text-white",
              )}
            >
              {s.value}
            </Link>
          ))}
        </div>
      </div>

      <Link
        href={withQuery("/", q, { inStock: !q.inStock, page: 1 })}
        className="block rounded-lg border px-3 py-2 text-center text-sm"
      >
        {q.inStock ? "نمایش ناموجودها هم" : "فقط کالاهای موجود"}
      </Link>
    </aside>
  );
}
