"use server";

import { revalidatePath } from "next/cache";
import { desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orderEvents, orderItems, orders, products, user } from "@/db/schema";
import type { ActionRes } from "../lib/address-actions";
import { requireStaff } from "./staff";

const STATUSES = ["pending", "paid", "preparing", "shipped", "delivered", "failed", "cancelled", "refunded"] as const;

export async function listAdminOrders(status: string, page: number) {
  const gate = await requireStaff();
  if (!gate.ok) return { items: [], total: 0 };
  const where = (STATUSES as readonly string[]).includes(status) ? eq(orders.status, status) : undefined;
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(orders).where(where);
  const rows = await db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(20).offset(Math.max(0, page - 1) * 20);
  return { items: rows, total: Number(n) };
}

export async function getAdminOrder(id: string) {
  const gate = await requireStaff();
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
  const [u] = o.userId ? await db.select().from(user).where(eq(user.id, o.userId)).limit(1) : [undefined];
  return { order: o, items: enriched, events, buyer: u ? { email: u.email, name: u.name, phone: u.phoneNumber } : null };
}

export async function setOrderStatus(id: string, status: string): Promise<ActionRes<null>> {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  if (!(STATUSES as readonly string[]).includes(status)) return { ok: false, error: "وضعیت نامعتبر" };
  try {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
    await db.insert(orderEvents).values({ orderId: id, status });
    revalidatePath("/admin/orders");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ناموفق بود" };
  }
}

const trackSchema = z.object({
  tracking: z.string().trim().max(100),
});

export async function setTracking(id: string, tracking: string): Promise<ActionRes<null>> {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  const parsed = trackSchema.safeParse({ tracking });
  if (!parsed.success) return { ok: false, error: "کد رهگیری نامعتبر" };
  try {
    await db.update(orders).set({ trackingCode: parsed.data.tracking || null }).where(eq(orders.id, id));
    revalidatePath("/admin/orders");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ناموفق بود" };
  }
}

export async function adminStats() {
  const gate = await requireStaff();
  if (!gate.ok) return null;
  const [{ n: orderCount }] = await db.select({ n: sql<number>`count(*)` }).from(orders);
  const [{ s: revenue }] = await db.select({ s: sql<number>`coalesce(sum(${orders.totalToman}),0)` }).from(orders).where(eq(orders.status, "paid"));
  const [{ n: productCount }] = await db.select({ n: sql<number>`count(*)` }).from(products);
  const [{ n: lowStock }] = await db.select({ n: sql<number>`count(*)` }).from(products).where(sql`${products.stock} <= 3`);
  const [{ n: userCount }] = await db.select({ n: sql<number>`count(*)` }).from(user);
  const [{ n: pendingOrders }] = await db.select({ n: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending"));
  const recent = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);
  return {
    orderCount: Number(orderCount), revenue: Number(revenue), productCount: Number(productCount),
    lowStock: Number(lowStock), userCount: Number(userCount), pendingOrders: Number(pendingOrders), recent,
  };
}
