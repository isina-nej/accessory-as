"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { toFa } from "@/lib/fa";
import { useCart } from "@/stores/cart";
import { ProductTabs } from "./ProductTabs";
import type { ProductReview } from "@/lib/get-products";

// ponytail: hex per color label until attributes carry a swatch value; add when DB has it.
const COLOR_HEX: Record<string, string> = {
  "طلایی": "#D6C2A1",
  "نقره‌ای": "#D6DBDE",
  "سفید": "#FFFFFF",
  "سبز": "#0A5A55",
  "صورتی": "#EFC3D0",
  "بنفش": "#9B8AC4",
  "آبی": "#7FA8D7",
};

export interface PanelProduct {
  id: string;
  slug: string;
  title: string;
  sku: string | null;
  categoryTitle: string | null;
  description: string | null;
  priceToman: number;
  oldPriceToman: number | null;
  discountPct: number | null;
  stock: number;
  sizes: { id: string; value: string }[];
  colors: { id: string; label: string }[];
}

const faNum = (n: number) => toFa(n.toLocaleString("en-US"));

export function ProductInfoPanel({
  product,
  initialTab,
  initialReviews,
  totalReviews,
}: {
  product: PanelProduct;
  initialTab?: "specs" | "reviews";
  initialReviews?: ProductReview[];
  totalReviews?: number;
}) {
  const add = useCart((s) => s.add);
  const [size, setSize] = useState<string | null>(
    () => product.sizes.find((s) => s.value === "22")?.id ?? product.sizes[0]?.id ?? null,
  );
  const [color, setColor] = useState<string | null>(() => product.colors[0]?.id ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const maxQty = Math.max(1, Math.min(product.stock, 99));
  const soldOut = product.stock === 0;

  const handleAdd = () => {
    if (soldOut) return;
    add(product.id, Math.min(qty, maxQty));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="box-border flex w-full min-w-0 flex-col gap-6 rounded-[10px] border border-[#D6DBDE] bg-white p-6">
      {/* نشان دسته + تیتر */}
      <div className="flex flex-col items-end gap-4">
        <span className="box-border flex h-8 flex-row items-center gap-1.5 rounded-lg border border-[#E8EBED] bg-[#F8FAF9] px-3 py-1.5 text-xs font-bold text-[#4B5563]">
          <Icon name="icons-20--ring" className="h-5 w-5" alt="" />
          {product.categoryTitle ?? "انگشتر"}
        </span>
        <h1 className="w-full text-center text-xl font-extrabold leading-[33px] text-[#161B22]">
          {product.title}
          {product.sku ? (
            <span className="mr-2 text-sm font-medium text-[#4B5563]">{toFa(product.sku)}</span>
          ) : null}
        </h1>
      </div>

      <hr className="border-[#D6DBDE]" />

      {/* قیمت + تخفیف */}
      <div className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0 text-right">
          {product.oldPriceToman && product.oldPriceToman > product.priceToman ? (
            <p className="text-sm font-bold leading-[22px] text-[#8A9398] line-through">
              {faNum(product.oldPriceToman)}
            </p>
          ) : null}
          <p className="flex items-baseline justify-end gap-2">
            <strong className="text-2xl font-bold leading-[37px] text-[#161B22]">
              {faNum(product.priceToman)}
            </strong>
            <span className="text-sm font-bold text-[#161B22]">تومن</span>
          </p>
          {product.discountPct ? (
            <p className="mt-1 text-sm font-medium text-[#4B5563]">تخفیف ویژه تا ۵ اسفند</p>
          ) : null}
        </div>
        {product.discountPct ? (
          <span className="flex shrink-0 flex-row items-center gap-0.5 rounded bg-[#9F1239] px-1.5 py-0.5 text-xs font-bold leading-5 text-white">
            تخفیف
            <span>{toFa(`٪${product.discountPct}`)}</span>
          </span>
        ) : null}
      </div>

      {/* توضیح کوتاه */}
      {product.description ? (
        <p className="text-right text-sm font-medium leading-6 text-[#161B22]">
          {product.description}
        </p>
      ) : null}

      {/* سایز */}
      {product.sizes.length > 0 ? (
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="flex flex-row items-center gap-2 text-sm font-extrabold text-[#161B22]">
              <Icon name="icons-20--sort-size-asc" className="h-5 w-5" alt="" />
              سایز
            </span>
            <span className="text-xs font-normal text-[#4B5563] underline">
              راهنمای انتخاب سایز
            </span>
          </div>
          <div
            className="flex flex-row flex-wrap items-center justify-end gap-3"
            role="radiogroup"
            aria-label="سایز"
          >
            {[...product.sizes]
              .sort((a, b) => Number(b.value) - Number(a.value))
              .map((s) => {
              const selected = s.id === size;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`سایز ${toFa(s.value)}`}
                  onClick={() => setSize(s.id)}
                  className={`box-border flex h-9 min-w-[42px] flex-col items-center justify-center rounded-md border px-3 py-1.5 text-base font-bold leading-6 transition-colors focus-visible:outline-2 focus-visible:outline-[#0A5A55] ${
                    selected
                      ? "border-[#161B22] bg-[#161B22] text-white"
                      : "border-[#D6DBDE] bg-[#F8FAF9] text-[#161B22] hover:border-[#161B22]"
                  }`}
                >
                  {toFa(s.value)}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* رنگ */}
      {product.colors.length > 0 ? (
        <div className="flex flex-row items-center justify-between gap-3">
          <span className="flex shrink-0 flex-row items-center gap-2 text-sm font-extrabold text-[#161B22]">
            <Icon name="icons-20--paint-bucket" className="h-5 w-5" alt="" />
            رنگ
          </span>
          <div
            className="flex flex-row flex-wrap items-center justify-end gap-3"
            role="radiogroup"
            aria-label="رنگ"
          >
            {product.colors.map((c) => {
              const selected = c.id === color;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`رنگ ${c.label}`}
                  title={c.label}
                  onClick={() => setColor(c.id)}
                  style={{ backgroundColor: COLOR_HEX[c.label] ?? "#D6DBDE" }}
                  className={`h-[37px] w-[37px] shrink-0 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-[#0A5A55] ${
                    selected
                      ? "border-2 border-[#161B22]"
                      : "border border-white shadow-[0px_2px_8px_rgba(0,0,0,0.12)] hover:border-[#161B22]"
                  }`}
                />
              );
            })}
          </div>
        </div>
      ) : null}

      <hr className="border-[#D6DBDE]" />

      {/* تعداد + افزودن به سبد */}
      {soldOut ? (
        <button
          type="button"
          disabled
          className="h-[52px] w-full cursor-not-allowed rounded-[10px] bg-[#E8EBED] text-base font-extrabold text-[#8A9398]"
        >
          ناموجود
        </button>
      ) : (
        <div className="flex w-full flex-row items-stretch gap-4">
          <div
            dir="ltr"
            className="box-border flex h-[52px] w-[179px] shrink-0 flex-row items-center justify-between gap-4 rounded-[10px] border border-[#D6DBDE] bg-[#F8FAF9] px-3 py-1.5"
          >
            <button
              type="button"
              onClick={() => setQty((v) => Math.max(1, v - 1))}
              disabled={qty <= 1}
              aria-label="کمتر"
              className="box-border flex h-[33px] w-8 flex-row items-center justify-center rounded border border-[#E8EBED] bg-white text-lg font-bold text-[#9F1239] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[#0A5A55]"
            >
              −
            </button>
            <span aria-live="polite" className="min-w-5 text-center text-base font-bold text-black">
              {toFa(qty)}
            </span>
            <button
              type="button"
              onClick={() => setQty((v) => Math.min(maxQty, v + 1))}
              disabled={qty >= maxQty}
              aria-label="بیشتر"
              className="box-border flex h-[33px] w-8 flex-row items-center justify-center rounded border border-[#E8EBED] bg-white text-lg font-bold text-[#0A5A55] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[#0A5A55]"
            >
              ＋
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`افزودن ${product.title} به سبد خرید`}
            className="flex h-[52px] min-w-0 flex-1 flex-row items-center justify-center gap-3 rounded-[10px] text-base font-extrabold text-white transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-[#0A5A55]"
            style={{
              background:
                "linear-gradient(0deg, rgba(255,255,255,0.08), rgba(255,255,255,0.08)), radial-gradient(65.01% 290.66% at 49.73% 50.88%, #00807A 0%, #01413E 100%)",
            }}
          >
            {added ? "به سبد اضافه شد" : "افزودن به سبد خرید"}
            <Icon name="icons-20--add-to-cart-button" className="h-5 w-5 brightness-0 invert" alt="" />
          </button>
        </div>
      )}
      <p className="-mt-4 text-right text-xs text-[#8A9398]">
        {soldOut ? "این کالا فعلاً موجود نیست" : `${toFa(product.stock)} عدد موجود`}
      </p>

      {/* تب‌ها: مشخصات / دیدگاه‌ها */}
      <ProductTabs
        slug={product.slug}
        sku={product.sku}
        categoryTitle={product.categoryTitle}
        description={product.description}
        initialTab={initialTab}
        initialReviews={initialReviews}
        totalReviewsCount={totalReviews}
      />
    </div>
  );
}
