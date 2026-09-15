"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { getUserId } from "@/lib/session";

export type ActionRes<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

const addressSchema = z.object({
  recipient: z.string().trim().min(2, "نام گیرنده کوتاه است").max(100),
  phone: z.string().trim().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
  province: z.string().trim().min(1, "استان لازم است").max(50),
  city: z.string().trim().min(1, "شهر لازم است").max(50),
  detail: z.string().trim().min(5, "متن آدرس کوتاه است").max(500),
  postal: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "کد پستی ۱۰ رقم است")
    .optional()
    .or(z.literal("")),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export async function listAddresses(): Promise<ActionRes<(typeof addresses.$inferSelect)[]>> {
  const uid = await getUserId();
  if (!uid) return { ok: false, error: "وارد شو" };
  try {
    const rows = await db.select().from(addresses).where(eq(addresses.userId, uid));
    return { ok: true, data: rows };
  } catch {
    return { ok: false, error: "دیتابیس در دسترس نیست" };
  }
}

export async function createAddress(input: AddressInput): Promise<ActionRes<string>> {
  const uid = await getUserId();
  if (!uid) return { ok: false, error: "وارد شو" };
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  try {
    if (parsed.data.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, uid));
    }
    const id = crypto.randomUUID();
    await db.insert(addresses).values({
      id,
      userId: uid,
      label: null,
      recipient: parsed.data.recipient,
      province: parsed.data.province,
      city: parsed.data.city,
      detail: parsed.data.detail,
      postal: parsed.data.postal || null,
      phone: parsed.data.phone,
      isDefault: parsed.data.isDefault,
    });
    revalidatePath("/checkout/address");
    revalidatePath("/account/addresses");
    return { ok: true, data: id };
  } catch {
    return { ok: false, error: "ثبت آدرس ناموفق بود" };
  }
}

export async function updateAddress(id: string, input: AddressInput): Promise<ActionRes<null>> {
  const uid = await getUserId();
  if (!uid) return { ok: false, error: "وارد شو" };
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  try {
    if (parsed.data.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, uid));
    }
    await db
      .update(addresses)
      .set({
        recipient: parsed.data.recipient,
        phone: parsed.data.phone,
        province: parsed.data.province,
        city: parsed.data.city,
        detail: parsed.data.detail,
        postal: parsed.data.postal || null,
        isDefault: parsed.data.isDefault,
      })
      .where(and(eq(addresses.id, id), eq(addresses.userId, uid)));
    revalidatePath("/checkout/address");
    revalidatePath("/account/addresses");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ویرایش آدرس ناموفق بود" };
  }
}

export async function deleteAddress(id: string): Promise<ActionRes<null>> {
  const uid = await getUserId();
  if (!uid) return { ok: false, error: "وارد شو" };
  try {
    const { orders } = await import("@/db/schema");
    const used = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.addressId, id))
      .limit(1);
    if (used.length > 0) return { ok: false, error: "این آدرس در سفارش استفاده شده و قابل حذف نیست" };
    await db
      .delete(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, uid)));
    revalidatePath("/checkout/address");
    revalidatePath("/account/addresses");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف آدرس ناموفق بود" };
  }
}

export async function setDefaultAddress(id: string): Promise<ActionRes<null>> {
  const uid = await getUserId();
  if (!uid) return { ok: false, error: "وارد شو" };
  try {
    await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, uid));
    await db
      .update(addresses)
      .set({ isDefault: true })
      .where(and(eq(addresses.id, id), eq(addresses.userId, uid)));
    revalidatePath("/checkout/address");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ناموفق بود" };
  }
}
