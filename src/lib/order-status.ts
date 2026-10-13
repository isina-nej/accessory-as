export const ORDER_STATUS_FA: Record<string, string> = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت شده",
  preparing: "در حال آماده‌سازی",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  failed: "ناموفق",
  cancelled: "لغو شده",
  refunded: "مرجوع شده",
};

export const ORDER_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  pending: ["paid", "failed", "cancelled"],
  paid: ["preparing", "cancelled", "refunded"],
  preparing: ["shipped", "cancelled", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  failed: ["pending", "cancelled"],
  cancelled: [],
  refunded: [],
};

export function canTransitionOrderStatus(from: string, to: string): boolean {
  return from !== to && ORDER_STATUS_TRANSITIONS[from]?.includes(to) === true;
}

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_FA[status] ?? "وضعیت نامشخص";
}

export const PRODUCT_STATUS_FA: Record<string, string> = {
  active: "فعال",
  draft: "پیش‌نویس",
  archived: "بایگانی‌شده",
};

export function productStatusLabel(status: string): string {
  return PRODUCT_STATUS_FA[status] ?? "وضعیت نامشخص";
}

// کد نمایشی سفارش از id (فیگما: ۶۸۷۹۱)
export function orderCode(id: string): string {
  const h = id.replace(/-/g, "");
  let n = 0;
  for (const c of h) n = (n * 31 + c.charCodeAt(0)) % 100000;
  return String(10000 + (n % 90000));
}

export function isActiveOrder(s: string): boolean {
  return s === "pending" || s === "paid" || s === "preparing" || s === "shipped";
}
