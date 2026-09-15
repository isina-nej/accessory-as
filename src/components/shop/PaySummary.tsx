import Link from "next/link";
import { formatToman, toFa } from "@/lib/fa";

export function PaySummary({
  count,
  subtotal,
  profit,
  discount = 0,
  shipping = 0,
  total,
  ctaHref,
  ctaLabel,
}: {
  count: number;
  subtotal: number;
  profit: number;
  discount?: number;
  shipping?: number;
  total: number;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <aside className="h-fit space-y-3 rounded-2xl border bg-white p-4">
      <p className="font-bold">جزئیات پرداخت</p>
      <p className="text-xs leading-6 text-(--color-muted-fg)">
        مبلغ سفارش هنوز پرداخت نشده و در صورت اتمام موجودی، کالاها از سبد حذف می‌شوند.
      </p>
      <div className="space-y-1 border-t pt-3 text-sm">
        <div className="flex justify-between">
          <span>مجموع قیمت کالاها ({toFa(count)} کالا)</span>
          <span>{formatToman(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>سود شما از خرید</span>
          <span>{formatToman(profit)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-(--color-brand)">
            <span>تخفیف کد</span>
            <span>−{formatToman(discount)}</span>
          </div>
        )}
        {shipping > 0 && (
          <div className="flex justify-between">
            <span>هزینه ارسال</span>
            <span>{formatToman(shipping)}</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-2 font-bold">
          <span>مجموع سبد خرید</span>
          <span>{formatToman(total)}</span>
        </div>
      </div>
      <Link
        href={ctaHref}
        className="block rounded-lg bg-(--color-brand) py-2.5 text-center text-sm font-bold text-white"
      >
        {ctaLabel}
      </Link>
    </aside>
  );
}
