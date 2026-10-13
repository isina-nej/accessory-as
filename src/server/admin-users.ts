"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { addresses, favorites, orderItems, orders, payments, products, staffRoles, user, walletRefunds } from "@/db/schema";
import { canTransitionRefundStatus, REFUND_STATUSES } from "@/lib/admin-labels";
import type { ActionRes } from "../lib/address-actions";
import { ROLE_FA, STAFF_ROLES, requirePermission } from "./staff";
import type { StaffRole } from "@/lib/roles";

const PAGE_SIZE = 20;
const roleSchema = z.object({ role: z.enum(["admin", "content", "support"]) });

export async function listAdminUsers(q: string, page: number) {
  const gate = await requirePermission("users.read");
  const safePage = Math.max(1, Math.floor(page || 1));
  if (!gate.ok) return { items: [], total: 0, page: safePage, pageSize: PAGE_SIZE };
  const needle = q.trim();
  const where = needle ? or(like(user.email, `%${needle}%`), like(user.name, `%${needle}%`), like(user.phoneNumber, `%${needle}%`)) : undefined;
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(user).where(where);
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      phoneNumberVerified: user.phoneNumberVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(where)
    .orderBy(desc(user.createdAt))
    .limit(PAGE_SIZE)
    .offset((safePage - 1) * PAGE_SIZE);
  const roles = rows.length ? await db.select().from(staffRoles).where(inArray(staffRoles.userId, rows.map((row) => row.id))) : [];
  const byUser = new Map<string, StaffRole[]>();
  for (const r of roles) {
    const arr = byUser.get(r.userId) ?? [];
    if ((STAFF_ROLES as string[]).includes(r.role)) arr.push(r.role as StaffRole);
    byUser.set(r.userId, arr);
  }
  return {
    items: rows.map((u) => ({ ...u, roles: byUser.get(u.id) ?? [] })),
    total: Number(n),
    page: safePage,
    pageSize: PAGE_SIZE,
  };
}

export async function getAdminCustomer(id: string) {
  const gate = await requirePermission("users.read");
  if (!gate.ok) return null;
  const [customer] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
      phoneNumberVerified: user.phoneNumberVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);
  if (!customer) return null;

  const [customerAddresses, customerOrders, customerFavorites, customerRoles, customerRefunds] = await Promise.all([
    db.select().from(addresses).where(eq(addresses.userId, id)).orderBy(desc(addresses.createdAt)).limit(50),
    db.select().from(orders).where(eq(orders.userId, id)).orderBy(desc(orders.createdAt)).limit(20),
    db
      .select({ productId: favorites.productId, createdAt: favorites.createdAt, title: products.title, slug: products.slug, status: products.status })
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, id))
      .orderBy(desc(favorites.createdAt))
      .limit(50),
    db.select({ role: staffRoles.role }).from(staffRoles).where(eq(staffRoles.userId, id)),
    db
      .select({ id: walletRefunds.id, iban: walletRefunds.iban, status: walletRefunds.status, createdAt: walletRefunds.createdAt })
      .from(walletRefunds)
      .where(eq(walletRefunds.userId, id))
      .orderBy(desc(walletRefunds.createdAt))
      .limit(20),
  ]);

  const orderIds = customerOrders.map((order) => order.id);
  const [paymentRows, itemRows] = orderIds.length
    ? await Promise.all([
        db
          .select({ orderId: payments.orderId, provider: payments.provider, status: payments.status, refId: payments.refId, amountRial: payments.amountRial, verifiedAt: payments.verifiedAt })
          .from(payments)
          .where(inArray(payments.orderId, orderIds)),
        db
          .select({ orderId: orderItems.orderId, productId: orderItems.productId, title: products.title, quantity: orderItems.qty, unitToman: orderItems.unitToman })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(inArray(orderItems.orderId, orderIds)),
      ])
    : [[], []];
  const paymentsByOrder = new Map(paymentRows.map((payment) => [payment.orderId, payment]));
  const itemsByOrder = new Map<string, typeof itemRows>();
  for (const item of itemRows) {
    const items = itemsByOrder.get(item.orderId) ?? [];
    items.push(item);
    itemsByOrder.set(item.orderId, items);
  }
  return {
    customer,
    roles: customerRoles.map((item) => ({ key: item.role as StaffRole, label: ROLE_FA[item.role as StaffRole] ?? item.role })),
    addresses: customerAddresses,
    orders: customerOrders.map((order) => ({ ...order, payment: paymentsByOrder.get(order.id) ?? null, items: itemsByOrder.get(order.id) ?? [] })),
    favorites: customerFavorites,
    refunds: customerRefunds,
  };
}

export async function listAdminPayments(q: string, status: string, page: number) {
  const gate = await requirePermission("payments.read");
  const safePage = Math.max(1, Math.floor(page || 1));
  const pageSize = PAGE_SIZE;
  if (!gate.ok) return { items: [], total: 0, page: safePage, pageSize };
  const filters = [];
  if (["initiated", "pending", "paid", "failed", "verified", "cancelled"].includes(status)) filters.push(eq(payments.status, status));
  const needle = q.trim();
  if (needle) filters.push(or(like(payments.orderId, `%${needle}%`), like(payments.refId, `%${needle}%`), like(payments.authority, `%${needle}%`)));
  const where = filters.length ? and(...filters) : undefined;
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(payments).where(where);
  const rows = await db
    .select({ id: payments.id, orderId: payments.orderId, provider: payments.provider, authority: payments.authority, amountRial: payments.amountRial, status: payments.status, refId: payments.refId, verifiedAt: payments.verifiedAt })
    .from(payments)
    .where(where)
    .orderBy(desc(payments.verifiedAt))
    .limit(pageSize)
    .offset((safePage - 1) * pageSize);
  const orderIds = [...new Set(rows.map((row) => row.orderId))];
  const orderRows = orderIds.length ? await db.select({ id: orders.id, userId: orders.userId, totalToman: orders.totalToman, createdAt: orders.createdAt }).from(orders).where(inArray(orders.id, orderIds)) : [];
  const byOrder = new Map(orderRows.map((order) => [order.id, order]));
  const customerIds = [...new Set(orderRows.map((order) => order.userId).filter((id): id is string => Boolean(id)))];
  const customers = customerIds.length ? await db.select({ id: user.id, name: user.name, email: user.email }).from(user).where(inArray(user.id, customerIds)) : [];
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  return {
    items: rows.map((payment) => {
      const order = byOrder.get(payment.orderId);
      return { ...payment, order, customer: order?.userId ? customerById.get(order.userId) ?? null : null };
    }),
    total: Number(n),
    page: safePage,
    pageSize,
  };
}

