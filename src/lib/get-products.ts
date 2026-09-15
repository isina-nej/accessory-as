import { and, asc, desc, eq, gte, like, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { attributes, categories, productAttributes, productImages, products } from "@/db/schema";
import { PAGE_SIZE, type ShopProduct, type ShopQuery } from "./products";

export async function getProducts(q: ShopQuery): Promise<{ items: ShopProduct[]; total: number }> {
  const conds = [eq(products.status, "active")];
  if (q.q) conds.push(like(products.title, `%${q.q}%`));
  if (q.inStock) conds.push(sql`${products.stock} > 0`);
  conds.push(gte(products.priceToman, q.min), lte(products.priceToman, q.max));

  if (q.cat) {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, q.cat)).limit(1);
    conds.push(eq(products.categoryId, cat?.id ?? "__none__"));
  }

  if (q.color || q.size) {
    const attrConds = [];
    if (q.color) attrConds.push(eq(attributes.label, q.color));
    if (q.size) attrConds.push(eq(attributes.value, q.size));
    const matched = await db.select({ id: attributes.id }).from(attributes).where(and(...attrConds));
    const ids = matched.map((m) => m.id);
    if (ids.length === 0) return { items: [], total: 0 };
    const links = await db
      .select({ productId: productAttributes.productId })
      .from(productAttributes)
      .where(sql`${productAttributes.attributeId} IN (${sql.join(ids.map((i) => sql`${i}`), sql`, `)})`);
    const pids = [...new Set(links.map((l) => l.productId))];
    if (pids.length === 0) return { items: [], total: 0 };
    conds.push(sql`${products.id} IN (${sql.join(pids.map((i) => sql`${i}`), sql`, `)})`);
  }

  const order =
    q.sort === "cheap"
      ? asc(products.priceToman)
      : q.sort === "expensive"
        ? desc(products.priceToman)
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
      return { ...r, image: img?.url ?? null };
    }),
  );
  return { items, total: Number(n) };
}

export async function getOffers(): Promise<ShopProduct[]> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.status, "active"))
    .orderBy(desc(products.discountPct))
    .limit(5);
  return rows.map((r) => ({ ...r, image: null }));
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
