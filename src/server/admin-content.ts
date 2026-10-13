"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { banners, campaigns, contactMessages, coupons, faqs, orders, pages, products, reviews, settings, shippingMethods } from "@/db/schema";
import { BANNER_SLOTS, SETTINGS_KEYS } from "@/lib/admin-labels";
import type { BannerSlot } from "@/lib/admin-labels";
import type { ActionRes } from "../lib/address-actions";
import { requirePermission } from "./staff";

const PAGE_SIZE = 20;

// ورودی تاریخ از فرم به رشتهٔ میلادی؛ خروجی "INVALID" یعنی تاریخ نامعتبر
function parseOptionalDate(value: string | null | undefined): Date | null | "INVALID" {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "INVALID" : d;
}

// نتیجهٔ update در drizzle-mysql2 بسته به درایور می‌تواند آرایه، ResultSetHeader یا raw باشد
function isEmptyUpdateResult(result: unknown): boolean {
  if (Array.isArray(result)) return result.length === 0;
  if (result && typeof result === "object" && "affectedRows" in result) {
    return (result as { affectedRows: number }).affectedRows === 0;
  }
  return false;
}

// --- بنرها (content) ---
const bannerSchema = z.object({
  slot: z.enum(BANNER_SLOTS),
  title: z.string().trim().min(2, "تیتر کوتاه است").max(200),
  subtitle: z.string().trim().max(1000).nullable().optional(),
  ctaLabel: z.string().trim().max(100).nullable().optional(),
  ctaHref: z.string().trim().max(300).nullable().optional(),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  sort: z.coerce.number().int().min(0).max(999).default(0),
  active: z.coerce.boolean().default(true),
  startsAt: z.string().trim().max(30).nullable().optional(),
  endsAt: z.string().trim().max(30).nullable().optional(),
});

export type BannerInput = z.input<typeof bannerSchema>;

export async function listBanners() {
  const gate = await requirePermission("content.read");
  if (!gate.ok) return [];
  return db.select().from(banners).orderBy(banners.slot, banners.sort);
}

