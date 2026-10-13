import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const reads: unknown[][] = [];
  const select = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    for: vi.fn(async () => reads.shift() ?? []),
  };
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const deleteWhere = vi.fn().mockResolvedValue(undefined);
  const values = vi.fn().mockResolvedValue(undefined);
  const tx = {
    select: vi.fn(() => select),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: updateWhere })) })),
    delete: vi.fn(() => ({ where: deleteWhere })),
    insert: vi.fn(() => ({ values })),
  };
  return {
    reads,
    select,
    tx,
    updateWhere,
    deleteWhere,
    values,
    transaction: vi.fn(async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)),
    permission: vi.fn(),
    revalidatePath: vi.fn(),
  };
});

vi.mock("@/db", () => ({ db: { transaction: mocks.transaction } }));
vi.mock("@/db/schema", () => import("../../db/schema"));
vi.mock("@/lib/admin-labels", () => import("../admin-labels"));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("../../server/staff", async () => ({
  ...(await import("../roles")),
  requirePermission: mocks.permission,
}));

import { saveCoupon } from "../../server/admin-content";
import { revokeRole, setRefundStatus } from "../../server/admin-users";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.reads.length = 0;
  mocks.permission.mockResolvedValue({ ok: true, userId: "admin-id", roles: ["admin"] });
});

describe("role revocation", () => {
  it.each(["content", "support"] as const)("revokes %s even when there is only one admin", async (role) => {
    expect(await revokeRole("staff-id", role)).toEqual({ ok: true, data: null });
    expect(mocks.permission).toHaveBeenCalledWith("users.roles");
    expect(mocks.tx.select).not.toHaveBeenCalled();
    expect(mocks.tx.delete).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/users/staff-id");
  });

  it("preserves the last admin under a row lock", async () => {
    mocks.reads.push([{ userId: "admin-id" }]);
    expect(await revokeRole("admin-id", "admin")).toEqual({ ok: false, error: "آخرین ادمین را نمی‌شود حذف کرد" });
    expect(mocks.select.for).toHaveBeenCalledWith("update");
    expect(mocks.tx.delete).not.toHaveBeenCalled();
  });

  it("allows removing one of multiple admins", async () => {
    mocks.reads.push([{ userId: "admin-id" }, { userId: "other-admin" }]);
    expect(await revokeRole("other-admin", "admin")).toEqual({ ok: true, data: null });
    expect(mocks.tx.delete).toHaveBeenCalledOnce();
  });

  it("rejects unauthorized callers before touching the database", async () => {
    mocks.permission.mockResolvedValue({ ok: false, error: "دسترسی نداری" });
    expect(await revokeRole("staff-id", "support")).toEqual({ ok: false, error: "دسترسی نداری" });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});

describe("refund mutations", () => {
  it("locks and updates an allowed transition and refreshes the customer detail", async () => {
    mocks.reads.push([{ userId: "customer-id", status: "approved" }]);
    expect(await setRefundStatus("refund-id", "paid")).toEqual({ ok: true, data: null });
    expect(mocks.permission).toHaveBeenCalledWith("refunds.write");
    expect(mocks.select.for).toHaveBeenCalledWith("update");
    expect(mocks.tx.update).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/users/customer-id");
  });

  it.each(["paid", "completed"])("never reopens a %s refund", async (status) => {
    mocks.reads.push([{ userId: "customer-id", status }]);
    expect(await setRefundStatus("refund-id", "pending")).toEqual({ ok: false, error: "تغییر وضعیت بازپرداخت مجاز نیست" });
    expect(mocks.tx.update).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects direct settlement of an unapproved refund", async () => {
    mocks.reads.push([{ userId: "customer-id", status: "pending" }]);
    expect(await setRefundStatus("refund-id", "completed")).toEqual({ ok: false, error: "تغییر وضعیت بازپرداخت مجاز نیست" });
    expect(mocks.tx.update).not.toHaveBeenCalled();
  });

  it("reports a missing refund instead of false success", async () => {
    expect(await setRefundStatus("missing-id", "approved")).toEqual({ ok: false, error: "درخواست بازپرداخت پیدا نشد" });
    expect(mocks.tx.update).not.toHaveBeenCalled();
  });

  it("rejects invalid states before opening a transaction", async () => {
    expect(await setRefundStatus("refund-id", "unknown")).toEqual({ ok: false, error: "وضعیت بازپرداخت نامعتبر است" });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects unauthorized callers before touching the database", async () => {
    mocks.permission.mockResolvedValue({ ok: false, error: "دسترسی نداری" });
    expect(await setRefundStatus("refund-id", "approved")).toEqual({ ok: false, error: "دسترسی نداری" });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});

describe("coupon mutations", () => {
  it("accepts a minimum basket larger than the discount cap", async () => {
    const result = await saveCoupon(null, { code: "capped", pct: 20, minToman: 1_000_000, maxToman: 100_000, active: true });
    expect(result).toMatchObject({ ok: true });
    expect(mocks.permission).toHaveBeenCalledWith("marketing.write");
    expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({ code: "CAPPED", minToman: 1_000_000, maxToman: 100_000 }));
  });
});
