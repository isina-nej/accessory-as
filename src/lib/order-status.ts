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
