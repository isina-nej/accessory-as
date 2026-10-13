import { describe, expect, it } from "vitest";
import { canTransitionRefundStatus, REFUND_STATUSES } from "../admin-labels";

describe("refund status transitions", () => {
  it.each([
    ["pending", "approved"],
    ["pending", "rejected"],
    ["approved", "paid"],
    ["approved", "rejected"],
    ["paid", "completed"],
  ])("allows %s to %s", (from, to) => {
    expect(canTransitionRefundStatus(from, to)).toBe(true);
  });

  it("never reopens settled or rejected requests", () => {
    for (const from of ["paid", "completed", "rejected"]) {
      for (const to of ["pending", "approved", "rejected", "paid"]) {
        expect(canTransitionRefundStatus(from, to)).toBe(false);
      }
    }
  });

  it("requires approval and payment before completion", () => {
    expect(canTransitionRefundStatus("pending", "paid")).toBe(false);
    expect(canTransitionRefundStatus("pending", "completed")).toBe(false);
    expect(canTransitionRefundStatus("approved", "completed")).toBe(false);
  });

  it("rejects repeats and unknown states", () => {
    for (const status of REFUND_STATUSES) {
      expect(canTransitionRefundStatus(status, status)).toBe(false);
      expect(canTransitionRefundStatus(status, "unknown")).toBe(false);
    }
    expect(canTransitionRefundStatus("unknown", "approved")).toBe(false);
    expect(canTransitionRefundStatus("constructor", "approved")).toBe(false);
  });
});
