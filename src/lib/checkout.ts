// منطق خالص چک‌اوت/کوپن/اعتبارسنجی — بدون DB، قابل تست.

export const IR_MOBILE_RE = /^09\d{9}$/;
export const POSTAL_RE = /^\d{10}$/;
export const IBAN_RE = /^IR\d{24}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidMobile(v: string): boolean {
  return IR_MOBILE_RE.test(v.trim());
}

export function isValidEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim());
}

export function isMobileOrEmail(v: string): boolean {
  const t = v.trim();
  return isValidMobile(t) || isValidEmail(t);
}

export function isPhoneAccount(id: string): boolean {
  return isValidMobile(id);
}

export type CouponLike = {
  code: string;
  pct: number;
  maxToman: number | null;
  minToman: number | null;
  active: boolean;
  expiresAt: Date | null;
};

export function couponDiscount(
  subtotal: number,
  c: CouponLike,
  now = new Date(),
): { ok: true; discount: number } | { ok: false; error: string } {
  if (!c.active) return { ok: false, error: "این کد تخفیف فعال نیست" };
  if (c.expiresAt && c.expiresAt.getTime() < now.getTime())
    return { ok: false, error: "مهلت این کد تخفیف تمام شده" };
  if (c.minToman && subtotal < c.minToman)
    return { ok: false, error: "مبلغ سبد به حداقل این کد تخفیف نرسیده" };
  let d = Math.floor((subtotal * c.pct) / 100);
  if (c.maxToman != null) d = Math.min(d, c.maxToman);
  return { ok: true, discount: Math.max(0, d) };
}

export type ShippingLike = {
  slug: string;
  feeToman: number;
  freeOverToman: number | null;
};

export function shippingFee(m: ShippingLike | null, afterDiscount: number): number {
  if (!m) return 0;
  if (m.freeOverToman != null && afterDiscount >= m.freeOverToman) return 0;
  return m.feeToman;
}

export type Totals = {
  subtotal: number;
  discount: number;
  shipping: number;
  payable: number;
};

export function calcTotals(args: {
  subtotal: number;
  discount?: number;
  shipping?: number;
}): Totals {
  const subtotal = Math.max(0, args.subtotal);
  const discount = Math.min(subtotal, Math.max(0, args.discount ?? 0));
  const shipping = Math.max(0, args.shipping ?? 0);
  return { subtotal, discount, shipping, payable: subtotal - discount + shipping };
}
