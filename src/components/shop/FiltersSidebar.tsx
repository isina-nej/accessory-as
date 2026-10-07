"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { toFa } from "@/lib/fa";
import { type ShopQuery } from "@/lib/products";
import { withQuery } from "@/lib/shop-query";

type Meta = {
  cats: { slug: string; title: string }[];
  colors: { label: string }[];
  sizes: { value: string }[];
};

const MIN = 250000;
const MAX = 25050000;
const swatches: Record<string, string> = {
  "طلایی": "#D6CBA1", "صورتی": "#FF55C1", "نقره‌ای": "#D6DBDE",
  "بنفش": "#950E97", "آبی": "#1889F2", "سفید": "#FFFFFF",
};

export function FiltersSidebar({ q, meta, base = "/shop" }: { q: ShopQuery; meta: Meta; base?: string }) {
  const router = useRouter();
  const [min, setMin] = useState(q.min);
  const [max, setMax] = useState(q.max);
  const [activeHandle, setActiveHandle] = useState<"min" | "max">("max");
  const [open, setOpen] = useState(false);
  const commit = (minValue: number, maxValue: number) => {
    router.push(withQuery(base, q, { min: minValue, max: maxValue, page: 1 }));
  };
  const minPct = ((min - MIN) / (MAX - MIN)) * 100;
  const maxPct = ((max - MIN) / (MAX - MIN)) * 100;
  const price = (n: number) => toFa(n.toLocaleString("en-US"));

  return (
    <aside aria-label="فیلترهای فروشگاه" className="rounded-[10px] border border-[#D6DBDE] bg-white p-5 lg:p-6">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="mb-4 flex w-full items-center justify-between font-bold text-[#01413E] lg:hidden">فیلترها <Icon name="icons-20--setting-filter" className="h-5 w-5" alt="" /></button>
      <div className={cn("lg:block", open ? "block" : "hidden")}>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#01413E]">فیلتــر هـا</h2>
        <Link href={base} className="text-xs font-bold text-[#8A9398] hover:text-[#9F1239]">حذف فیلتر ها</Link>
      </div>

      <div className="flex items-center justify-between border-b border-[#D6DBDE] pb-4">
        <span className="text-sm font-bold text-[#161B22]">فقط کالاهای موجود</span>
        <Link role="switch" aria-checked={q.inStock} aria-label="فقط کالاهای موجود" href={withQuery(base, q, { inStock: !q.inStock, page: 1 })}
          className={cn("relative h-[27px] w-14 rounded-full border border-[#D6DBDE] bg-[#F8FAF9] focus-visible:outline-2 focus-visible:outline-[#0A5A55]", q.inStock && "border-[#0A5A55] bg-[#0A5A55]")}
        ><span className={cn("absolute top-[5px] left-[5px] h-[15px] w-[15px] rounded-full bg-[#C2C9CD] transition-transform", q.inStock && "translate-x-[28px] bg-white")} /></Link>
      </div>

      <section aria-labelledby="price-filter" className="border-b border-[#D6DBDE] py-6">
        <div className="flex items-center justify-between">
          <h3 id="price-filter" className="flex items-center gap-3 text-sm font-bold text-[#161B22]"><Icon name="icons-20--price-tag" className="h-5 w-5" alt="" />محدوده قیمت</h3>
          <Icon name="icons-20--direction-down" className="h-5 w-5" alt="" />
        </div>
        <div className="mt-7 px-2">
          <div className="relative h-1 rounded-full bg-[#E8EBED]">
            <span className="absolute top-0 h-1 rounded-full bg-[#01413E]" style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }} />
            <input aria-label="حداقل قیمت" type="range" min={MIN} max={MAX} step={50000} value={min}
              onPointerDown={() => setActiveHandle("min")}
              onChange={(e) => setMin(Math.min(Number(e.target.value), max - 50000))}
              onPointerUp={(e) => commit(Math.min(Number(e.currentTarget.value), max - 50000), max)}
              onKeyUp={(e) => commit(Math.min(Number(e.currentTarget.value), max - 50000), max)}
              className="shop-range absolute inset-0 w-full appearance-none bg-transparent" style={{ zIndex: activeHandle === "min" ? 5 : 3 }} />
            <input aria-label="حداکثر قیمت" type="range" min={MIN} max={MAX} step={50000} value={max}
              onPointerDown={() => setActiveHandle("max")}
              onChange={(e) => setMax(Math.max(Number(e.target.value), min + 50000))}
              onPointerUp={(e) => commit(min, Math.max(Number(e.currentTarget.value), min + 50000))}
              onKeyUp={(e) => commit(min, Math.max(Number(e.currentTarget.value), min + 50000))}
              className="shop-range absolute inset-0 w-full appearance-none bg-transparent" style={{ zIndex: activeHandle === "max" ? 5 : 3 }} />
          </div>
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-bold text-[#161B22]">
            <span>{price(min)} <small className="text-[#4B5563]">تومن</small></span><span className="text-[#4B5563]">-</span><span>{price(max)} <small className="text-[#4B5563]">تومن</small></span>
          </div>
        </div>
      </section>

      <section aria-labelledby="category-filter" className="border-b border-[#D6DBDE] py-6">
        <h3 id="category-filter" className="flex items-center gap-3 text-sm font-bold text-[#161B22]"><Icon name="icons-20--necklace" className="h-5 w-5" alt="" />محصولات</h3>
        <div className="mt-5 flex flex-col gap-3">
          {meta.cats.map((c) => (
            <Link key={c.slug} href={withQuery(base, q, { cat: q.cat === c.slug ? "" : c.slug, page: 1 })} aria-current={q.cat === c.slug ? "true" : undefined} className="flex items-center gap-3 text-sm font-bold text-[#161B22] hover:text-[#0A5A55]">
              <span className={cn("flex h-5 w-5 items-center justify-center rounded border border-[#D6DBDE] bg-[#F8FAF9]", q.cat === c.slug && "border-[#0A5A55] bg-[#0A5A55] text-white")}>{q.cat === c.slug ? "✓" : ""}</span>{c.title}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="color-filter" className="border-b border-[#D6DBDE] py-6">
        <h3 id="color-filter" className="flex items-center gap-3 text-sm font-bold text-[#161B22]"><Icon name="icons-20--paint-bucket" className="h-5 w-5" alt="" />رنگ</h3>
        <div className="mt-5 flex flex-col gap-3">
          {meta.colors.map((c) => (
            <Link key={c.label} href={withQuery(base, q, { color: q.color === c.label ? "" : c.label, page: 1 })} aria-current={q.color === c.label ? "true" : undefined} className="flex items-center justify-between text-sm font-bold text-[#161B22] hover:text-[#0A5A55]">
              <span className="flex items-center gap-3"><span className={cn("flex h-5 w-5 items-center justify-center rounded border border-[#D6DBDE] bg-[#F8FAF9]", q.color === c.label && "border-[#0A5A55] bg-[#0A5A55] text-white")}>{q.color === c.label ? "✓" : ""}</span>{c.label}</span>
              <span aria-hidden className="h-5 w-5 rounded-full border border-[#D7E8E7]" style={{ backgroundColor: swatches[c.label] || "#D6DBDE" }} />
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="size-filter" className="pt-6">
        <h3 id="size-filter" className="flex items-center gap-3 text-sm font-bold text-[#161B22]"><Icon name="icons-20--sort-size-asc" className="h-5 w-5" alt="" />سایز</h3>
        <div className="mt-5 flex flex-col gap-3">
          {meta.sizes.map((s) => (
            <Link key={s.value} href={withQuery(base, q, { size: q.size === s.value ? "" : s.value, page: 1 })} aria-current={q.size === s.value ? "true" : undefined} className="flex items-center gap-3 text-sm font-bold text-[#161B22] hover:text-[#0A5A55]">
              <span className={cn("flex h-5 w-5 items-center justify-center rounded border border-[#D6DBDE] bg-[#F8FAF9]", q.size === s.value && "border-[#0A5A55] bg-[#0A5A55] text-white")}>{q.size === s.value ? "✓" : ""}</span>{toFa(s.value)}
            </Link>
          ))}
        </div>
      </section>
      </div>
    </aside>
  );
}
