import { describe, it, expect } from "vitest";
import { DEFAULT_SUMMARY_DATA } from "../order-summary";
import { toFa } from "../fa";

describe("OrderSummaryCards data mapping", () => {
  it("uses default values (6, 3, 2) when counts are undefined", () => {
    const items = DEFAULT_SUMMARY_DATA({});
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({ id: "active", count: 6, accentColor: "#0A5A55" });
    expect(items[1]).toMatchObject({ id: "delivered", count: 3, accentColor: "#1889F2" });
    expect(items[2]).toMatchObject({ id: "refunded", count: 2, accentColor: "#9F1239" });
  });

  it("accurately handles 0 as a valid count", () => {
    const items = DEFAULT_SUMMARY_DATA({ active: 0, delivered: 0, refunded: 0 });
    expect(items[0].count).toBe(0);
    expect(items[1].count).toBe(0);
    expect(items[2].count).toBe(0);
    expect(toFa(items[0].count)).toBe("۰");
    expect(toFa(items[1].count)).toBe("۰");
    expect(toFa(items[2].count)).toBe("۰");
  });

  it("handles multi-digit counts (12, 123, 12345) and converts to Persian digits", () => {
    const items = DEFAULT_SUMMARY_DATA({ active: 12, delivered: 123, refunded: 12345 });
    expect(toFa(items[0].count)).toBe("۱۲");
    expect(toFa(items[1].count)).toBe("۱۲۳");
    expect(toFa(items[2].count)).toBe("۱۲۳۴۵");
  });

  it("preserves correct RTL card types, titles and subtitles", () => {
    const items = DEFAULT_SUMMARY_DATA({});
    expect(items[0].subtitle).toBe("سفارش های فعال");
    expect(items[1].subtitle).toBe("سفارش های تحویل داده شده");
    expect(items[2].subtitle).toBe("سفارش های مرجوع شده");
    expect(items[0].title).toBe("سفارش");
  });
});
