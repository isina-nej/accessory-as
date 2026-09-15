import type { MetadataRoute } from "next";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.5 },
  ];
  try {
    const rows = await db
      .select({ slug: products.slug })
      .from(products)
      .where(eq(products.status, "active"))
      .limit(500);
    for (const r of rows) {
      urls.push({ url: `${base}/products/${r.slug}`, changeFrequency: "weekly", priority: 0.8 });
    }
  } catch {
    // بیلد بدون DB هم سبز بماند
  }
  return urls;
}