export async function saveBanner(id: string | null, input: BannerInput): Promise<ActionRes<string>> {
  const gate = await requirePermission("content.write");
  if (!gate.ok) return gate;
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  const startsAt = parseOptionalDate(parsed.data.startsAt);
  if (startsAt === "INVALID") return { ok: false, error: "تاریخ شروع نامعتبر است" };
  const endsAt = parseOptionalDate(parsed.data.endsAt);
  if (endsAt === "INVALID") return { ok: false, error: "تاریخ پایان نامعتبر است" };
  if (startsAt && endsAt && startsAt.getTime() > endsAt.getTime()) return { ok: false, error: "تاریخ پایان نمی‌تواند قبل از شروع باشد" };
  try {
    const d = { ...parsed.data, subtitle: parsed.data.subtitle || null, ctaLabel: parsed.data.ctaLabel || null, ctaHref: parsed.data.ctaHref || null, imageUrl: parsed.data.imageUrl || null, startsAt, endsAt };
    const bannerId = await db.transaction(async (tx) => {
      if (id) {
        const [existing] = await tx.select({ id: banners.id }).from(banners).where(eq(banners.id, id)).limit(1);
        if (!existing) throw new Error("BANNER_NOT_FOUND");
        await tx.update(banners).set(d).where(eq(banners.id, id));
        return id;
      }
      const nid = crypto.randomUUID();
      await tx.insert(banners).values({ id: nid, ...d });
      return nid;
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/content");
    return { ok: true, data: bannerId };
  } catch (e) {
    if (e instanceof Error && e.message === "BANNER_NOT_FOUND") return { ok: false, error: "بنر پیدا نشد" };
    return { ok: false, error: "ذخیره ناموفق بود" };
  }
}

export async function deleteBanner(id: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("content.write");
  if (!gate.ok) return gate;
  try {
    await db.delete(banners).where(eq(banners.id, id));
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/content");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

// --- صفحات (content) ---
const pageSchema = z.object({
  title: z.string().trim().min(2).max(200),
  body: z.string().trim().min(2).max(20000),
  seoTitle: z.string().trim().max(200).nullable().optional(),
  seoDesc: z.string().trim().max(300).nullable().optional(),
});

export async function listPages() {
  const gate = await requirePermission("content.read");
  if (!gate.ok) return [];
  return db.select().from(pages);
}

export async function savePage(slug: string, input: z.input<typeof pageSchema>): Promise<ActionRes<null>> {
  const gate = await requirePermission("content.write");
  if (!gate.ok) return gate;
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  try {
    const result = await db.update(pages).set({
      title: parsed.data.title, body: parsed.data.body,
      seoTitle: parsed.data.seoTitle || null, seoDesc: parsed.data.seoDesc || null,
    }).where(eq(pages.slug, slug));
    if (isEmptyUpdateResult(result)) return { ok: false, error: "صفحه پیدا نشد" };
    revalidatePath(`/${slug}`);
    revalidatePath("/admin/content");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ذخیره ناموفق بود" };
  }
}

// --- سوالات (content) ---
const faqSchema = z.object({
  q: z.string().trim().min(2).max(300),
  a: z.string().trim().min(2).max(5000),
  sort: z.coerce.number().int().min(0).max(999).default(0),
  active: z.coerce.boolean().default(true),
});

export async function listFaqs() {
  const gate = await requirePermission("content.read");
  if (!gate.ok) return [];
  return db.select().from(faqs).orderBy(faqs.sort);
}

export async function saveFaq(id: string | null, input: z.input<typeof faqSchema>): Promise<ActionRes<string>> {
  const gate = await requirePermission("content.write");
  if (!gate.ok) return gate;
  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  try {
    const faqId = await db.transaction(async (tx) => {
      if (id) {
        const [existing] = await tx.select({ id: faqs.id }).from(faqs).where(eq(faqs.id, id)).limit(1);
        if (!existing) throw new Error("FAQ_NOT_FOUND");
        await tx.update(faqs).set(parsed.data).where(eq(faqs.id, id));
        return id;
      }
      const nid = crypto.randomUUID();
      await tx.insert(faqs).values({ id: nid, ...parsed.data });
      return nid;
    });
    revalidatePath("/faq");
    revalidatePath("/admin/content");
    return { ok: true, data: faqId };
  } catch (e) {
    if (e instanceof Error && e.message === "FAQ_NOT_FOUND") return { ok: false, error: "سؤال پیدا نشد" };
    return { ok: false, error: "ذخیره ناموفق بود" };
  }
}

export async function deleteFaq(id: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("content.write");
  if (!gate.ok) return gate;
  try {
    await db.delete(faqs).where(eq(faqs.id, id));
    revalidatePath("/faq");
    revalidatePath("/admin/content");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

// --- تنظیمات (admin) ---
const SETTINGS_KEY_SET = new Set(SETTINGS_KEYS.map((k) => k.key));

export async function listSettings(keys?: string[]) {
  const gate = await requirePermission("settings.read");
  if (!gate.ok) return [];
  const rows = await db.select().from(settings);
  return keys ? rows.filter((r) => keys.includes(r.key)) : rows;
}

export async function saveSettings(input: Record<string, string>): Promise<ActionRes<null>> {
  const gate = await requirePermission("settings.write");
  if (!gate.ok) return gate;
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!SETTINGS_KEY_SET.has(key)) continue;
    clean[key] = String(value ?? "").slice(0, 5000);
  }
  if (Object.keys(clean).length === 0) return { ok: false, error: "کلید تنظیمات معتبر نیست" };
  try {
    await db.transaction(async (tx) => {
      for (const [key, value] of Object.entries(clean)) {
        await tx.insert(settings).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
      }
    });
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/settings");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ذخیره ناموفق بود" };
  }
}

// --- پیام‌ها (support) ---
export type AdminMessageFilters = { q?: string; unreadOnly?: boolean; page?: number };

export async function listMessages(filters: AdminMessageFilters = {}) {
  const gate = await requirePermission("messages.read");
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  if (!gate.ok) return { items: [], total: 0, page, pageSize: PAGE_SIZE, unreadTotal: 0 };
  const conditions = [];
  if (filters.unreadOnly) conditions.push(eq(contactMessages.read, false));
  const needle = filters.q?.trim();
  if (needle) conditions.push(or(like(contactMessages.name, `%${needle}%`), like(contactMessages.email, `%${needle}%`), like(contactMessages.phone, `%${needle}%`), like(contactMessages.body, `%${needle}%`)));
  const where = conditions.length ? and(...conditions) : undefined;
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(contactMessages).where(where);
  const [{ n: unreadTotal }] = await db.select({ n: sql<number>`count(*)` }).from(contactMessages).where(eq(contactMessages.read, false));
  const rows = await db.select().from(contactMessages).where(where).orderBy(desc(contactMessages.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE);
  return { items: rows, total: Number(n), page, pageSize: PAGE_SIZE, unreadTotal: Number(unreadTotal) };
}

export async function markMessage(id: string, read: boolean): Promise<ActionRes<null>> {
  const gate = await requirePermission("messages.manage");
  if (!gate.ok) return gate;
  try {
    await db.update(contactMessages).set({ read }).where(eq(contactMessages.id, id));
    revalidatePath("/admin/messages");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ناموفق بود" };
  }
}

export async function deleteMessage(id: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("messages.manage");
  if (!gate.ok) return gate;
  try {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
    revalidatePath("/admin/messages");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

// --- دیدگاه‌ها (support/content) ---
export type AdminReviewFilters = { q?: string; pendingOnly?: boolean; page?: number };

export async function listAdminReviews(filters: AdminReviewFilters = {}) {
  const gate = await requirePermission("reviews.read");
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  if (!gate.ok) return { items: [], total: 0, page, pageSize: PAGE_SIZE, pendingTotal: 0 };
  const conditions = [];
  if (filters.pendingOnly) conditions.push(eq(reviews.verified, false));
  const needle = filters.q?.trim();
  if (needle) conditions.push(or(like(reviews.author, `%${needle}%`), like(reviews.body, `%${needle}%`), like(products.title, `%${needle}%`)));
  const where = conditions.length ? and(...conditions) : undefined;
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(reviews).leftJoin(products, eq(products.id, reviews.productId)).where(where);
  const [{ n: pendingTotal }] = await db.select({ n: sql<number>`count(*)` }).from(reviews).where(eq(reviews.verified, false));
  const rows = await db
    .select({
      id: reviews.id,
      productId: reviews.productId,
      author: reviews.author,
      rating: reviews.rating,
      body: reviews.body,
      verified: reviews.verified,
      createdAt: reviews.createdAt,
      productTitle: products.title,
      productSlug: products.slug,
    })
    .from(reviews)
    .leftJoin(products, eq(products.id, reviews.productId))
    .where(where)
    .orderBy(desc(reviews.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
  return { items: rows, total: Number(n), page, pageSize: PAGE_SIZE, pendingTotal: Number(pendingTotal) };
}

export async function setReviewVerified(id: string, verified: boolean): Promise<ActionRes<null>> {
  const gate = await requirePermission("reviews.moderate");
  if (!gate.ok) return gate;
  try {
    await db.update(reviews).set({ verified }).where(eq(reviews.id, id));
    revalidatePath("/admin/reviews");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ناموفق بود" };
  }
}

export async function deleteReview(id: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("reviews.moderate");
  if (!gate.ok) return gate;
  try {
    await db.delete(reviews).where(eq(reviews.id, id));
    revalidatePath("/admin/reviews");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

// --- مارکتینگ: کوپن/ارسال/کمپین (admin) ---
const couponSchema = z.object({
  code: z.string().trim().min(2).max(50).transform((s) => s.toUpperCase()),
  pct: z.coerce.number().int().min(1).max(90),
  maxToman: z.coerce.number().int().min(0).max(999999999).nullable().optional(),
  minToman: z.coerce.number().int().min(0).max(999999999).nullable().optional(),
  active: z.coerce.boolean().default(true),
  expiresAt: z.string().trim().max(30).nullable().optional(),
});

export type CouponInput = z.input<typeof couponSchema>;

export async function listCoupons() {
  const gate = await requirePermission("marketing.read");
  if (!gate.ok) return [];
  return db.select().from(coupons);
}

export async function saveCoupon(id: string | null, input: CouponInput): Promise<ActionRes<string>> {
  const gate = await requirePermission("marketing.write");
  if (!gate.ok) return gate;
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  let expiresAt: Date | null = null;
  if (parsed.data.expiresAt) {
    expiresAt = new Date(parsed.data.expiresAt);
    if (Number.isNaN(expiresAt.getTime())) return { ok: false, error: "تاریخ انقضا نامعتبر است" };
  }
  try {
    const d = { code: parsed.data.code, pct: parsed.data.pct, maxToman: parsed.data.maxToman ?? null, minToman: parsed.data.minToman ?? null, active: parsed.data.active, expiresAt };
    const couponId = await db.transaction(async (tx) => {
      if (id) {
        const [existing] = await tx.select({ id: coupons.id }).from(coupons).where(eq(coupons.id, id)).limit(1);
        if (!existing) throw new Error("COUPON_NOT_FOUND");
        await tx.update(coupons).set(d).where(eq(coupons.id, id));
        return id;
      }
      const nid = crypto.randomUUID();
      await tx.insert(coupons).values({ id: nid, ...d });
      return nid;
    });
    revalidatePath("/admin/marketing");
    return { ok: true, data: couponId };
  } catch (e) {
    if (e instanceof Error && e.message === "COUPON_NOT_FOUND") return { ok: false, error: "کوپن پیدا نشد" };
    const msg = e instanceof Error && e.message.includes("Duplicate") ? "کد تکراری است" : "ذخیره ناموفق بود";
    return { ok: false, error: msg };
  }
}

export async function deleteCoupon(id: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("marketing.write");
  if (!gate.ok) return gate;
  try {
    await db.delete(coupons).where(eq(coupons.id, id));
    revalidatePath("/admin/marketing");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

const shipSchema = z.object({
  title: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(50).regex(/^[a-z0-9-]+$/, "اسلاگ فقط حروف کوچک، عدد و خط‌تیره"),
  feeToman: z.coerce.number().int().min(0).max(99999999),
  freeOverToman: z.coerce.number().int().min(0).max(999999999).nullable().optional(),
});

export type ShippingInput = z.input<typeof shipSchema>;

export async function listShipping() {
  const gate = await requirePermission("marketing.read");
  if (!gate.ok) return [];
  return db.select().from(shippingMethods);
}

export async function saveShipping(id: string | null, input: ShippingInput): Promise<ActionRes<string>> {
  const gate = await requirePermission("marketing.write");
  if (!gate.ok) return gate;
  const parsed = shipSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  try {
    const d = { ...parsed.data, freeOverToman: parsed.data.freeOverToman ?? null };
    const shipId = await db.transaction(async (tx) => {
      if (id) {
        const [existing] = await tx.select({ id: shippingMethods.id }).from(shippingMethods).where(eq(shippingMethods.id, id)).limit(1);
        if (!existing) throw new Error("SHIPPING_NOT_FOUND");
        await tx.update(shippingMethods).set(d).where(eq(shippingMethods.id, id));
        return id;
      }
      const nid = crypto.randomUUID();
      await tx.insert(shippingMethods).values({ id: nid, ...d });
      return nid;
    });
    revalidatePath("/admin/marketing");
    revalidatePath("/checkout/shipping");
    return { ok: true, data: shipId };
  } catch (e) {
    if (e instanceof Error && e.message === "SHIPPING_NOT_FOUND") return { ok: false, error: "روش ارسال پیدا نشد" };
    const msg = e instanceof Error && e.message.includes("Duplicate") ? "اسلاگ تکراری است" : "ذخیره ناموفق بود";
    return { ok: false, error: msg };
  }
}

export async function deleteShipping(id: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("marketing.write");
  if (!gate.ok) return gate;
  try {
    const result = await db.transaction(async (tx) => {
      const [ship] = await tx.select({ slug: shippingMethods.slug }).from(shippingMethods).where(eq(shippingMethods.id, id)).limit(1);
      if (!ship) return { ok: false as const, error: "روش ارسال پیدا نشد" };
      const [{ n }] = await tx.select({ n: sql<number>`count(*)` }).from(orders).where(eq(orders.shippingSlug, ship.slug));
      if (Number(n) > 0) return { ok: false as const, error: "این روش ارسال در سفارش‌ها استفاده شده؛ حذف نکنید" };
      await tx.delete(shippingMethods).where(eq(shippingMethods.id, id));
      return { ok: true as const };
    });
    if (!result.ok) return result;
    revalidatePath("/admin/marketing");
    revalidatePath("/checkout/shipping");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

export async function getCampaign() {
  const gate = await requirePermission("marketing.read");
  if (!gate.ok) return null;
  const [row] = await db.select().from(campaigns).where(eq(campaigns.slug, "amazing")).limit(1);
  return row ?? null;
}

const campaignSchema = z.object({
  title: z.string().trim().min(2).max(200),
  active: z.coerce.boolean().default(true),
  endsAt: z.string().trim().max(30).nullable().optional(),
});

export async function saveCampaign(input: z.input<typeof campaignSchema>): Promise<ActionRes<null>> {
  const gate = await requirePermission("marketing.write");
  if (!gate.ok) return gate;
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  let endsAt: Date | null = null;
  if (parsed.data.endsAt) {
    endsAt = new Date(parsed.data.endsAt);
    if (Number.isNaN(endsAt.getTime())) return { ok: false, error: "تاریخ پایان نامعتبر است" };
  }
  try {
    const result = await db.update(campaigns).set({ title: parsed.data.title, active: parsed.data.active, endsAt }).where(eq(campaigns.slug, "amazing"));
    if (isEmptyUpdateResult(result)) return { ok: false, error: "کمپین پیدا نشد" };
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/marketing");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ذخیره ناموفق بود" };
  }
}

export type { BannerSlot };