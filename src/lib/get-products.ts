import { and, asc, desc, eq, gte, like, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { attributes, categories, productAttributes, productImages, products, reviews } from "@/db/schema";
import { PAGE_SIZE, type ShopProduct, type ShopQuery } from "./products";
import { shopImage } from "./shop-images";

export async function getProducts(q: ShopQuery): Promise<{ items: ShopProduct[]; total: number }> {
  const conds = [eq(products.status, "active")];
  if (q.q) conds.push(like(products.title, `%${q.q}%`));
  if (q.inStock) conds.push(sql`${products.stock} > 0`);
  conds.push(gte(products.priceToman, q.min), lte(products.priceToman, q.max));

  if (q.cat) {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, q.cat)).limit(1);
    conds.push(eq(products.categoryId, cat?.id ?? "__none__"));
  }

  // Separate EXISTS clauses: color and size must each match an attribute on the same product.
  for (const [type, value] of [["color", q.color], ["size", q.size]]) {
    if (!value) continue;
    conds.push(sql`exists (
      select 1 from ${productAttributes}
      join ${attributes} on ${attributes.id} = ${productAttributes.attributeId}
      where ${productAttributes.productId} = ${products.id}
        and ${attributes.type} = ${type} and ${attributes.value} = ${value}
    )`);
  }

  const order =
    q.sort === "cheap"
      ? asc(products.priceToman)
      : q.sort === "expensive"
        ? desc(products.priceToman)
        : q.sort === "popular"
          ? desc(products.soldCount)
          : desc(products.createdAt);

  const where = and(...conds);
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(products)
    .where(where);
  const rows = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(order)
    .limit(PAGE_SIZE)
    .offset((q.page - 1) * PAGE_SIZE);

  const items: ShopProduct[] = await Promise.all(
    rows.map(async (r) => {
      const [img] = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, r.id))
        .orderBy(asc(productImages.sort))
        .limit(1);
      return { ...r, image: img?.url ?? shopImage(r.slug) };
    }),
  );
  return { items, total: Number(n) };
}

export async function getOffers(): Promise<ShopProduct[]> {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.status, "active"), sql`${products.discountPct} > 0`))
    .orderBy(desc(products.discountPct))
    .limit(5);
  return Promise.all(rows.map(async (r) => {
    const [img] = await db.select().from(productImages).where(eq(productImages.productId, r.id)).orderBy(asc(productImages.sort)).limit(1);
    return { ...r, image: img?.url ?? shopImage(r.slug) };
  })); // ponytail: use bundled seeded images until product_images is populated.
}

export async function getFilterMeta() {
  const cats = await db.select().from(categories);
  const attrs = await db.select().from(attributes);
  return {
    cats,
    colors: attrs.filter((a) => a.type === "color"),
    sizes: attrs.filter((a) => a.type === "size"),
  };
}

export async function getProductBySlug(slug: string) {
  const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!row || row.status !== "active") return null;
  const imgs = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, row.id))
    .orderBy(asc(productImages.sort));
  const [cat] = row.categoryId
    ? await db.select().from(categories).where(eq(categories.id, row.categoryId)).limit(1)
    : [undefined];
  const links = await db
    .select({ attributeId: productAttributes.attributeId })
    .from(productAttributes)
    .where(eq(productAttributes.productId, row.id));
  const attrs =
    links.length > 0
      ? await db.select().from(attributes).where(
          sql`${attributes.id} IN (${sql.join(links.map((l) => sql`${l.attributeId}`), sql`, `)})`,
        )
      : [];
  const [cover] = imgs;
  return {
    ...row,
    image: cover?.url ?? shopImage(row.slug),
    images: imgs.map((i) => i.url),
    categoryTitle: cat?.title ?? null,
    colors: attrs.filter((a) => a.type === "color"),
    sizes: attrs.filter((a) => a.type === "size"),
  };
}

export async function getRelated(categoryId: string | null, excludeId: string): Promise<ShopProduct[]> {
  if (!categoryId) return [];
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.status, "active"), eq(products.categoryId, categoryId)))
    .orderBy(desc(products.createdAt))
    .limit(5);
  const filtered = rows.filter((r) => r.id !== excludeId).slice(0, 4);
  return Promise.all(
    filtered.map(async (r) => {
      const [img] = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, r.id))
        .orderBy(asc(productImages.sort))
        .limit(1);
      return { ...r, image: img?.url ?? shopImage(r.slug) };
    }),
  );
}

export type ProductReview = typeof reviews.$inferSelect;

export async function getReviews(productId: string, limit = 10): Promise<ProductReview[]> {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt))
    .limit(limit);
}

export async function getRatingSummary(productId: string): Promise<{ avg: number; count: number }> {
  const [row] = await db
    .select({ avg: sql<number | null>`avg(${reviews.rating})`, count: sql<number>`count(*)` })
    .from(reviews)
    .where(eq(reviews.productId, productId));
  return { avg: row?.avg == null ? 0 : Number(row.avg), count: Number(row?.count ?? 0) };
}
