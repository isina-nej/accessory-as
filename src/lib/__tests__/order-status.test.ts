import { describe, expect, it } from "vitest";
import { canTransitionOrderStatus, orderStatusLabel, productStatusLabel } from "../order-status";

describe("order status rules", () => {
  it("allows only forward operational transitions", () => {
    expect(canTransitionOrderStatus("pending", "paid")).toBe(true);
    expect(canTransitionOrderStatus("paid", "preparing")).toBe(true);
    expect(canTransitionOrderStatus("preparing", "shipped")).toBe(true);
    expect(canTransitionOrderStatus("shipped", "delivered")).toBe(true);
  });

  it("rejects repeated, backward, and unknown transitions", () => {
    expect(canTransitionOrderStatus("pending", "pending")).toBe(false);
    expect(canTransitionOrderStatus("delivered", "preparing")).toBe(false);
    expect(canTransitionOrderStatus("unknown", "paid")).toBe(false);
  });

  it("keeps display labels separate from internal values", () => {
    expect(orderStatusLabel("pending")).toBe("در انتظار پرداخت");
    expect(orderStatusLabel("unknown")).toBe("وضعیت نامشخص");
    expect(productStatusLabel("draft")).toBe("پیش‌نویس");
  });
});
