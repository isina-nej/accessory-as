import Link from "next/link";
import { formatToman, toFa } from "@/lib/fa";
import { ORDER_STATUS_FA, orderCode } from "@/lib/order-status";

export type OrderRow = {
  id: string;
  status: string;
  totalToman: number;
  createdAt: Date;
};

export function OrderCard({ o }: { o: OrderRow }) {
  let date = "";
  try {
    date = toFa(new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(o.createdAt));
  } catch {
    date = "";
  }
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-(--color-mist) px-3 py-1 text-xs font-bold">
          {ORDER_STATUS_FA[o.status] ?? o.status}
        </span>
        <Link href={`/account/orders/${o.id}`} className="text-sm text-(--color-brand)">
          جزئیات سفارش
        </Link>
      </div>
      <p className="mt-2 text-sm">کد سفارش: {toFa(orderCode(o.id))}</p>
      <p className="text-xs text-(--color-muted-fg)">{date}</p>
      <p className="mt-1 text-sm">
        هزینه: <span className="font-bold">{formatToman(o.totalToman)}</span>
      </p>
    </div>
  );
}
