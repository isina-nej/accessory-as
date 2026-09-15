"use server";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { addresses, favorites, orderEvents, orderItems, orders, products, walletRefunds } from "@/db/schema";
import { IBAN_RE } from "@/lib/checkout";
import { getUserId } from "@/lib/session";
import type { ActionRes } from "./address-actions";

export async function getDashboard() {
  const uid = await getUserId();
  if (!uid) return null;
  const rows = await db.select().from(orders).where(eq(orders.userId, uid)).orderBy(desc(orders.createdAt)).limit(10);
  const active = rows.filter((o) => ["pending", "paid", "preparing", "shipped"].includes(o.status)).length;
  const delivered = rows.filter((o) => o.status === "delivered").length;
  const refunded = rows.filter((o) => o.status === "refunded").length;
  return { orders: rows, active, delivered, refunded };
}

export async function getOrders(filter: string) {
  const uid = await getUserId();
  if (!uid) return null;
  const rows = await db.select().from(orders).where(eq(orders.userId, uid)).orderBy(desc(orders.createdAt));
  if (filter === "active") return rows.filter((o) => ["pending", "paid", "preparing", "shipped"].includes(o.status));
  if (filter === "delivered") return rows.filter((o) => o.status === "delivered");
  if (filter === "refunded") return rows.filter((o) => o.status === "refunded" || o.status === "cancelled");
  return rows;
}

export async function getOrderDetail(id: string) {
  const uid = await getUserId();
  if (!uid) return null;
  const [o] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, id), eq(orders.userId, uid)))
    .limit(1);
  if (!o) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const events = await db.select().from(orderEvents).where(eq(orderEvents.orderId, id)).orderBy(desc(orderEvents.createdAt));
  const enriched = await Promise.all(
    items.map(async (it) => {
      const [p] = await db.select().from(products).where(eq(products.id, it.productId)).limit(1);
      return { ...it, title: p?.title ?? "کالا", slug: p?.slug ?? "" };
    }),
  );
  const [addr] = o.addressId
    ? await db.select().from(addresses).where(eq(addresses.id, o.addressId)).limit(1)
    : [undefined];
  return { order: o, items: enriched, events, address: addr ?? null };
}

export async function toggleFavorite(productId: string): Promise<ActionRes<boolean>> {
  const uid = await getUserId();
  if (!uid) return { ok: false, error: "وارد شو" };
  try {
    const [ex] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, uid), eq(favorites.productId, productId)))
      .limit(1);
    if (ex) {
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, uid), eq(favorites.productId, productId)));
      return { ok: true, data: false };
    }
    await db.insert(favorites).values({ userId: uid, productId });
    return { ok: true, data: true };
  } catch {
    return { ok: false, error: "ناموفق بود" };
  }
}

export async function getFavorites(sort: string) {
  const uid = await getUserId();
  if (!uid) return null;
  const favs = await db.select().from(favorites).where(eq(favorites.userId, uid));
  if (favs.length === 0) return [];
  const { inArray } = await import("drizzle-orm");
  const rows = await db
    .select()
    .from(products)
    .where(inArray(products.id, favs.map((f) => f.productId)));
  const sorted = [...rows].sort((a, b) =>
    sort === "cheap" ? a.priceToman - b.priceToman : sort === "expensive" ? b.priceToman - a.priceToman : 0,
  );
  return sorted;
}

export async function isFavorite(productId: string): Promise<boolean> {
  const uid = await getUserId();
  if (!uid) return false;
  const [ex] = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, uid), eq(favorites.productId, productId)))
    .limit(1)
    .catch(() => [undefined]);
  return !!ex;
}

export async function saveWalletIban(iban: string): Promise<ActionRes<null>> {
  const uid = await getUserId();
  if (!uid) return { ok: false, error: "وارد شو" };
  const clean = iban.replace(/\s/g, "");
  const parsed = z
    .object({ iban: z.string().trim().regex(IBAN_RE, "شبا باید IR + ۲۴ رقم باشد") })
    .safeParse({ iban: clean });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "شبا نامعتبر است" };
  try {
    await db.insert(walletRefunds).values({ userId: uid, iban: parsed.data.iban.toUpperCase(), status: "pending" });
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ثبت شبا ناموفق بود" };
  }
}
