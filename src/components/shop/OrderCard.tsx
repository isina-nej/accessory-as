import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { toFa } from "@/lib/fa";
import { orderCode } from "@/lib/order-status";

export type OrderItemSnippet = {
  id: string;
  productId: string;
  title: string;
  slug: string;
  image: string;
  qty: number;
  unitToman: number;
};

export type OrderRow = {
  id: string;
  status: string;
  totalToman: number;
  createdAt: Date;
  items?: OrderItemSnippet[];
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "درحال انجـام شـدن", color: "#0A5A55", icon: "icons-20--delivery-process" },
  paid: { label: "درحال انجـام شـدن", color: "#0A5A55", icon: "icons-20--delivery-process" },
  preparing: { label: "درحال انجـام شـدن", color: "#0A5A55", icon: "icons-20--delivery-process" },
  shipped: { label: "تحویل داده شـده", color: "#1889F2", icon: "icons-20--delivery" },
  delivered: { label: "تحویل داده شـده", color: "#1889F2", icon: "icons-20--delivery" },
  refunded: { label: "مرجـوع شـده", color: "#9F1239", icon: "icons-20--repeat" },
  cancelled: { label: "مرجـوع شـده", color: "#9F1239", icon: "icons-20--repeat" },
};

const DEFAULT_STATUS = { label: "درحال انجـام شـدن", color: "#0A5A55", icon: "icons-20--delivery-process" };

export function OrderCard({ o }: { o: OrderRow }) {
  let date = "";
  try {
    date = toFa(new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(o.createdAt));
  } catch {
    date = "";
  }

  const cfg = STATUS_CONFIG[o.status] ?? DEFAULT_STATUS;
  const displayItems = (o.items && o.items.length > 0)
    ? o.items.slice(0, 3)
    : [
        { id: "1", title: "کالا ۱", image: "/images/product-01.webp" },
        { id: "2", title: "کالا ۲", image: "/images/product-02.webp" },
        { id: "3", title: "کالا ۳", image: "/images/product-03.webp" },
      ];

  return (
    <div className="relative flex min-h-[230px] w-full flex-col justify-between overflow-hidden rounded-[10px] border border-[#D6DBDE] bg-white p-4 pb-0 text-right">
      {/* ردیف بالا: وضعیت در راست + جزئیات سفارش در چپ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: cfg.color }}>
          <span className="text-sm font-extrabold">{cfg.label}</span>
          <Icon name={cfg.icon} className="h-5 w-5" alt="" />
        </div>
        <Link
          href={`/account/orders/${o.id}`}
          className="flex items-center gap-1 text-sm font-bold text-[#4B5563] transition-colors hover:text-[#0A5A55]"
        >
          <span>جزئیات سفارش</span>
          <Icon name="icons-20--direction-left" className="h-5 w-5" alt="" />
        </Link>
      </div>

      {/* تصاویر محصولات سفارش */}
      <div className="flex items-center gap-3 py-3 overflow-x-auto">
        {displayItems.map((item, idx) => (
          <div
            key={idx}
            className="flex h-[102px] w-[102px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#D6DBDE] bg-white p-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.image} alt={item.title} className="h-full w-full object-contain" />
          </div>
        ))}
      </div>

      {/* نوار پایین داک‌شده در کارت */}
      <div className="-mx-4 flex h-[49px] items-center justify-between border-t border-[#D6DBDE] bg-[#F8FAF9] px-6 text-sm">
        <div className="flex items-center gap-6 text-[#4B5563]">
          <span className="font-bold">کد سفارش: {toFa(orderCode(o.id))}</span>
          <span className="font-bold">{date}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-[#4B5563]">مبلغ:</span>
          <span className="text-base font-bold text-[#161B22]">{toFa(o.totalToman.toLocaleString("en-US"))}</span>
          <span className="text-xs font-medium text-[#161B22]">تومان</span>
        </div>
      </div>
    </div>
  );
}
