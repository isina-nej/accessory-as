"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { toFa } from "@/lib/fa";
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
  const cartTriggerRef = useRef<HTMLButtonElement>(null);
  const cartPanelRef = useRef<HTMLDivElement>(null);
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
      setOpen((current) => current === "menu" ? null : current);
    }, 180);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (cartPanelRef.current) cartTriggerRef.current?.focus();
        setOpen(null);
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (cartPanelRef.current?.contains(target) || cartTriggerRef.current?.contains(target)) return;
      if (cartPanelRef.current) setOpen(null);
      else if (rootRef.current && !rootRef.current.contains(target)) setOpen(null);
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
    <header ref={rootRef} className="relative z-40 w-full max-w-full border-b border-[#D6DBDE] bg-white">
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

        {/* چپ: جستجو + خط + پروفایل + سبد (در RTL از راست به چپ: جستجو، خط، حساب کاربری، سبد خرید) */}
        <div className="flex items-center gap-4">
          <Link href="/shop" aria-label="جستجو" className="rounded-lg p-1 text-[#161B22] hover:bg-black/5">
            <Icon name="icons-20--search" className="h-5 w-5" alt="" />
          </Link>

          <span aria-hidden className="h-8 w-px bg-black/10" />

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

          <div className="relative">
            <button
              ref={cartTriggerRef}
              onClick={() => {
                cancelClose();
                setOpen((v) => (v === "cart" ? null : "cart"));
              }}
              aria-expanded={open === "cart"}
              aria-haspopup="dialog"
              aria-controls="cart-popover"
              aria-label="سبد خرید"
              className="relative flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#D6DBDE] bg-[#F8FAF9] transition-colors hover:bg-[#E7EFEE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A5A55]"
            >
              <Icon name="icons-20--shopping-basket" className="h-5 w-5" alt="" />
              {count > 0 && (
                <span aria-hidden="true" className="absolute bottom-1.5 left-1.5 h-3 w-3 rounded-full bg-[#9F1239] shadow-[0_4px_6px_rgba(159,18,57,0.15)]" />
              )}
            </button>
            {open === "cart" && (
              <div ref={cartPanelRef} className="fixed inset-x-3 top-3 z-50 md:absolute md:-left-4 md:right-auto md:top-[calc(100%+22px)] md:w-[472px]">
                <CartHoverPopover onClose={() => setOpen(null)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* نو بار افقی موبایل */}
      <nav className="flex gap-3 overflow-x-auto border-t border-black/5 bg-white px-4 py-2 text-xs sm:text-[13px] font-medium text-[#161B22] md:hidden w-full max-w-full" aria-label="ناوبری موبایل">
        <Link href="/shop" className="whitespace-nowrap rounded-full bg-[#E7EFEE] px-3 py-1.5 font-bold text-[#01413E]">
          دسته‌بندی محصولات
        </Link>
        {NAV.map((n) => (
          <Link key={n.label} href={n.href} className="whitespace-nowrap rounded-full px-3 py-1.5 hover:bg-[#F8FAF9]">
            {n.label}
          </Link>
        ))}
      </nav>
      {/* نوبار پایین موبایل عین فیگما 4302:2078: خانه / دسته‌بندی / سبد / جستجو / اکانت */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 backdrop-blur md:hidden" aria-label="نوبار پایین">
        <div className="mx-auto grid max-w-md grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
          <Link href="/" className="flex flex-col items-center gap-0.5 rounded-lg py-1 text-[#0A5A55]">
            <Icon name="icons-solid-20--home" className="h-6 w-6" alt="" />
            <span className="text-[11px] font-bold">خانه</span>
          </Link>
          <Link href="/shop" className="flex flex-col items-center gap-0.5 rounded-lg py-1 text-[#4B5563]">
            <Icon name="icons-20--menu-line-horizontal" className="h-6 w-6" alt="" />
            <span className="text-[11px] font-medium">دسته‌بندی</span>
          </Link>
          <Link href="/cart" className="relative flex flex-col items-center gap-0.5 rounded-lg py-1 text-[#4B5563]">
            <Icon name="icons-20--shopping-basket" className="h-6 w-6" alt="" />
            <span className="text-[11px] font-medium">سبد خرید</span>
            {count > 0 && (
              <span className="absolute right-1/2 top-0 flex h-4 min-w-4 translate-x-4 items-center justify-center rounded-full bg-[#9F1239] px-1 text-[10px] font-extrabold text-white">
                {toFa(count)}
              </span>
            )}
          </Link>
          <Link href="/shop" className="flex flex-col items-center gap-0.5 rounded-lg py-1 text-[#4B5563]">
            <Icon name="icons-20--search" className="h-6 w-6" alt="" />
            <span className="text-[11px] font-medium">جستجو</span>
          </Link>
          <Link href={session?.user ? "/account" : "/login"} className="flex flex-col items-center gap-0.5 rounded-lg py-1 text-[#4B5563]">
            <Icon name="icons-20--user" className="h-6 w-6" alt="" />
            <span className="text-[11px] font-medium">اکانت من</span>
          </Link>
        </div>
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

// پاپ‌آپ سبد خرید مطابق فریم 749:332 فیگما؛ داده‌ها از API سبد می‌آیند.
function CartHoverPopover({ onClose }: { onClose: () => void }) {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const [snapshot, setSnapshot] = useState<{
    ids: string; failed: boolean; data: {
      id: string; slug: string; title: string; price: number;
      oldPrice: number | null; stock: number; image: string | null;
    }[];
  }>({ ids: "", failed: false, data: [] });
  const ids = lines.map((l) => l.id).join(",");

  useEffect(() => {
    if (!ids) return;
    const controller = new AbortController();
    fetch(`/api/cart?ids=${encodeURIComponent(ids)}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Cart request failed");
        return r.json();
      })
      .then((j) => {
        if (!j.ok || !Array.isArray(j.data)) throw new Error("Cart response failed");
        if (!controller.signal.aborted) setSnapshot({ ids, failed: false, data: j.data });
      })
      .catch(() => { if (!controller.signal.aborted) setSnapshot({ ids, failed: true, data: [] }); });
    return () => controller.abort();
  }, [ids]);

  const loading = !!ids && snapshot.ids !== ids;
  const failed = !loading && snapshot.failed;
  const products = new Map((loading || failed ? [] : snapshot.data).map((p) => [p.id, p]));
  const subtotal = lines.reduce((sum, l) => sum + (products.get(l.id)?.price ?? 0) * l.qty, 0);
  const ready = !failed && !loading && lines.length <= 50 && lines.every((l) => {
    const p = products.get(l.id);
    return p && p.stock >= l.qty;
  });

  return (
    <section id="cart-popover" role="dialog" aria-label="سبد خرید شما" dir="rtl" className="flex max-h-[calc(100dvh-24px)] w-full flex-col gap-6 overflow-y-auto rounded-[10px] border border-[#D6DBDE] bg-white p-6 text-[#161B22] shadow-[0_16px_70px_rgba(0,0,0,0.08)] md:max-h-[calc(100dvh-100px)] md:w-[472px]">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <Icon name="icons-20--shopping-basket" className="h-5 w-5" alt="" />
          <h2 className="text-base font-extrabold leading-7">سبد خرید شما</h2>
        </div>
        <span className="text-sm font-semibold text-[#8A9398]">{toFa(lines.length)} کالا</span>
      </div>

      {lines.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-[#4B5563]">سبد خرید شما خالی است.</p>
          <Link href="/shop" onClick={onClose} className="mt-4 inline-block rounded-lg bg-[#F8FAF9] px-4 py-2 text-sm font-bold text-[#01413E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#01413E]">مشاهده محصولات</Link>
        </div>
      ) : (
        <>
          {failed && <p role="alert" className="text-sm text-[#9F1239]">دریافت اطلاعات سبد ناموفق بود. صفحه را دوباره بارگذاری کنید.</p>}
          {!loading && !failed && lines.some((l) => !products.has(l.id)) && <p role="alert" className="text-sm text-[#9F1239]">یکی از کالاها دیگر در دسترس نیست. آن را از سبد حذف کنید.</p>}
          <div className="max-h-[min(386px,45vh)] overflow-y-auto md:max-h-[386px]" aria-busy={loading}>
            {lines.map((l) => {
              const p = products.get(l.id);
              return (
                <div key={l.id} className="flex min-h-[118px] items-center gap-3 border-b border-[#D6DBDE] pb-4 last:mb-0">
                  <div className="flex h-[102px] w-9 shrink-0 flex-col items-center justify-between">
                    <button type="button" onClick={() => setQty(l.id, l.qty + 1)} disabled={!p || l.qty >= p.stock || l.qty >= 99} aria-label={`افزایش تعداد ${p?.title ?? "کالا"}`} className="flex h-[30px] w-9 items-center justify-center rounded border border-[#D6DBDE] text-xl leading-none text-[#0A5A55] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A5A55]">+</button>
                    <span className="text-base font-semibold" aria-label={`تعداد ${toFa(l.qty)}`}>{toFa(l.qty)}</span>
                    <button type="button" onClick={() => setQty(l.id, l.qty - 1)} aria-label={l.qty === 1 ? `حذف ${p?.title ?? "کالا"} از سبد` : `کاهش تعداد ${p?.title ?? "کالا"}`} className="flex h-[30px] w-9 items-center justify-center rounded border border-[#D6DBDE] text-xl leading-none text-[#9F1239] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9F1239]">−</button>
                  </div>
                  <div className="flex h-[102px] w-[102px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#D6DBDE] bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p?.image ?? "/images/product-01.webp"} alt={p?.title ?? ""} className="h-full w-full object-contain" />
                  </div>
                  <div className="flex h-[102px] min-w-0 flex-1 flex-col items-start justify-between text-right">
                    <div className="w-full">
                      {p ? <Link href={`/products/${p.slug}`} onClick={onClose} className="block text-sm font-bold leading-[23px] hover:text-[#0A5A55] focus-visible:outline-2 focus-visible:outline-[#0A5A55]">{p.title}</Link> : <span className="text-sm text-[#8A9398]">{failed ? "اطلاعات کالا در دسترس نیست" : loading ? "در حال دریافت…" : "کالا دیگر در دسترس نیست"}</span>}
                      {p && p.stock < l.qty && <p className="text-xs text-[#9F1239]">موجودی کافی نیست</p>}
                      {!loading && !p && <button type="button" onClick={() => remove(l.id)} className="mt-1 text-xs text-[#9F1239] underline focus-visible:outline-2 focus-visible:outline-[#9F1239]">حذف از سبد</button>}
                    </div>
                    {p && <div className="flex flex-col items-start">
                      {p.oldPrice && p.oldPrice > p.price && <del className="text-xs leading-[19px] text-[#8A9398]">{toFa(p.oldPrice.toLocaleString("en-US"))}</del>}
                      <p className="flex items-baseline gap-1 text-[#161B22]"><b className="text-base leading-[25px]">{toFa(p.price.toLocaleString("en-US"))}</b><span className="text-[10px] font-bold text-[#4B5563]">تومن</span></p>
                    </div>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-baseline gap-1 text-[#9F1239]">
              <b className="text-lg leading-7">{ready ? toFa(subtotal.toLocaleString("en-US")) : "—"}</b>
              <span className="text-xs font-bold">تومن</span>
            </div>
            <div className="max-w-[232px] text-right">
              <h3 className="text-sm font-extrabold leading-[23px]">مجموع سبد خرید</h3>
              <p className="mt-1 text-xs leading-5 text-[#4B5563]">مبلغ سفارش هنوز پرداخت نشده و در صورت اتمام موجودی، کالاها از سبد حذف می‌شوند.</p>
            </div>
          </div>
          <Link href="/checkout/address" onClick={onClose} aria-disabled={!ready || subtotal === 0} tabIndex={ready && subtotal > 0 ? 0 : -1} className={`flex h-[52px] items-center justify-center gap-3 rounded-[10px] bg-[radial-gradient(ellipse_at_center,#00807A,#01413E)] text-base font-extrabold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#01413E] ${!ready || subtotal === 0 ? "pointer-events-none opacity-50" : ""}`}>
            <Icon name="icons-20--check-cart" className="h-5 w-5 brightness-0 invert" alt="" />
            ثبت سفارش
          </Link>
        </>
      )}
    </section>
  );
}
