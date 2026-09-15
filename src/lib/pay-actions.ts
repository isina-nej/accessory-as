"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderEvents, orderItems, orders, payments, products } from "@/db/schema";
import { tomanToRial } from "@/lib/fa";
import { startPayment, type PayProvider } from "@/lib/payment/start";
import { getUserId } from "@/lib/session";
import type { ActionRes } from "./address-actions";

export async function startOrderPayment(
  orderId: string,
  provider: PayProvider,
): Promise<ActionRes<{ url: string }>> {
  const uid = await getUserId();
  if (!uid) return { ok: false, error: "وارد شو" };
  try {
    const [o] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, uid)))
      .limit(1);
    if (!o) return { ok: false, error: "سفارش پیدا نشد" };
    if (o.status !== "pending") return { ok: false, error: "این سفارش قابل پرداخت نیست" };

    const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    const callbackUrl = `${base}/payment/callback?orderId=${orderId}&provider=${provider}`;
    const pay = await startPayment({
      provider,
      totalToman: o.totalToman,
      orderId,
      callbackUrl,
      description: `سفارش ${orderId.slice(0, 8)}`,
    });

    await db
      .insert(payments)
      .values({
        orderId,
        provider,
        authority: pay.authority,
        amountRial: pay.amountRial,
        status: "initiated",
      })
      .onDuplicateKeyUpdate({
        set: { provider, authority: pay.authority, amountRial: pay.amountRial, status: "initiated" },
      });

    return { ok: true, data: { url: pay.url } };
  } catch (e) {
    console.error("[pay:start]", e instanceof Error ? e.message : e);
    return { ok: false, error: "شروع پرداخت ناموفق بود" };
  }
}

// تایید mock: authority ساختگی + کسر موجودی + sold_count + ایونت
export async function mockConfirmOrder(orderId: string, uid: string): Promise<boolean> {
  const [o] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, uid)))
    .limit(1);
  if (!o || o.status !== "pending") return false;
  const [pay] = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
  if (!pay || !pay.authority?.startsWith("MOCK-")) return false;
  if (pay.amountRial !== tomanToRial(o.totalToman)) return false;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const it of items) {
    const [p] = await db.select().from(products).where(eq(products.id, it.productId)).limit(1);
    if (!p || p.stock < it.qty) {
      await db.update(orders).set({ status: "failed" }).where(eq(orders.id, orderId));
      await db.insert(orderEvents).values({ orderId, status: "failed" });
      return false;
    }
  }
  for (const it of items) {
    const [p] = await db.select().from(products).where(eq(products.id, it.productId)).limit(1);
    if (!p) continue;
    await db
      .update(products)
      .set({ stock: p.stock - it.qty, soldCount: (p.soldCount ?? 0) + it.qty })
      .where(eq(products.id, it.productId));
  }
  await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));
  await db
    .update(payments)
    .set({ status: "verified", refId: pay.authority, verifiedAt: new Date() })
    .where(eq(payments.orderId, orderId));
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/shop");
  revalidatePath("/");
  await db.insert(orderEvents).values({ orderId, status: "paid" });
  return true;
}
