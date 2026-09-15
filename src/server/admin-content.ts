"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { banners, campaigns, contactMessages, coupons, faqs, pages, reviews, settings, shippingMethods } from "@/db/schema";
import type { ActionRes } from "../lib/address-actions";
import { requireStaff } from "./staff";

// --- بنرها (content) ---
const bannerSchema = z.object({
  slot: z.enum(["hero", "offer-side", "mid-a", "mid-b", "shine"]),
  title: z.string().trim().min(2, "تیتر کوتاه است").max(200),
  subtitle: z.string().trim().max(1000).nullable().optional(),
  ctaLabel: z.string().trim().max(100).nullable().optional(),
  ctaHref: z.string().trim().max(300).nullable().optional(),
  imageUrl: z.string().trim().max(500).nullable().optional(),
  sort: z.coerce.number().int().min(0).max(999).default(0),
  active: z.coerce.boolean().default(true),
});

export async function listBanners() {
  const gate = await requireStaff("content");
  if (!gate.ok) return [];
  return db.select().from(banners);
}

export async function saveBanner(id: string | null, input: z.infer<typeof bannerSchema>): Promise<ActionRes<string>> {
  const gate = await requireStaff("content");
  if (!gate.ok) return gate;
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  try {
    const d = { ...parsed.data, subtitle: parsed.data.subtitle || null, ctaLabel: parsed.data.ctaLabel || null, ctaHref: parsed.data.ctaHref || null, imageUrl: parsed.data.imageUrl || null };
    if (id) {
      await db.update(banners).set(d).where(eq(banners.id, id));
    } else {
      const nid = crypto.randomUUID();
      await db.insert(banners).values({ id: nid, ...d });
      id = nid;
    }
    revalidatePath("/");
    revalidatePath("/admin/content");
    return { ok: true, data: id };
  } catch {
    return { ok: false, error: "ذخیره ناموفق بود" };
  }
}

