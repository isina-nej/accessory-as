"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";

const reviewSchema = z.object({
  author: z.string().trim().min(2, "نام کوتاه است").max(100),
  rating: z.coerce.number().int().min(1, "امتیاز ۱ تا ۵").max(5, "امتیاز ۱ تا ۵"),
  body: z.string().trim().min(3, "متن کوتاه است").max(2000),
});

export async function submitReview(
  slug: string,
  input: { author: string; rating: number; body: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  let productId: string | null = null;
  try {
    const [row] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
    productId = row?.id ?? null;
  } catch {
    return { ok: false, error: "دیتابیس در دسترس نیست" };
  }
  if (!productId) return { ok: false, error: "محصول پیدا نشد" };
  try {
    await db.insert(reviews).values({
      productId,
      author: parsed.data.author,
      rating: parsed.data.rating,
      body: parsed.data.body,
    });
    revalidatePath(`/products/${slug}`);
    return { ok: true };
  } catch {
    return { ok: false, error: "ثبت دیدگاه ناموفق بود" };
  }
}
