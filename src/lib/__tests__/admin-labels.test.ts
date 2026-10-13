import { describe, expect, it } from "vitest";
import { bannerSlotLabel, faDate, faDateTime, paymentProviderLabel, paymentStatusLabel, refundStatusLabel, shortId } from "../admin-labels";

const FA_DIGITS = /[۰-۹]/;

describe("admin labels", () => {
  it("keeps Persian labels for internal payment/refund values", () => {
    expect(paymentStatusLabel("verified")).toBe("تأییدشده");
    expect(paymentStatusLabel("unknown")).toBe("وضعیت نامشخص");
    expect(paymentProviderLabel("zarinpal")).toBe("زرین‌پال");
    expect(refundStatusLabel("pending")).toBe("در انتظار بررسی");
    expect(bannerSlotLabel("hero")).toBe("هیرو");
  });

  it("formats dates and times with Persian digits", () => {
    expect(faDateTime(new Date("2026-10-13T14:05:00"))).toMatch(FA_DIGITS);
    expect(faDate(new Date("2026-10-13"))).toMatch(FA_DIGITS);
    expect(faDate("2026-10-13")).toMatch(FA_DIGITS);
  });

  it("returns a placeholder for missing or invalid dates", () => {
    expect(faDate(null)).toBe("—");
    expect(faDate("نامعتبر")).toBe("—");
    expect(faDateTime(undefined)).toBe("—");
  });

  it("truncates technical ids for display", () => {
    expect(shortId("abcdef12-3456")).toBe("abcdef12");
  });
});