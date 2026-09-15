"use server";

import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { coupons, orderItems, orders, products, shippingMethods } from "@/db/schema";
import { couponDiscount, shippingFee } from "@/lib/checkout";
import { getUserId } from "@/lib/session";
import type { ActionRes } from "./address-actions";

const lineSchema = z.object({
  id: z.string().min(1),
  qty: z.coerce.number().int().min(1).max(99),
});

const draftSchema = z.object({
  lines: z.array(lineSchema).min(1, "سبد خالی است").max(50),
  addressId: z.string().uuid("آدرس نامعتبر است").optional(),
  couponCode: z.string().trim().max(50).optional(),
  shippingSlug: z.string().trim().max(50).optional(),
});

export type Draft = z.infer<typeof draftSchema>;

export type DraftResult = {
  orderId: string;
  subtotal: number;
  discount: number;
  shipping: number;
  payable: number;
};

export async function createDraftOrder(input: Draft): Promise<ActionRes<DraftResult>> {
  const uid = await getUserId();
  if (!uid) return { ok: false, error: "برای ثبت سفارش وارد شو" };
  const parsed = draftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };

  try {
    const { inArray } = await import("drizzle-orm");
    const ids = parsed.data.lines.map((l) => l.id);
    const prows = await db.select().from(products).where(inArray(products.id, ids));
    const byId = new Map(prows.map((p) => [p.id, p]));

    let subtotal = 0;
    for (const l of parsed.data.lines) {
      const p = byId.get(l.id);
      if (!p || p.status !== "active") return { ok: false, error: "کالایی در سبد نامعتبر شد" };
      if (p.stock < l.qty) return { ok: false, error: `موجودی «${p.title}» کافی نیست` };
      subtotal += p.priceToman * l.qty;
    }

    let discount = 0;
    let couponCode: string | undefined;
    const code = parsed.data.couponCode?.trim().toUpperCase();
    if (code) {
      const [c] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
      if (!c) return { ok: false, error: "کد تخفیف پیدا نشد" };
      const r = couponDiscount(subtotal, c);
      if (!r.ok) return r;
      discount = r.discount;
      couponCode = c.code;
    }

    let shipping = 0;
    let shippingSlug: string | undefined;
    if (parsed.data.shippingSlug) {
      const [m] = await db
        .select()
        .from(shippingMethods)
        .where(eq(shippingMethods.slug, parsed.data.shippingSlug))
        .limit(1);
      if (!m) return { ok: false, error: "روش ارسال نامعتبر است" };
      shipping = shippingFee(m, subtotal - discount);
      shippingSlug = m.slug;
    }

    const payable = subtotal - discount + shipping;
    const orderId = crypto.randomUUID();
    await db.insert(orders).values({
      id: orderId,
      userId: uid,
      status: "pending",
      totalToman: payable,
      discountToman: discount,
      shippingFeeToman: shipping,
      shippingSlug,
      couponCode,
      addressId: parsed.data.addressId,
    });
    await db.insert(orderItems).values(
      parsed.data.lines.map((l) => ({
        orderId,
        productId: l.id,
        qty: l.qty,
        unitToman: byId.get(l.id)!.priceToman,
      })),
    );
    const { orderEvents } = await import("@/db/schema");
    await db.insert(orderEvents).values({ orderId, status: "pending" });

    return { ok: true, data: { orderId, subtotal, discount, shipping, payable } };
  } catch {
    return { ok: false, error: "ثبت سفارش ناموفق بود" };
  }
}

export async function validateCoupon(code: string, subtotal: number): Promise<ActionRes<number>> {
  const uid = await getUserId();
  if (!uid) return { ok: false, error: "وارد شو" };
  const c = code.trim().toUpperCase();
  if (!c) return { ok: false, error: "کد را وارد کن" };
  try {
    const [row] = await db.select().from(coupons).where(eq(coupons.code, c)).limit(1);
    if (!row) return { ok: false, error: "کد تخفیف پیدا نشد" };
    const r = couponDiscount(subtotal, row);
    if (!r.ok) return r;
    return { ok: true, data: r.discount };
  } catch {
    return { ok: false, error: "بررسی کد ناموفق بود" };
  }
}

export async function getOrderForPay(orderId: string) {
  const uid = await getUserId();
  if (!uid) return null;
  const [o] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, uid)))
    .limit(1);
  if (!o) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  return { ...o, items };
}
