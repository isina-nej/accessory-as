import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { banners, campaigns, settings } from "@/db/schema";

export type PublicBanner = typeof banners.$inferSelect;

export async function getPublicBanners(): Promise<Record<string, PublicBanner>> {
  try {
    const rows = await db
      .select()
      .from(banners)
      .where(eq(banners.active, true))
      .orderBy(asc(banners.sort));
    const bySlot: Record<string, PublicBanner> = {};
    for (const b of rows) {
      if (!bySlot[b.slot]) bySlot[b.slot] = b;
    }
    return bySlot;
  } catch {
    return {};
  }
}

export async function getPublicSettings(): Promise<Record<string, string>> {
  try {
    const rows = await db.select().from(settings);
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return {};
  }
}

export async function getPublicCampaign() {
  try {
    const [row] = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.slug, "amazing"))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}