export async function deleteBanner(id: string): Promise<ActionRes<null>> {
  const gate = await requireStaff("content");
  if (!gate.ok) return gate;
  try {
    await db.delete(banners).where(eq(banners.id, id));
    revalidatePath("/");
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
  const gate = await requireStaff("content");
  if (!gate.ok) return [];
  return db.select().from(pages);
}

export async function savePage(slug: string, input: z.infer<typeof pageSchema>): Promise<ActionRes<null>> {
  const gate = await requireStaff("content");
  if (!gate.ok) return gate;
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  try {
    await db.update(pages).set({
      title: parsed.data.title, body: parsed.data.body,
      seoTitle: parsed.data.seoTitle || null, seoDesc: parsed.data.seoDesc || null,
    }).where(eq(pages.slug, slug));
    revalidatePath(`/${slug === "about" ? "about" : slug}`);
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
  const gate = await requireStaff("content");
  if (!gate.ok) return [];
  return db.select().from(faqs);
}

export async function saveFaq(id: string | null, input: z.infer<typeof faqSchema>): Promise<ActionRes<string>> {
  const gate = await requireStaff("content");
  if (!gate.ok) return gate;
  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  try {
    if (id) await db.update(faqs).set(parsed.data).where(eq(faqs.id, id));
    else {
      const nid = crypto.randomUUID();
      await db.insert(faqs).values({ id: nid, ...parsed.data });
      id = nid;
    }
    revalidatePath("/faq");
    revalidatePath("/admin/content");
    return { ok: true, data: id };
  } catch {
    return { ok: false, error: "ذخیره ناموفق بود" };
  }
}

export async function deleteFaq(id: string): Promise<ActionRes<null>> {
  const gate = await requireStaff("content");
  if (!gate.ok) return gate;
  try {
    await db.delete(faqs).where(eq(faqs.id, id));
    revalidatePath("/faq");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

// --- تنظیمات (admin) ---
export async function listSettings(keys?: string[]) {
  const gate = await requireStaff("admin");
  if (!gate.ok) return [];
  const rows = await db.select().from(settings);
  return keys ? rows.filter((r) => keys.includes(r.key)) : rows;
}

export async function saveSettings(input: Record<string, string>): Promise<ActionRes<null>> {
  const gate = await requireStaff("admin");
  if (!gate.ok) return gate;
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    if (!/^[a-z0-9_]{2,100}$/.test(k)) continue;
    clean[k] = String(v ?? "").slice(0, 5000);
  }
  if (Object.keys(clean).length === 0) return { ok: false, error: "ورودی نامعتبر" };
  try {
    for (const [key, value] of Object.entries(clean)) {
      await db.insert(settings).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
    }
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ذخیره ناموفق بود" };
  }
}

// --- پیام‌ها (support) ---
export async function listMessages(unreadOnly: boolean) {
  const gate = await requireStaff("support");
  if (!gate.ok) return [];
  const { desc } = await import("drizzle-orm");
  const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(100);
  return unreadOnly ? rows.filter((r) => !r.read) : rows;
}

export async function markMessage(id: string, read: boolean): Promise<ActionRes<null>> {
  const gate = await requireStaff("support");
  if (!gate.ok) return gate;
  try {
    await db.update(contactMessages).set({ read }).where(eq(contactMessages.id, id));
    revalidatePath("/admin/messages");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ناموفق بود" };
  }
}

// --- دیدگاه‌ها (support/content) ---
export async function listAdminReviews(pendingOnly: boolean) {
  const gate = await requireStaff("support");
  if (!gate.ok) return [];
  const { desc } = await import("drizzle-orm");
  const rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(100);
  return pendingOnly ? rows.filter((r) => !r.verified) : rows;
}

export async function setReviewVerified(id: string, verified: boolean): Promise<ActionRes<null>> {
  const gate = await requireStaff("support");
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
  const gate = await requireStaff("support");
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
});

export async function listCoupons() {
  const gate = await requireStaff("admin");
  if (!gate.ok) return [];
  return db.select().from(coupons);
}

export async function saveCoupon(id: string | null, input: z.infer<typeof couponSchema>): Promise<ActionRes<string>> {
  const gate = await requireStaff("admin");
  if (!gate.ok) return gate;
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  try {
    const d = { ...parsed.data, maxToman: parsed.data.maxToman ?? null, minToman: parsed.data.minToman ?? null };
    if (id) await db.update(coupons).set(d).where(eq(coupons.id, id));
    else {
      const nid = crypto.randomUUID();
      await db.insert(coupons).values({ id: nid, ...d });
      id = nid;
    }
    revalidatePath("/admin/marketing");
    return { ok: true, data: id };
  } catch {
    return { ok: false, error: "کد تکراری است" };
  }
}

export async function deleteCoupon(id: string): Promise<ActionRes<null>> {
  const gate = await requireStaff("admin");
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
  slug: z.string().trim().min(2).max(50).regex(/^[a-z0-9-]+$/),
  feeToman: z.coerce.number().int().min(0).max(99999999),
  freeOverToman: z.coerce.number().int().min(0).max(999999999).nullable().optional(),
});

export async function listShipping() {
  const gate = await requireStaff("admin");
  if (!gate.ok) return [];
  return db.select().from(shippingMethods);
}

export async function saveShipping(id: string | null, input: z.infer<typeof shipSchema>): Promise<ActionRes<string>> {
  const gate = await requireStaff("admin");
  if (!gate.ok) return gate;
  const parsed = shipSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  try {
    const d = { ...parsed.data, freeOverToman: parsed.data.freeOverToman ?? null };
    if (id) await db.update(shippingMethods).set(d).where(eq(shippingMethods.id, id));
    else {
      const nid = crypto.randomUUID();
      await db.insert(shippingMethods).values({ id: nid, ...d });
      id = nid;
    }
    revalidatePath("/admin/marketing");
    return { ok: true, data: null as unknown as string };
  } catch {
    return { ok: false, error: "اسلاگ تکراری است" };
  }
}

export async function getCampaign() {
  const gate = await requireStaff("admin");
  if (!gate.ok) return null;
  const [row] = await db.select().from(campaigns).where(eq(campaigns.slug, "amazing")).limit(1);
  return row ?? null;
}

const campaignSchema = z.object({
  title: z.string().trim().min(2).max(200),
  active: z.coerce.boolean().default(true),
  endsAt: z.string().trim().max(30).nullable().optional(),
});

export async function saveCampaign(input: z.infer<typeof campaignSchema>): Promise<ActionRes<null>> {
  const gate = await requireStaff("admin");
  if (!gate.ok) return gate;
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "ورودی نامعتبر" };
  try {
    const endsAt = parsed.data.endsAt ? new Date(parsed.data.endsAt) : null;
    if (parsed.data.endsAt && Number.isNaN(endsAt?.getTime())) return { ok: false, error: "تاریخ نامعتبر" };
    await db.update(campaigns).set({ title: parsed.data.title, active: parsed.data.active, endsAt }).where(eq(campaigns.slug, "amazing"));
    revalidatePath("/");
    revalidatePath("/admin/marketing");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "ذخیره ناموفق بود" };
  }
}
