"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { toggleFavorite } from "@/lib/account-actions";
import { toFa } from "@/lib/fa";
import { type ShopProduct } from "@/lib/products";
import { useCart } from "@/stores/cart";

const colors = ["#D6DBDE", "#0A5A55", "#D6C2A1"];
const number = (n: number) => toFa(n.toLocaleString("en-US"));

export function ProductCard({ p, offer = false }: { p: ShopProduct; offer?: boolean }) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const href = `/products/${p.slug}`;
  return (
    <article className={`flex h-[286px] min-w-0 flex-col gap-3 border-b border-l border-[#D6DBDE] p-3 text-right ${offer ? "bg-[#F8FAF9]" : "bg-white"}`}>
      <div className="flex h-[142px] shrink-0 flex-col gap-2">
        <div className="flex h-6 items-center justify-between">
          {p.discountPct ? (
            <span className="rounded bg-[#9F1239] px-1.5 py-0.5 text-[11px] font-bold leading-[19px] text-white">
              تخفیف ٪{toFa(p.discountPct)}
            </span>
          ) : <span />}
          <button
            type="button"
            disabled={busy}
            aria-pressed={liked}
            aria-label={`${liked ? "حذف" : "افزودن"} ${p.title} ${liked ? "از" : "به"} علاقه‌مندی‌ها`}
            onClick={async () => {
              setBusy(true);
              try {
                const result = await toggleFavorite(p.id);
                if (result.ok) setLiked(result.data);
                else if (result.error === "وارد شو") router.push(`/login?callbackURL=${encodeURIComponent("/shop")}`);
              } finally { setBusy(false); }
            }}
            className={`flex h-6 w-6 items-center justify-center rounded focus-visible:outline-2 focus-visible:outline-[#0A5A55] ${liked ? "opacity-100" : "opacity-45 hover:opacity-100"}`}
          >
            <Icon name="icons-20--favorite-icon" className={`h-5 w-5 ${liked ? "brightness-0 saturate-100 [filter:invert(16%)_sepia(89%)_saturate(2248%)_hue-rotate(315deg)]" : ""}`} alt="" />
          </button>
        </div>
        <Link href={href} aria-label={p.title} className="flex h-[110px] items-center justify-center overflow-hidden focus-visible:outline-2 focus-visible:outline-[#0A5A55]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image || "/images/figma-new/prod-card.webp"} alt={p.title} loading="lazy" className="h-[107px] w-[154px] object-contain" />
        </Link>
      </div>
      <div className="flex h-[51px] shrink-0 flex-col gap-2">
        <Link href={href} className="block h-[23px] truncate text-sm leading-[23px] font-bold text-[#161B22] hover:text-[#0A5A55]">{p.title}</Link>
        <div className="flex h-5 items-center" aria-label="رنگ‌های موجود">
          {colors.map((color, i) => <span key={color} aria-hidden className={`h-5 w-5 rounded-full border border-white ${i ? "-mr-2" : ""}`} style={{ backgroundColor: color }} />)}
        </div>
      </div>
      <div className="mt-auto flex h-[45px] shrink-0 items-end justify-between">
        <div className="flex flex-col items-start">
          {p.oldPriceToman && p.oldPriceToman > p.priceToman ? <span className="text-xs leading-[19px] text-[#8A9398] line-through">{number(p.oldPriceToman)}</span> : null}
          <span className="flex items-baseline gap-1 whitespace-nowrap">
            <strong className="text-lg leading-7 font-bold text-[#161B22]">{number(p.priceToman)}</strong>
            <span className="text-xs font-bold text-[#4B5563]">تومن</span>
          </span>
        </div>
        {p.stock > 0 ? (
          <button type="button" onClick={() => add(p.id)} aria-label={`افزودن ${p.title} به سبد`} className="mb-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-[#0A5A55] hover:bg-[#D7E8E7] focus-visible:outline-2 focus-visible:outline-[#0A5A55]">
            <Icon name="icons-20--add-to-cart-button" className="h-5 w-5" alt="" />
          </button>
        ) : <span className="self-center text-xs font-bold text-[#9F1239]">ناموجود</span>}
      </div>
    </article>
  );
}
