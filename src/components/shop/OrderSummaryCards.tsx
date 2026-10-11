import { toFa } from "@/lib/fa";
import { cn } from "@/lib/cn";
import {
  DEFAULT_SUMMARY_DATA,
  type OrderCardType,
  type OrderSummaryItem,
} from "@/lib/order-summary";

export type { OrderCardType, OrderSummaryItem };
export { DEFAULT_SUMMARY_DATA };

export interface OrderSummaryCardsProps {
  activeCount?: number;
  deliveredCount?: number;
  refundedCount?: number;
  className?: string;
}

export function OrderStatCard({
  item,
  className,
}: {
  item: OrderSummaryItem;
  className?: string;
}) {
  return (
    <article
      aria-label={`${item.subtitle}: ${toFa(item.count)} ${item.title}`}
      className={cn(
        "relative flex flex-col justify-start overflow-hidden rounded-[10px] border border-[#D6DBDE] bg-white p-6 text-right select-none transition-shadow hover:shadow-xs",
        item.heightClass,
        className,
      )}
    >
      {/* پس‌زمینه با گرید دقیق و تابش ملایم */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.bgSrc}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* تصویر سه‌بعدی تزئینی اصلی فیگما در گوشه پایین-چپ */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.illustrationSrc}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute max-w-none select-none"
        style={item.illStyle}
        draggable={false}
      />

      {/* محتوای متنی و تعداد پویا در بالا-راست */}
      <div className="relative z-10 flex flex-col items-start gap-2 text-right">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[40px] font-bold leading-none"
            style={{ color: item.accentColor }}
          >
            {toFa(item.count)}
          </span>
          <span className="text-[20px] font-extrabold leading-none text-[#161B22]">
            {item.title}
          </span>
        </div>
        <p className="text-sm font-bold leading-6 text-[#4B5563]">
          {item.subtitle}
        </p>
      </div>
    </article>
  );
}

export function OrderSummaryCards({
  activeCount,
  deliveredCount,
  refundedCount,
  className,
}: OrderSummaryCardsProps) {
  const items = DEFAULT_SUMMARY_DATA({
    active: activeCount,
    delivered: deliveredCount,
    refunded: refundedCount,
  });

  return (
    <div className={cn("@container w-full", className)}>
      <div className="grid w-full grid-cols-1 gap-4 @[580px]:grid-cols-2 @[840px]:grid-cols-3">
        {items.map((item) => (
          <OrderStatCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
