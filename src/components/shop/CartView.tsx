"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { formatToman, toFa } from "@/lib/fa";
import { useCart } from "@/stores/cart";
import { Button } from "@/components/ui/button";

type Line = {
  id: string;
  slug: string;
  title: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  image: string | null;
};

function QtyStepper({ id, qty, stock }: { id: string; qty: number; stock: number }) {
  const setQty = useCart((s) => s.setQty);
  return (
    <div className="flex items-center rounded-lg border bg-white">
      <button
        className="px-3 py-1.5 text-lg"
        aria-label="کمتر"
        onClick={() => setQty(id, qty - 1)}
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm font-bold">{toFa(qty)}</span>
      <button
        className="px-3 py-1.5 text-lg disabled:opacity-40"
        aria-label="بیشتر"
        disabled={qty >= stock}
        onClick={() => setQty(id, qty + 1)}
      >
        ＋
      </button>
    </div>
  );
}

export function CartView() {
  const lines = useCart((s) => s.lines);
  const remove = useCart((s) => s.remove);
  const [detail, setDetail] = useState<Line[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (lines.length === 0) {
      setDetail([]);
      return;
    }
    fetch(`/api/cart?ids=${lines.map((l) => l.id).join(",")}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setDetail(j.data);
          setFailed(false);
        } else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, [lines]);

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center">
        <p className="font-bold">سبد خرید خالی است</p>
        <p className="mt-1 text-sm text-(--color-muted-fg)">هنوز چیزی انتخاب نکردی.</p>
        <Link href="/shop" className="mt-4 inline-block rounded-lg bg-(--color-brand) px-6 py-2 text-sm text-white">
          رفتن به فروشگاه
        </Link>
      </div>
    );
  }

  const items = lines
    .map((l) => ({ ...l, p: detail.find((d) => d.id === l.id) }))
    .filter((x) => x.p);
  const subtotal = items.reduce((n, x) => n + x.p!.price * x.qty, 0);
  const profit = items.reduce((n, x) => n + ((x.p!.oldPrice ?? x.p!.price) - x.p!.price) * x.qty, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {failed && (
          <p className="rounded-xl border bg-white p-3 text-sm text-(--color-wine)">
            دریافت اطلاعات سبد ناموفق بود؛ دوباره تلاش کن.
          </p>
        )}
        {items.map(({ p, qty }) => (
          <div key={p!.id} className="flex gap-3 rounded-2xl border bg-white p-3">
            <Link
              href={`/products/${p!.slug}`}
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-(--color-mist)"
            >
              {p!.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p!.image} alt={p!.title} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl">💍</span>
              )}
            </Link>
            <div className="flex flex-1 flex-col gap-1">
              <Link href={`/products/${p!.slug}`} className="text-sm font-bold">
                {p!.title}
              </Link>
              <p className="text-sm font-bold">{formatToman(p!.price * qty)}</p>
              {p!.stock === 0 && <p className="text-xs text-(--color-wine)">ناموجود شد</p>}
              <div className="mt-auto flex items-center justify-between">
                <QtyStepper id={p!.id} qty={qty} stock={Math.max(p!.stock, qty)} />
                <button
                  onClick={() => remove(p!.id)}
                  aria-label={`حذف ${p!.title}`}
                  className="flex items-center gap-1 text-xs text-(--color-wine)"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="h-fit space-y-3 rounded-2xl border bg-white p-4">
        <p className="font-bold">جزئیات پرداخت</p>
        <p className="text-xs leading-6 text-(--color-muted-fg)">
          مبلغ سفارش هنوز پرداخت نشده و در صورت اتمام موجودی، کالاها از سبد حذف می‌شوند.
        </p>
        <div className="space-y-1 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <span>مجموع قیمت کالاها ({toFa(items.length)} کالا)</span>
            <span>{formatToman(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>سود شما از خرید</span>
            <span>{formatToman(profit)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>مجموع سبد خرید</span>
            <span>{formatToman(subtotal)}</span>
          </div>
        </div>
        <Link href="/checkout/address" className="block rounded-lg bg-(--color-brand) py-2.5 text-center text-sm font-bold text-white">
          ثبت سفارش — {toFa(items.length)} کالا
        </Link>
        <Breadcrumb trail={[{ href: "/shop", label: "فروشگاه" }]} />
      </aside>
    </div>
  );
}

export function CartCta() {
  const lines = useCart((s) => s.lines);
  return (
    <Button asChild className="w-full" disabled={lines.length === 0}>
      <Link href="/checkout/address">ثبت سفارش</Link>
    </Button>
  );
}
