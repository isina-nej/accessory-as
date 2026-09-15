"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ShoppingBag, User } from "lucide-react";
import { formatToman, toFa } from "@/lib/fa";
import type { MegaMenuData } from "@/lib/menu";
import { cartCount, useCart } from "@/stores/cart";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/shop", label: "فروشگاه" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/about", label: "درباره ما" },
];

export function Header({ menu }: { menu: MegaMenuData }) {
  const lines = useCart((s) => s.lines);
  const count = cartCount(lines);
  const [open, setOpen] = useState<"cart" | "menu" | null>(null);
  const rootRef = useRef<HTMLElement>(null);

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
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  return (
    <header ref={rootRef} className="relative border-b border-black/10 bg-white">
      <div className="mx-auto flex h-22 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-brand) font-bold text-white">
            AS
          </span>
          <span className="leading-tight">
            <span className="block font-bold">اکسسوری آس</span>
            <span className="block text-xs text-(--color-muted-fg)">روایتی از سلیقه تو</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <button
            className={cn("flex items-center gap-1 hover:text-(--color-brand)", open === "menu" && "text-(--color-brand)")}
            onClick={() => setOpen((v) => (v === "menu" ? null : "menu"))}
            aria-expanded={open === "menu"}
          >
            دسته‌بندی محصولات
            <ChevronDown className="h-4 w-4" />
          </button>
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} className="hover:text-(--color-brand)">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-black/5"
          >
            <User className="h-4 w-4" />
            ورود یا ثبت‌نام
          </Link>
          <div className="relative">
            <button
              onClick={() => setOpen((v) => (v === "cart" ? null : "cart"))}
              aria-expanded={open === "cart"}
              aria-label="سبد خرید"
              className="relative flex items-center gap-1 rounded-lg bg-(--color-brand) px-3 py-2 text-sm text-white"
            >
              <ShoppingBag className="h-4 w-4" />
              سبد
              {count > 0 && (
                <span className="absolute -top-2 -left-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--color-wine) px-1 text-xs">
                  {toFa(count)}
                </span>
              )}
            </button>
            {open === "cart" && <CartPopover onClose={() => setOpen(null)} />}
          </div>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t px-4 py-2 text-sm md:hidden">
        <Link href="/shop" className="whitespace-nowrap">
          دسته‌بندی محصولات
        </Link>
        {NAV.map((n) => (
          <Link key={n.label} href={n.href} className="whitespace-nowrap">
            {n.label}
          </Link>
        ))}
      </nav>
      {open === "menu" && <MegaMenu menu={menu} onClose={() => setOpen(null)} />}
    </header>
  );
}

function CartPopover({ onClose }: { onClose: () => void }) {
  const lines = useCart((s) => s.lines);
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
    <div className="absolute left-0 z-50 mt-2 w-80 rounded-2xl border bg-white p-4 shadow-xl">
      {lines.length === 0 ? (
        <p className="py-6 text-center text-sm text-(--color-muted-fg)">سبد خالی است</p>
      ) : (
        <div className="space-y-3">
          {lines.slice(0, 4).map((l) => {
            const p = detail.find((d) => d.id === l.id);
            return (
              <div key={l.id} className="flex items-center gap-2 text-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-(--color-mist)">
                  {p?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    "💍"
                  )}
                </span>
                <span className="flex-1 truncate">{p?.title ?? "…"}</span>
                <span className="text-xs text-(--color-muted-fg)">×{toFa(l.qty)}</span>
              </div>
            );
          })}
          <p className="border-t pt-2 text-sm font-bold">جمع: {formatToman(subtotal)}</p>
          <div className="flex gap-2">
            <Link href="/cart" onClick={onClose} className="flex-1 rounded-lg border px-3 py-2 text-center text-sm">
              مشاهده سبد
            </Link>
            <Link
              href="/checkout"
              onClick={onClose}
              className="flex-1 rounded-lg bg-(--color-brand) px-3 py-2 text-center text-sm text-white"
            >
              ثبت سفارش
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function MegaMenu({ menu, onClose }: { menu: MegaMenuData; onClose: () => void }) {
  return (
    <div className="absolute inset-x-0 top-full z-50 border-t bg-white shadow-xl">
      <div className="mx-auto grid max-w-7xl gap-6 p-6 md:grid-cols-4">
        {menu.cats.map((c) => (
          <div key={c.slug}>
            <Link
              href={`/shop?cat=${c.slug}`}
              onClick={onClose}
              className="text-sm font-bold text-(--color-brand)"
            >
              {c.title}
            </Link>
            <ul className="mt-2 space-y-1">
              {(menu.byCat[c.slug] ?? []).slice(0, 3).map((p) => (
                <li key={p.id}>
                  <Link href={`/products/${p.slug}`} onClick={onClose} className="text-sm hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
