"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { toFa } from "@/lib/fa";
import { type ShopProduct } from "@/lib/products";
import { ProductCard } from "./ProductCard";

function remaining(endsAt: string) {
  const minutes = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 60000));
  return [Math.floor(minutes / 1440), Math.floor(minutes / 60) % 24, minutes % 60]
    .map((n) => toFa(String(n).padStart(2, "0")));
}

export function OffersCarousel({ items, endsAt }: { items: ShopProduct[]; endsAt?: string | null }) {
  const [index, setIndex] = useState(0);
  // ponytail: The Figma timer is a static preview when the CMS has no campaign end date.
  const [timer, setTimer] = useState(["۰۳", "۲۰", "۳۵"]);
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => setTimer(remaining(endsAt));
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [endsAt]);
  if (!items.length) return null;

  const max = Math.max(0, items.length - 5);
  return (
    <section aria-label="پیشنهادهای شگفت‌انگیز" className="relative flex min-h-[350px] flex-col gap-6 overflow-hidden rounded-[10px] border border-[#D6DBDE] bg-white p-5 lg:flex-row lg:items-center lg:gap-8 lg:p-8">
      <div className="relative z-10 flex shrink-0 flex-col items-center gap-4 self-center lg:w-[152px]">
        <h2 className="text-center text-[30px] font-extrabold leading-[1.28] text-[#01413E] lg:text-[40px] lg:leading-[56px]">
          پیشنــهاد<br />شــگــفت<br />انگـــــــیز
        </h2>
        <div className="flex items-start gap-3" aria-label={`زمان باقی‌مانده: ${timer[0]} روز، ${timer[1]} ساعت و ${timer[2]} دقیقه`}>
          {timer.map((v, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="flex h-[37px] min-w-[38px] items-center justify-center rounded-md border border-[#D6DBDE] bg-[#F8FAF9] px-2 font-bold tabular-nums text-[#161B22]">{v}</span>
              <span className="text-xs font-bold text-[#8A9398]">{["روز", "ساعت", "دقیقه"][i]}</span>
            </div>
          ))}
        </div>
        <Link href="/shop?sort=all" className="flex items-center gap-0.5 text-sm font-bold text-[#1889F2] hover:underline focus-visible:underline">
          مشاهده همه <Icon name="icons-20--direction-left" className="h-5 w-5" alt="" />
        </Link>
      </div>
      <div className="relative z-10 min-w-0 flex-1 overflow-hidden rounded-[10px] border border-[#D6DBDE] bg-[#F8FAF9]">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5" key={index}>
          {items.slice(index, index + 5).map((p) => (
            <ProductCard key={p.id} p={p} offer />
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIndex((n) => (n >= max ? 0 : n + 1))}
        disabled={!max}
        aria-label="پیشنهاد بعدی"
        className="absolute bottom-1/2 left-3 z-20 hidden h-11 w-11 translate-y-1/2 items-center justify-center rounded-full border border-[#D6DBDE] bg-[#F8FAF9] shadow-[0_4px_35px_rgba(0,0,0,0.12)] disabled:cursor-default xl:flex"
      >
        <Icon name="icons-20--direction-left" className="h-6 w-6" alt="" />
      </button>
      {max > 0 && (
        <div className="flex justify-center gap-3 xl:hidden">
          <button type="button" aria-label="پیشنهاد قبلی" onClick={() => setIndex((n) => Math.max(0, n - 1))} disabled={!index} className="rounded-full border p-2 disabled:opacity-40"><Icon name="icons-20--direction-right" className="h-5 w-5" alt="" /></button>
          <button type="button" aria-label="پیشنهاد بعدی" onClick={() => setIndex((n) => (n >= max ? 0 : n + 1))} className="rounded-full border p-2"><Icon name="icons-20--direction-left" className="h-5 w-5" alt="" /></button>
        </div>
      )}
    </section>
  );
}
