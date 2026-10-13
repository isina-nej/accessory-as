import { describe, expect, it } from "vitest";
import { ADMIN_PERMISSION_FA, ADMIN_ROLE_PERMISSIONS, STAFF_ROLES, hasStaffPermission } from "../roles";

describe("admin permission matrix", () => {
  it("gives admins every defined permission", () => {
    expect(hasStaffPermission(["admin"], "users.roles")).toBe(true);
    expect(hasStaffPermission(["admin"], "marketing.write")).toBe(true);
    for (const permission of Object.keys(ADMIN_PERMISSION_FA)) {
      expect(hasStaffPermission(["admin"], permission as keyof typeof ADMIN_PERMISSION_FA)).toBe(true);
    }
  });

  it("has a Persian label for every permission and role", () => {
    for (const role of STAFF_ROLES) expect(ADMIN_ROLE_PERMISSIONS[role].length).toBeGreaterThan(0);
    for (const label of Object.values(ADMIN_PERMISSION_FA)) expect(label).toMatch(/[؀-ۿ]/);
  });

  it("limits content staff to catalog and content work", () => {
    expect(hasStaffPermission(["content"], "products.write")).toBe(true);
    expect(hasStaffPermission(["content"], "content.write")).toBe(true);
    expect(hasStaffPermission(["content"], "attributes.write")).toBe(true);
    expect(hasStaffPermission(["content"], "orders.status")).toBe(false);
    expect(hasStaffPermission(["content"], "users.roles")).toBe(false);
  });

  it("limits support staff to operations and moderation", () => {
    expect(hasStaffPermission(["support"], "orders.read")).toBe(true);
    expect(hasStaffPermission(["support"], "messages.manage")).toBe(true);
    expect(hasStaffPermission(["support"], "refunds.read")).toBe(true);
    expect(hasStaffPermission(["support"], "refunds.write")).toBe(true);
    expect(hasStaffPermission(["support"], "products.write")).toBe(false);
    expect(hasStaffPermission(["support"], "marketing.write")).toBe(false);
    expect(hasStaffPermission(["support"], "attributes.write")).toBe(false);
  });

  it("keeps refund writes out of the read-only surface", () => {
    expect(hasStaffPermission([], "refunds.write")).toBe(false);
    expect(hasStaffPermission(["content"], "refunds.read")).toBe(false);
  });

  it("supports combined roles without elevating them to admin", () => {
    expect(hasStaffPermission(["content", "support"], "products.write")).toBe(true);
    expect(hasStaffPermission(["content", "support"], "orders.status")).toBe(true);
    expect(hasStaffPermission(["content", "support"], "users.roles")).toBe(false);
  });
});
