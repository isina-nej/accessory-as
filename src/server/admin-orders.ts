"use server";

import { revalidatePath } from "next/cache";
import { and, asc, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { addresses, contactMessages, orderEvents, orderItems, orders, payments, products, reviews, user } from "@/db/schema";
import { canTransitionOrderStatus } from "@/lib/order-status";
import { ORDER_STATUSES } from "@/lib/admin-labels";
import type { ActionRes } from "../lib/address-actions";
import { requirePermission } from "./staff";

export type AdminOrderFilters = {
  status?: string;
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function dateBoundary(value: string | undefined, endOfDay: boolean): Date | null {
  if (!value || !DATE_RE.test(value)) return null;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  if (endOfDay) d.setDate(d.getDate() + 1);
  return d;
}

export async function listAdminOrders(filters: AdminOrderFilters = {}) {
  const gate = await requirePermission("orders.read");
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const pageSize = Math.min(50, Math.max(1, Math.floor(filters.pageSize ?? 20)));
  if (!gate.ok) return { items: [], total: 0, page, pageSize };
  const conditions = [];
  if (filters.status && (ORDER_STATUSES as readonly string[]).includes(filters.status)) conditions.push(eq(orders.status, filters.status));
  const q = filters.q?.trim();
  if (q) {
    const buyerMatch = or(like(user.name, `%${q}%`), like(user.email, `%${q}%`), like(user.phoneNumber, `%${q}%`));
    const result = await db
      .select({ id: orders.id })
      .from(orders)
      .leftJoin(user, eq(user.id, orders.userId))
      .where(or(like(orders.id, `%${q}%`), like(orders.trackingCode, `%${q}%`), like(orders.couponCode, `%${q}%`), buyerMatch))
      .limit(500);
    const ids = result.map((r) => r.id);
    if (ids.length === 0) return { items: [], total: 0, page, pageSize };
    conditions.push(sql`${orders.id} in ${ids}`);
  }
  const from = dateBoundary(filters.from, false);
  if (from) conditions.push(gte(orders.createdAt, from));
  const to = dateBoundary(filters.to, true);
  if (to) conditions.push(lte(orders.createdAt, to));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(orders).where(where);
  const rows = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalToman: orders.totalToman,
      createdAt: orders.createdAt,
      buyerName: user.name,
      buyerEmail: user.email,
    })
    .from(orders)
    .leftJoin(user, eq(user.id, orders.userId))
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  return { items: rows, total: Number(n), page, pageSize };
}

export async function getAdminOrder(id: string) {
  const gate = await requirePermission("orders.read");
  if (!gate.ok) return null;
  const [o] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!o) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const events = await db.select().from(orderEvents).where(eq(orderEvents.orderId, id)).orderBy(desc(orderEvents.createdAt));
  const enriched = await Promise.all(
    items.map(async (it) => {
      const [p] = await db.select().from(products).where(eq(products.id, it.productId)).limit(1);
      return { ...it, title: p?.title ?? "کالا", slug: p?.slug ?? "" };
    }),
  );
  const [buyer] = o.userId ? await db.select({ name: user.name, email: user.email, phoneNumber: user.phoneNumber }).from(user).where(eq(user.id, o.userId)).limit(1) : [undefined];
  const [address] = o.addressId ? await db.select().from(addresses).where(eq(addresses.id, o.addressId)).limit(1) : [undefined];
  const [payment] = await db.select({ provider: payments.provider, status: payments.status, refId: payments.refId, amountRial: payments.amountRial, verifiedAt: payments.verifiedAt }).from(payments).where(eq(payments.orderId, id)).limit(1);
  return { order: o, items: enriched, events, buyer: buyer ?? null, address: address ?? null, payment: payment ?? null };
}

export async function setOrderStatus(id: string, status: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("orders.status");
  if (!gate.ok) return gate;
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return { ok: false, error: "وضعیت نامعتبر" };
  try {
    const result = await db.transaction(async (tx) => {
      const [order] = await tx.select({ status: orders.status }).from(orders).where(eq(orders.id, id)).limit(1);
      if (!order) return { ok: false as const, error: "سفارش پیدا نشد" };
      if (!canTransitionOrderStatus(order.status, status)) return { ok: false as const, error: "تغییر وضعیت سفارش مجاز نیست" };
      await tx.update(orders).set({ status }).where(eq(orders.id, id));
      await tx.insert(orderEvents).values({ orderId: id, status });
      return { ok: true as const };
    });
    if (!result.ok) return result;
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ثبت وضعیت سفارش ناموفق بود" };
  }
}

const trackSchema = z.object({
  tracking: z.string().trim().max(100),
});

export async function setTracking(id: string, tracking: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("orders.tracking");
  if (!gate.ok) return gate;
  const parsed = trackSchema.safeParse({ tracking });
  if (!parsed.success) return { ok: false, error: "کد رهگیری نامعتبر" };
  try {
    await db.update(orders).set({ trackingCode: parsed.data.tracking || null }).where(eq(orders.id, id));
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ثبت کد رهگیری ناموفق بود" };
  }
}

export async function adminStats() {
  const gate = await requirePermission("dashboard.read");
  if (!gate.ok) return null;
  const [{ n: orderCount }] = await db.select({ n: sql<number>`count(*)` }).from(orders);
  const [{ s: revenue }] = await db.select({ s: sql<number>`coalesce(sum(${orders.totalToman}),0)` }).from(orders).where(eq(orders.status, "paid"));
  const [{ n: productCount }] = await db.select({ n: sql<number>`count(*)` }).from(products).where(eq(products.status, "active"));
  const [{ n: lowStock }] = await db.select({ n: sql<number>`count(*)` }).from(products).where(and(eq(products.status, "active"), sql`${products.stock} <= 3`));
  const [{ n: userCount }] = await db.select({ n: sql<number>`count(*)` }).from(user);
  const [{ n: pendingOrders }] = await db.select({ n: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending"));
  const [{ n: failedPayments }] = await db.select({ n: sql<number>`count(*)` }).from(payments).where(eq(payments.status, "failed"));
  const [{ n: pendingReviews }] = await db.select({ n: sql<number>`count(*)` }).from(reviews).where(eq(reviews.verified, false));
  const [{ n: unreadMessages }] = await db.select({ n: sql<number>`count(*)` }).from(contactMessages).where(eq(contactMessages.read, false));
  const lowStockItems = await db
    .select({ id: products.id, title: products.title, stock: products.stock })
    .from(products)
    .where(and(eq(products.status, "active"), sql`${products.stock} <= 3`))
    .orderBy(asc(products.stock))
    .limit(5);
  const recent = await db
    .select({ id: orders.id, status: orders.status, totalToman: orders.totalToman, createdAt: orders.createdAt, buyerName: user.name })
    .from(orders)
    .leftJoin(user, eq(user.id, orders.userId))
    .orderBy(desc(orders.createdAt))
    .limit(5);
  return {
    orderCount: Number(orderCount),
    revenue: Number(revenue),
    productCount: Number(productCount),
    lowStock: Number(lowStock),
    userCount: Number(userCount),
    pendingOrders: Number(pendingOrders),
    failedPayments: Number(failedPayments),
    pendingReviews: Number(pendingReviews),
    unreadMessages: Number(unreadMessages),
    lowStockItems,
    recent,
  };
}