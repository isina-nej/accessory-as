import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, productImages, products } from "@/db/schema";

export type MegaMenuData = {
  cats: { slug: string; title: string }[];
  byCat: Record<string, { id: string; slug: string; title: string }[]>;
};

export async function getMegaMenu(): Promise<MegaMenuData> {
  const cats = await db.select().from(categories).orderBy(asc(categories.title));
  const byCat: MegaMenuData["byCat"] = {};
  await Promise.all(
    cats.map(async (c) => {
      const rows = await db
        .select({ id: products.id, slug: products.slug, title: products.title })
        .from(products)
        .where(eq(products.categoryId, c.id))
        .orderBy(desc(products.createdAt))
        .limit(3);
      byCat[c.slug] = rows;
    }),
  );
  return { cats: cats.map((c) => ({ slug: c.slug, title: c.title })), byCat };
}

export async function getCartLines(ids: string[]) {
  if (ids.length === 0) return [];
  const { inArray } = await import("drizzle-orm");
  const rows = await db.select().from(products).where(inArray(products.id, ids.slice(0, 50)));
  const out = await Promise.all(
    rows.map(async (r) => {
      const [img] = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, r.id))
        .orderBy(asc(productImages.sort))
        .limit(1);
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        price: r.priceToman,
        oldPrice: r.oldPriceToman,
        stock: r.stock,
        sku: r.sku,
        image: img?.url ?? null,
      };
    }),
  );
  return out;
}
