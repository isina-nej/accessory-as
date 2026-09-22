"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatToman, toFa } from "@/lib/fa";
import type { MegaMenuData } from "@/lib/menu";
import { cartCount, useCart } from "@/stores/cart";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/shop", label: "فروشگاه" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/about", label: "درباره ما" },
];

const CAT_ICONS: Record<string, string> = {
  necklace: "icons-20--necklace",
  ring: "icons-20--ring",
  bracelet: "icons-20--bracelet",
  earring: "icons-20--ear-rings",
  anklet: "icons-20--shopping-bag",
  "half-set": "icons-20--durian",
  "full-set": "icons-20--bag",
};

export function Header({ menu }: { menu: MegaMenuData }) {
  const lines = useCart((s) => s.lines);
  const count = cartCount(lines);
  const { data: session } = authClient.useSession();

  const [open, setOpen] = useState<"cart" | "menu" | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setOpen(null);
    }, 180);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      cancelClose();
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  return (
    <header ref={rootRef} className="relative z-40 border-b border-[#D6DBDE] bg-white">
      <div className="mx-auto flex min-h-22 max-w-7xl items-center justify-between gap-8 px-4 py-5">
        {/* راست: لوگو عین فیگما */}
        <Link href="/" className="flex items-center gap-3">
          <span className="text-left font-serif font-black leading-none text-[#0A5A55]">
            <span className="block text-2xl tracking-tighter">AS</span>
            <span className="block text-[10px] tracking-widest font-sans font-medium">accessory</span>
          </span>
          <span aria-hidden className="h-8 w-px bg-black/10" />
          <span className="leading-tight text-right">
            <span className="block text-base font-extrabold text-[#161B22]">اکسسوری آس</span>
            <span className="block text-xs font-medium text-[#8A9398]">روایتی از سلیقه تو</span>
          </span>
        </Link>

        {/* وسط: ناوبری */}
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <div
            className="relative"
            onMouseEnter={() => {
              cancelClose();
              setOpen("menu");
            }}
            onMouseLeave={scheduleClose}
          >
            <button
              className={cn(
                "flex items-center gap-1.5 rounded-lg py-1.5 transition-colors hover:text-(--color-brand)",
                open === "menu" ? "text-(--color-brand)" : "text-[#161B22]",
              )}
              onClick={() => setOpen((v) => (v === "menu" ? null : "menu"))}
              aria-expanded={open === "menu"}
            >
              <Icon name="icons-20--menu-line-horizontal" className="h-4 w-4" alt="" />
              <span>دسته بندی محصولات</span>
              <Icon name="icons-20--direction-down" className={cn("h-4 w-4 transition-transform", open === "menu" && "rotate-180")} />
            </button>
            {open === "menu" && (
              <div
                className="absolute right-0 top-full pt-2"
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              >
                <MegaMenuPopup menu={menu} onClose={() => setOpen(null)} />
              </div>
            )}
          </div>

          <Link href="/shop" className="text-[#161B22] hover:text-(--color-brand)">
            فروشگاه
          </Link>
          <Link href="/contact" className="text-[#161B22] hover:text-(--color-brand)">
            تماس با ما
          </Link>
          <Link href="/about" className="text-[#161B22] hover:text-(--color-brand)">
            درباره ما
          </Link>
        </nav>

        {/* چپ: سبد + پروفایل + خط + جستجو */}
        <div className="flex items-center gap-4">
          <div
            className="relative"
            onMouseEnter={() => {
              cancelClose();
              setOpen("cart");
            }}
            onMouseLeave={scheduleClose}
          >
            <button
              onClick={() => setOpen((v) => (v === "cart" ? null : "cart"))}
              aria-expanded={open === "cart"}
              aria-label="سبد خرید"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8FAF9] border border-black/5 hover:bg-[#E7EFEE] transition-colors"
            >
              <Icon name="icons-20--shopping-basket" className="h-5 w-5" alt="" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#9F1239] px-1 text-[10px] font-extrabold text-white">
                  {toFa(count)}
                </span>
              )}
            </button>
            {open === "cart" && (
              <div
                className="absolute left-0 top-full pt-2"
                onMouseEnter={cancelClose}
                onMouseLeave={scheduleClose}
              >
                <CartHoverPopover count={count} onClose={() => setOpen(null)} />
              </div>
            )}
          </div>

          {session?.user ? (
            <Link href="/account" className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center">
                <Icon name="icons-20--user" className="h-5 w-5" alt="" />
              </span>
              <span className="leading-tight text-right">
                <span className="block text-[13px] font-bold text-[#161B22]">{session.user.name || "حساب کاربری"}</span>
                <span className="block text-[11px] text-[#8A9398]">حساب کاربری</span>
              </span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center">
                <Icon name="icons-20--user" className="h-5 w-5" alt="" />
              </span>
              <span className="leading-tight text-right">
                <span className="block text-[13px] font-bold text-[#161B22]">حساب کاربری</span>
                <span className="block text-[11px] text-[#8A9398]">ورود یا ثبت نام</span>
              </span>
            </Link>
          )}

          <span aria-hidden className="h-8 w-px bg-black/10" />

          <Link href="/shop" aria-label="جستجو" className="rounded-lg p-1 text-[#161B22] hover:bg-black/5">
            <Icon name="icons-20--search" className="h-5 w-5" alt="" />
          </Link>
        </div>
      </div>

      {/* نو بار افقی موبایل */}
      <nav className="flex gap-4 overflow-x-auto border-t px-4 py-2 text-sm md:hidden">
        <Link href="/shop" className="whitespace-nowrap font-medium">
          دسته‌بندی محصولات
        </Link>
        {NAV.map((n) => (
          <Link key={n.label} href={n.href} className="whitespace-nowrap">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

// مگامنوی هاور دسته‌بندی مطابق فریم 6299:4271 فیگما
function MegaMenuPopup({ menu, onClose }: { menu: MegaMenuData; onClose: () => void }) {
  const cats = menu.cats.length > 0 ? menu.cats : [
    { slug: "necklace", title: "گردنبند" },
    { slug: "ring", title: "انگشتر" },
    { slug: "bracelet", title: "دستبند" },
    { slug: "earring", title: "گوشواره" },
    { slug: "anklet", title: "پابند" },
    { slug: "half-set", title: "نیم‌ست" },
    { slug: "full-set", title: "ست کامل" },
  ];

  return (
    <div className="w-64 rounded-2xl border border-[#d6dbde] bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
      <p className="px-3 py-1.5 text-xs font-bold text-(--color-muted-fg)">دسته‌بندی‌های آس</p>
      <ul className="mt-1 space-y-1">
        {cats.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/shop?cat=${c.slug}`}
              onClick={onClose}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-[#161b22] transition-colors hover:bg-(--color-mist) hover:text-(--color-brand)"
            >
              <span className="flex items-center gap-2">
                <Icon name={CAT_ICONS[c.slug] ?? "icons-20--ring"} className="h-5 w-5" />
                {c.title}
              </span>
              <span className="text-xs text-(--color-muted-fg)">←</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-2 border-t pt-2">
        <Link
          href="/shop"
          onClick={onClose}
          className="block rounded-xl bg-(--color-mist) px-3 py-2 text-center text-xs font-bold text-(--color-brand) hover:bg-[#e8efee]"
        >
          مشاهده تمام اکسسوری‌ها
        </Link>
      </div>
    </div>
  );
}

// پاپ‌اور هاور سبد خرید مطابق فریم 749:332 فیگما
function CartHoverPopover({ count, onClose }: { count: number; onClose: () => void }) {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  const [detail, setDetail] = useState<{ id: string; title: string; price: number; image: string | null }[]>([]);

  useEffect(() => {
    if (lines.length === 0) {
      setDetail([]);
      return;
    }
    fetch(`/api/cart?ids=${lines.map((l) => l.id).join(",")}`)
      .then((r) => r.json())
      .then((j) => setDetail(j.ok ? j.data : []))
      .catch(() => setDetail([]));
  }, [lines]);

  const subtotal = lines.reduce((n, l) => {
    const p = detail.find((d) => d.id === l.id);
    return n + (p ? p.price * l.qty : 0);
  }, 0);

  return (
    <div className="w-88 rounded-2xl border border-[#d6dbde] bg-white p-4 shadow-2xl md:w-[420px] animate-in fade-in zoom-in-95 duration-150">
      {/* هدر پاپ‌اور */}
      <div className="flex items-center justify-between border-b pb-3">
        <span className="flex items-center gap-1.5 text-base font-extrabold text-[#161b22]">
          <Icon name="icons-20--shopping-basket" className="h-4 w-4" />
          سبد خرید شما
        </span>
        <span className="text-xs text-(--color-muted-fg)">{toFa(count)} کالا</span>
      </div>

      {lines.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-3xl">🛍️</p>
          <p className="mt-2 text-sm text-(--color-muted-fg)">سبد خرید شما خالی است</p>
          <Link
            href="/shop"
            onClick={onClose}
            className="mt-3 inline-block rounded-xl bg-(--color-mist) px-4 py-1.5 text-xs font-bold text-(--color-brand)"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {/* لیست آیتم‌ها */}
          <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
            {lines.map((l) => {
              const p = detail.find((d) => d.id === l.id);
              return (
                <div key={l.id} className="flex items-center gap-3 rounded-xl border border-black/5 p-2 bg-[#fcfdfd]">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-(--color-mist)">
                    {p?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-(--color-mist)">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/images/product-05.webp" alt="" className="h-full w-full object-cover" />
                    </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${p?.title ? l.id : ""}`}
                      onClick={onClose}
                      className="block truncate text-xs font-bold text-[#161b22] hover:text-(--color-brand)"
                    >
                      {p?.title ?? "در حال دریافت…"}
                    </Link>
                    <p className="mt-0.5 text-xs font-bold text-(--color-brand)">
                      {p ? formatToman(p.price * l.qty) : "—"}
                    </p>
                  </div>
                  {/* دکمه‌های کم و زیاد و حذف */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center rounded-lg border bg-white px-1.5 py-0.5 text-xs font-bold">
                      <button
                        onClick={() => setQty(l.id, l.qty + 1)}
                        className="text-(--color-muted-fg) hover:text-black"
                        aria-label="افزایش"
                      >
                        <Icon name="icons-other--plus-2" className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center">{toFa(l.qty)}</span>
                      <button
                        onClick={() => setQty(l.id, l.qty - 1)}
                        className="text-(--color-muted-fg) hover:text-black"
                        aria-label="کاهش"
                      >
                        <Icon name="icons-20--remove" className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(l.id)}
                      className="text-black/30 hover:text-(--color-wine)"
                      aria-label="حذف"
                    >
                      <Icon name="icons-20--remove-delete" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* خلاصه مجموع سبد مطابق فیگما */}
          <div className="border-t pt-2.5">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-[#4b5563]">مجموع سبد خرید:</span>
              <span className="text-base text-[#161b22]">{formatToman(subtotal)}</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-4 text-(--color-muted-fg)">
              مبلغ سفارش هنوز پرداخت نشده و در صورت اتمام موجودی، کالاها از سبد حذف می‌شوند.
            </p>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex gap-2 pt-1">
            <Link
              href="/cart"
              onClick={onClose}
              className="flex-1 rounded-xl border border-black/15 py-2.5 text-center text-xs font-bold text-[#161b22] hover:bg-black/5"
            >
              مشاهده سبد
            </Link>
            <Link
              href="/checkout/address"
              onClick={onClose}
              className="flex-1 rounded-xl bg-(--color-brand) py-2.5 text-center text-xs font-bold text-white hover:bg-[#084a46]"
            >
              ثبت سفارش
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