export async function listAdminRefunds(q: string, status: string, page: number) {
  const gate = await requirePermission("refunds.read");
  const safePage = Math.max(1, Math.floor(page || 1));
  const pageSize = PAGE_SIZE;
  if (!gate.ok) return { items: [], total: 0, page: safePage, pageSize };
  const filters = [];
  if ((REFUND_STATUSES as readonly string[]).includes(status)) filters.push(eq(walletRefunds.status, status));
  const needle = q.trim();
  if (needle) filters.push(or(like(walletRefunds.userId, `%${needle}%`), like(walletRefunds.iban, `%${needle}%`)));
  const where = filters.length ? and(...filters) : undefined;
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(walletRefunds).where(where);
  const rows = await db
    .select({ id: walletRefunds.id, userId: walletRefunds.userId, iban: walletRefunds.iban, status: walletRefunds.status, createdAt: walletRefunds.createdAt })
    .from(walletRefunds)
    .where(where)
    .orderBy(desc(walletRefunds.createdAt))
    .limit(pageSize)
    .offset((safePage - 1) * pageSize);
  const customerIds = [...new Set(rows.map((row) => row.userId))];
  const customers = customerIds.length ? await db.select({ id: user.id, name: user.name, email: user.email }).from(user).where(inArray(user.id, customerIds)) : [];
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  return { items: rows.map((row) => ({ ...row, customer: customerById.get(row.userId) ?? null })), total: Number(n), page: safePage, pageSize };
}

export async function setRefundStatus(id: string, status: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("refunds.write");
  if (!gate.ok) return gate;
  const parsed = z.enum(REFUND_STATUSES).safeParse(status);
  if (!parsed.success) return { ok: false, error: "وضعیت بازپرداخت نامعتبر است" };
  try {
    const result = await db.transaction(async (tx) => {
      const [refund] = await tx.select({ userId: walletRefunds.userId, status: walletRefunds.status }).from(walletRefunds).where(eq(walletRefunds.id, id)).limit(1).for("update");
      if (!refund) return { ok: false as const, error: "درخواست بازپرداخت پیدا نشد" };
      if (!canTransitionRefundStatus(refund.status, parsed.data)) return { ok: false as const, error: "تغییر وضعیت بازپرداخت مجاز نیست" };
      await tx.update(walletRefunds).set({ status: parsed.data }).where(eq(walletRefunds.id, id));
      return { ok: true as const, userId: refund.userId };
    });
    if (!result.ok) return result;
    revalidatePath("/admin/refunds");
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${result.userId}`);
    return { ok: true, data: null };
  } catch (error) {
    console.error("setRefundStatus failed", error);
    return { ok: false, error: "ثبت وضعیت بازپرداخت ناموفق بود" };
  }
}

export async function grantRole(userId: string, role: StaffRole): Promise<ActionRes<null>> {
  const gate = await requirePermission("users.roles");
  if (!gate.ok) return gate;
  const parsed = roleSchema.safeParse({ role });
  if (!parsed.success) return { ok: false, error: "نقش نامعتبر" };
  if (!STAFF_ROLES.includes(parsed.data.role)) return { ok: false, error: "نقش نامعتبر" };
  try {
    await db.transaction(async (tx) => {
      await tx.insert(staffRoles).values({ userId, role: parsed.data.role }).onDuplicateKeyUpdate({ set: { role: parsed.data.role } });
    });
    revalidatePath("/admin/users");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "اعطای نقش ناموفق بود" };
  }
}

export async function revokeRole(userId: string, role: StaffRole): Promise<ActionRes<null>> {
  const gate = await requirePermission("users.roles");
  if (!gate.ok) return gate;
  const parsed = roleSchema.safeParse({ role });
  if (!parsed.success) return { ok: false, error: "نقش نامعتبر" };
  if (!gate.roles.includes("admin")) return { ok: false, error: "فقط ادمین می‌تواند نقش کاربران را تغییر دهد" };
  try {
    const result = await db.transaction(async (tx) => {
      if (parsed.data.role === "admin") {
        // Lock the admin set so concurrent removals cannot delete the last administrator.
        const admins = await tx.select({ userId: staffRoles.userId }).from(staffRoles).where(eq(staffRoles.role, "admin")).for("update");
        if (admins.length <= 1 && admins.some((admin) => admin.userId === userId)) return { ok: false as const, error: "آخرین ادمین را نمی‌شود حذف کرد" };
      }
      await tx.delete(staffRoles).where(and(eq(staffRoles.userId, userId), eq(staffRoles.role, parsed.data.role)));
      return { ok: true as const };
    });
    if (!result.ok) return result;
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    return { ok: true, data: null };
  } catch (error) {
    console.error("revokeRole failed", error);
    return { ok: false, error: "لغو نقش ناموفق بود" };
  }
}