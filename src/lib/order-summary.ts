export type OrderCardType = "active" | "delivered" | "refunded";

export interface OrderSummaryItem {
  id: string;
  type: OrderCardType;
  count: number;
  title: string;
  subtitle: string;
  accentColor: string;
  illustrationSrc: string;
  bgSrc: string;
  heightClass: string;
  illStyle: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
}

export const DEFAULT_SUMMARY_DATA = (counts: {
  active?: number;
  delivered?: number;
  refunded?: number;
}): OrderSummaryItem[] => [
  {
    id: "active",
    type: "active",
    count: counts.active ?? 6,
    title: "سفارش",
    subtitle: "سفارش های فعال",
    accentColor: "#0A5A55",
    illustrationSrc: "/images/dashboard/card-active-illustration.png",
    bgSrc: "/images/dashboard/card-bg-active.svg",
    heightClass: "min-h-[208px] lg:h-[208px]",
    illStyle: {
      top: "48px",
      left: "-50px",
      width: "302px",
      height: "221px",
    },
  },
  {
    id: "delivered",
    type: "delivered",
    count: counts.delivered ?? 3,
    title: "سفارش",
    subtitle: "سفارش های تحویل داده شده",
    accentColor: "#1889F2",
    illustrationSrc: "/images/dashboard/card-delivered-illustration.png",
    bgSrc: "/images/dashboard/card-bg-delivered.svg",
    heightClass: "min-h-[207px] lg:h-[207px]",
    illStyle: {
      top: "49px",
      left: "-53px",
      width: "320px",
      height: "236px",
    },
  },
  {
    id: "refunded",
    type: "refunded",
    count: counts.refunded ?? 2,
    title: "سفارش",
    subtitle: "سفارش های مرجوع شده",
    accentColor: "#9F1239",
    illustrationSrc: "/images/dashboard/card-refunded-illustration.png",
    bgSrc: "/images/dashboard/card-bg-refunded.svg",
    heightClass: "min-h-[207px] lg:h-[207px]",
    illStyle: {
      top: "57px",
      left: "-44px",
      width: "292px",
      height: "230px",
    },
  },
];
