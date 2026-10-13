// برچسب‌های فارسی برای مقادیر داخلی پنل؛ مقدار enum و مقدار نمایشی جدا می‌مانند.

export const ORDER_STATUSES = ["pending", "paid", "preparing", "shipped", "delivered", "failed", "cancelled", "refunded"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUS_FA: Record<string, string> = {
  initiated: "آغازشده",
  pending: "در انتظار",
  paid: "پرداخت شده",
  failed: "ناموفق",
  verified: "تأییدشده",
  cancelled: "لغو شده",
};

export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_FA[status] ?? "وضعیت نامشخص";
}

export const PAYMENT_PROVIDER_FA: Record<string, string> = {
  zarinpal: "زرین‌پال",
  zibal: "زیبال",
};

export function paymentProviderLabel(provider: string): string {
  return PAYMENT_PROVIDER_FA[provider] ?? provider;
}

export const REFUND_STATUS_FA: Record<string, string> = {
  pending: "در انتظار بررسی",
  approved: "تأییدشده",
  rejected: "ردشده",
  paid: "پرداخت‌شده",
  completed: "تکمیل‌شده",
};

export const REFUND_STATUSES = ["pending", "approved", "rejected", "paid", "completed"] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

const REFUND_STATUS_TRANSITIONS: Record<RefundStatus, readonly RefundStatus[]> = {
  pending: ["approved", "rejected"],
  approved: ["paid", "rejected"],
  rejected: [],
  paid: ["completed"],
  completed: [],
};

export function canTransitionRefundStatus(from: string, to: string): boolean {
  if (!(REFUND_STATUSES as readonly string[]).includes(from)) return false;
  return REFUND_STATUS_TRANSITIONS[from as RefundStatus].some((status) => status === to);
}

export function refundStatusLabel(status: string): string {
  return REFUND_STATUS_FA[status] ?? "وضعیت نامشخص";
}

export const BANNER_SLOTS = ["hero", "offer-side", "mid-a", "mid-b", "shine"] as const;
export type BannerSlot = (typeof BANNER_SLOTS)[number];

export const BANNER_SLOT_FA: Record<BannerSlot, string> = {
  hero: "هیرو",
  "offer-side": "کنار پیشنهاد ویژه",
  "mid-a": "میانی الف",
  "mid-b": "میانی ب",
  shine: "درخشش",
};

export function bannerSlotLabel(slot: string): string {
  return BANNER_SLOT_FA[slot as BannerSlot] ?? slot;
}

export const SETTINGS_KEYS: { key: string; label: string; big?: boolean }[] = [
  { key: "site_title", label: "تیتر سایت" },
  { key: "site_desc", label: "توضیح سئو" },
  { key: "hero_title", label: "تیتر هیرو" },
  { key: "hero_sub", label: "زیرتیتر هیرو" },
  { key: "cat_title", label: "تیتر دسته‌ها" },
  { key: "cat_sub", label: "زیرتیتر دسته‌ها" },
  { key: "offer_title", label: "تیتر پیشنهاد" },
  { key: "new_title", label: "تیتر محصولات جدید" },
  { key: "shine_title", label: "تیتر بنر درخشش" },
  { key: "shine_sub", label: "زیرتیتر درخشش" },
  { key: "footer_seo_title", label: "تیتر سئو فوتر" },
  { key: "footer_address", label: "آدرس فوتر" },
  { key: "footer_phones", label: "تلفن‌های فوتر" },
  { key: "footer_seo_body", label: "متن سئو فوتر", big: true },
];

// ارقام لاتین در پنل فقط برای شناسه‌های فنی مجاز است (UUID، authority، refId)
export function shortId(id: string): string {
  return id.slice(0, 8);
}

export function faDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const g = (n: number) => String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
  return `${g(date.getFullYear())}/${g(date.getMonth() + 1)}/${g(date.getDate())} ${g(date.getHours())}:${g(date.getMinutes())}`;
}

export function faDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const g = (n: number) => String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
  return `${g(date.getFullYear())}/${g(date.getMonth() + 1)}/${g(date.getDate())}`;
}