import { describe, expect, it } from "vitest";
import {
  calcTotals,
  couponDiscount,
  isMobileOrEmail,
  isValidEmail,
  isValidMobile,
  shippingFee,
  type CouponLike,
} from "../checkout";

const coupon = (p: Partial<CouponLike> = {}): CouponLike => ({
  code: "GH632LO",
  pct: 20,
  maxToman: 2_000_000,
  minToman: 1_000_000,
  active: true,
  expiresAt: null,
  ...p,
});

describe("validators", () => {
  it("mobile", () => {
    expect(isValidMobile("09198423811")).toBe(true);
    expect(isValidMobile("0919842381")).toBe(false);
    expect(isValidMobile(" 09198423811 ")).toBe(true);
  });
  it("email", () => {
    expect(isValidEmail("maleki.uix@gmail.com")).toBe(true);
    expect(isValidEmail("nope")).toBe(false);
  });
  it("either", () => {
    expect(isMobileOrEmail("09198423811")).toBe(true);
    expect(isMobileOrEmail("a@b.co")).toBe(true);
    expect(isMobileOrEmail("xyz")).toBe(false);
  });
});

describe("coupon", () => {
  it("20% with cap", () => {
    expect(couponDiscount(4_250_000, coupon())).toEqual({ ok: true, discount: 850_000 });
    expect(couponDiscount(20_000_000, coupon())).toEqual({ ok: true, discount: 2_000_000 });
  });
  it("min not met", () => {
    expect(couponDiscount(500_000, coupon()).ok).toBe(false);
  });
  it("inactive/expired", () => {
    expect(couponDiscount(5_000_000, coupon({ active: false })).ok).toBe(false);
    expect(couponDiscount(5_000_000, coupon({ expiresAt: new Date(2000, 1, 1) })).ok).toBe(false);
  });
});

describe("shipping+totals", () => {
  it("free over threshold", () => {
    expect(shippingFee({ slug: "post", feeToman: 150_000, freeOverToman: 500_000 }, 4_250_000)).toBe(0);
    expect(shippingFee({ slug: "post", feeToman: 150_000, freeOverToman: 500_000 }, 280_000)).toBe(150_000);
  });
  it("totals", () => {
    expect(calcTotals({ subtotal: 4_250_000, discount: 850_000, shipping: 0 })).toEqual({
      subtotal: 4_250_000,
      discount: 850_000,
      shipping: 0,
      payable: 3_400_000,
    });
  });
});
