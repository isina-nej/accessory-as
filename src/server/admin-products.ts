"use server";

import { revalidatePath } from "next/cache";
import { and, asc, count, desc, eq, gt, gte, inArray, like, lte, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { attributes, categories, orderItems, productAttributes, productImages, products } from "@/db/schema";
import type { ActionRes } from "../lib/address-actions";
import { requirePermission } from "./staff";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const productSchema = z.object({
  title: z.string().trim().min(2, "نام کوتاه است").max(200),
  slug: z.string().trim().min(2, "اسلاگ کوتاه است").max(150).regex(/^[a-z0-9-]+$/, "اسلاگ فقط حروف کوچک، عدد و خط‌تیره"),
  categoryId: z.string().trim().max(100).nullable().optional().transform((v) => {
    if (!v) return null;
    return /^[0-9a-f-]{36}$/i.test(v) ? v : null;
  }),
  priceToman: z.coerce.number().int().min(0, "قیمت نامعتبر").max(999999999),
  oldPriceToman: z.coerce.number().int().min(0).max(999999999).nullable().optional(),
  discountPct: z.coerce.number().int().min(0).max(90).nullable().optional(),
  stock: z.coerce.number().int().min(0).max(999999),
  status: z.enum(["active", "draft", "archived"]),
  sku: z.string().trim().max(50).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  colors: z.array(z.string().max(50)).max(20).default([]),
  sizes: z.array(z.string().max(10)).max(20).default([]),
  imageUrl: z.string().trim().max(500).nullable().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

async function linkAttrs(tx: Tx, productId: string, colors: string[], sizes: string[]) {
  await tx.delete(productAttributes).where(eq(productAttributes.productId, productId));
  const names = [...colors, ...sizes];
  if (names.length === 0) return;
  const rows = await tx.select().from(attributes);
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const n of names) {
    const found = rows.find((a) => a.label === n || a.value === n)?.id;
    if (found && !seen.has(found)) {
      seen.add(found);
      ids.push(found);
    }
  }
  if (ids.length > 0) await tx.insert(productAttributes).values(ids.map((attributeId) => ({ productId, attributeId })));
}

async function setPrimaryImage(tx: Tx, productId: string, imageUrl: string) {
  const existing = await tx.select({ id: productImages.id }).from(productImages).where(eq(productImages.productId, productId)).limit(1);
  if (existing.length === 0) {
    await tx.insert(productImages).values({ productId, url: imageUrl, sort: 0 });
  } else {
    await tx.update(productImages).set({ url: imageUrl }).where(eq(productImages.id, existing[0].id));
  }
}

export type AdminProductFilters = {
  q?: string;
  status?: string;
  categoryId?: string;
  stock?: "all" | "available" | "low" | "out";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
};

export async function listAdminProducts(filters: AdminProductFilters = {}) {
  const gate = await requirePermission("products.read");
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const pageSize = Math.min(50, Math.max(1, Math.floor(filters.pageSize ?? 20)));
  if (!gate.ok) return { items: [], total: 0, page, pageSize };

  const conditions = [];
  const q = filters.q?.trim();
  if (q) conditions.push(or(like(products.title, `%${q}%`), like(products.slug, `%${q}%`), like(products.sku, `%${q}%`)));
  if (filters.status && ["active", "draft", "archived"].includes(filters.status)) conditions.push(eq(products.status, filters.status));
  if (filters.categoryId) conditions.push(eq(products.categoryId, filters.categoryId));
  if (filters.stock === "available") conditions.push(gt(products.stock, 0));
  if (filters.stock === "low") conditions.push(and(gt(products.stock, 0), lte(products.stock, 3)));
  if (filters.stock === "out") conditions.push(eq(products.stock, 0));
  if (Number.isFinite(filters.minPrice)) conditions.push(gte(products.priceToman, Number(filters.minPrice)));
  if (Number.isFinite(filters.maxPrice)) conditions.push(lte(products.priceToman, Number(filters.maxPrice)));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(products).where(where);
  const rows = await db
    .select({
      id: products.id,
      title: products.title,
      slug: products.slug,
      categoryId: products.categoryId,
      priceToman: products.priceToman,
      oldPriceToman: products.oldPriceToman,
      discountPct: products.discountPct,
      stock: products.stock,
      status: products.status,
      sku: products.sku,
      soldCount: products.soldCount,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(where)
    .orderBy(desc(products.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const catIds = [...new Set(rows.map((r) => r.categoryId).filter((id): id is string => Boolean(id)))];
  const catRows = catIds.length ? await db.select({ id: categories.id, title: categories.title }).from(categories).where(inArray(categories.id, catIds)) : [];
  const catTitle = new Map(catRows.map((c) => [c.id, c.title]));
  return { items: rows.map((r) => ({ ...r, categoryTitle: r.categoryId ? catTitle.get(r.categoryId) ?? null : null })), total: Number(n), page, pageSize };
}

export async function getAdminProduct(id: string) {
  const gate = await requirePermission("products.read");
  if (!gate.ok) return null;
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!row) return null;
  const imgs = await db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.sort));
  const links = await db.select().from(productAttributes).where(eq(productAttributes.productId, id));
  return { ...row, images: imgs, attributeIds: links.map((l) => l.attributeId) };
}

export async function saveProduct(id: string | null, input: ProductInput): Promise<ActionRes<string>> {
  const gate = await requirePermission("products.write");
  if (!gate.ok) return gate;
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  const d = parsed.data;
  try {
    const productId = await db.transaction(async (tx) => {
      if (d.categoryId) {
        const [cat] = await tx.select({ id: categories.id }).from(categories).where(eq(categories.id, d.categoryId!)).limit(1);
        if (!cat) throw new Error("CATEGORY_NOT_FOUND");
      }
      if (id) {
        const [existing] = await tx.select({ id: products.id }).from(products).where(eq(products.id, id)).limit(1);
        if (!existing) throw new Error("PRODUCT_NOT_FOUND");
        await tx
          .update(products)
          .set({
            title: d.title, slug: d.slug, categoryId: d.categoryId ?? null,
            priceToman: d.priceToman, oldPriceToman: d.oldPriceToman ?? null,
            discountPct: d.discountPct ?? null, stock: d.stock, status: d.status,
            sku: d.sku || null, description: d.description || null,
          })
          .where(eq(products.id, id));
        await linkAttrs(tx, id, d.colors, d.sizes);
        if (d.imageUrl) await setPrimaryImage(tx, id, d.imageUrl);
        return id;
      }
      const pid = crypto.randomUUID();
      await tx.insert(products).values({
        id: pid, title: d.title, slug: d.slug, categoryId: d.categoryId ?? null,
        priceToman: d.priceToman, oldPriceToman: d.oldPriceToman ?? null,
        discountPct: d.discountPct ?? null, stock: d.stock, status: d.status,
        sku: d.sku || null, description: d.description || null,
      });
      await linkAttrs(tx, pid, d.colors, d.sizes);
      if (d.imageUrl) await setPrimaryImage(tx, pid, d.imageUrl);
      return pid;
    });
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { ok: true, data: productId };
  } catch (e) {
    if (e instanceof Error && e.message === "CATEGORY_NOT_FOUND") return { ok: false, error: "دسته انتخاب‌شده وجود ندارد" };
    if (e instanceof Error && e.message === "PRODUCT_NOT_FOUND") return { ok: false, error: "محصول پیدا نشد" };
    const msg = e instanceof Error && e.message.includes("Duplicate") ? "اسلاگ تکراری است" : "ذخیره ناموفق بود";
    return { ok: false, error: msg };
  }
}

export async function deleteProduct(id: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("products.write");
  if (!gate.ok) return gate;
  try {
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(orderItems).where(eq(orderItems.productId, id));
    if (Number(n) > 0) return { ok: false, error: "این محصول در سفارش‌ها استفاده شده؛ به‌جای حذف آن را بایگانی کنید" };
    await db.transaction(async (tx) => {
      await tx.delete(productAttributes).where(eq(productAttributes.productId, id));
      await tx.delete(productImages).where(eq(productImages.productId, id));
      await tx.delete(products).where(eq(products.id, id));
    });
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

export async function archiveProduct(id: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("products.write");
  if (!gate.ok) return gate;
  try {
    await db.update(products).set({ status: "archived" }).where(eq(products.id, id));
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "بایگانی ناموفق بود" };
  }
}

export async function adjustStock(id: string, delta: number): Promise<ActionRes<number>> {
  const gate = await requirePermission("products.write");
  if (!gate.ok) return gate;
  if (!Number.isInteger(delta) || Math.abs(delta) > 100000) return { ok: false, error: "مقدار نامعتبر" };
  try {
    const next = await db.transaction(async (tx) => {
      const [row] = await tx.select({ stock: products.stock }).from(products).where(eq(products.id, id)).limit(1);
      if (!row) throw new Error("NOT_FOUND");
      const value = Math.max(0, row.stock + delta);
      await tx.update(products).set({ stock: value }).where(eq(products.id, id));
      return value;
    });
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { ok: true, data: next };
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") return { ok: false, error: "محصول پیدا نشد" };
    return { ok: false, error: "ناموفق بود" };
  }
}

const catSchema = z.object({
  title: z.string().trim().min(2, "نام کوتاه است").max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/, "اسلاگ فقط حروف کوچک، عدد و خط‌تیره"),
  parentId: z.string().trim().max(100).nullable().optional().transform((v) => {
    if (!v) return null;
    return /^[0-9a-f-]{36}$/i.test(v) ? v : null;
  }),
});

export async function listAdminCats() {
  const gate = await requirePermission("categories.read");
  if (!gate.ok) return [];
  const rows = await db.select().from(categories).orderBy(asc(categories.title));
  const counts = await db.select({ cid: products.categoryId, n: sql<number>`count(*)` }).from(products).groupBy(products.categoryId);
  const byId = new Map(counts.map((c) => [c.cid, Number(c.n)]));
  return rows.map((c) => ({ ...c, count: byId.get(c.id) ?? 0 }));
}

export async function saveCategory(id: string | null, input: { title: string; slug: string; parentId?: string | null }): Promise<ActionRes<string>> {
  const gate = await requirePermission("categories.write");
  if (!gate.ok) return gate;
  const parsed = catSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  const d = parsed.data;
  if (id && d.parentId === id) return { ok: false, error: "یک دسته نمی‌تواند والد خودش باشد" };
  try {
    const catId = await db.transaction(async (tx) => {
      if (d.parentId) {
        const [parent] = await tx.select({ id: categories.id }).from(categories).where(eq(categories.id, d.parentId!)).limit(1);
        if (!parent) throw new Error("PARENT_NOT_FOUND");
        const descendants = id ? await descendantsOf(tx, id) : [];
        if (id && descendants.includes(d.parentId!)) throw new Error("PARENT_CYCLE");
      }
      if (id) {
        const [existing] = await tx.select({ id: categories.id }).from(categories).where(eq(categories.id, id)).limit(1);
        if (!existing) throw new Error("CATEGORY_NOT_FOUND");
        await tx.update(categories).set({ title: d.title, slug: d.slug, parentId: d.parentId ?? null }).where(eq(categories.id, id));
        return id;
      }
      const cid = crypto.randomUUID();
      await tx.insert(categories).values({ id: cid, title: d.title, slug: d.slug, parentId: d.parentId ?? null });
      return cid;
    });
    revalidatePath("/shop");
    revalidatePath("/admin/categories");
    return { ok: true, data: catId };
  } catch (e) {
    if (e instanceof Error && e.message === "PARENT_NOT_FOUND") return { ok: false, error: "دسته والد انتخاب‌شده وجود ندارد" };
    if (e instanceof Error && e.message === "PARENT_CYCLE") return { ok: false, error: "انتخاب این والد باعث حلقه در درخت دسته‌ها می‌شود" };
    if (e instanceof Error && e.message === "CATEGORY_NOT_FOUND") return { ok: false, error: "دسته پیدا نشد" };
    const msg = e instanceof Error && e.message.includes("Duplicate") ? "اسلاگ تکراری است" : "ذخیره ناموفق بود";
    return { ok: false, error: msg };
  }
}

async function descendantsOf(tx: Tx, rootId: string): Promise<string[]> {
  const result: string[] = [];
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = await tx.select({ id: categories.id }).from(categories).where(eq(categories.parentId, current));
    for (const child of children) {
      if (!result.includes(child.id)) {
        result.push(child.id);
        queue.push(child.id);
      }
    }
  }
  return result;
}

export async function deleteCategory(id: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("categories.write");
  if (!gate.ok) return gate;
  try {
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(products).where(eq(products.categoryId, id));
    if (Number(n) > 0) return { ok: false, error: "این دسته محصول دارد؛ اول محصولات را جابه‌جا کنید" };
    const [{ n: childCount }] = await db.select({ n: sql<number>`count(*)` }).from(categories).where(eq(categories.parentId, id));
    if (Number(childCount) > 0) return { ok: false, error: "این دسته زیردسته دارد؛ اول زیردسته‌ها را حذف کنید" };
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/shop");
    revalidatePath("/admin/categories");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

export async function listAttrOptions() {
  const gate = await requirePermission("attributes.read");
  if (!gate.ok) return { colors: [], sizes: [] } as { colors: string[]; sizes: string[] };
  const rows = await db.select().from(attributes).where(inArray(attributes.type, ["color", "size"])).orderBy(asc(attributes.type), asc(attributes.label));
  return {
    colors: [...new Set(rows.filter((a) => a.type === "color").map((a) => a.label))],
    sizes: [...new Set(rows.filter((a) => a.type === "size").map((a) => a.value))],
  };
}

export async function getProductAttrNames(id: string): Promise<{ colors: string[]; sizes: string[] }> {
  const gate = await requirePermission("attributes.read");
  if (!gate.ok) return { colors: [], sizes: [] };
  const links = await db.select().from(productAttributes).where(eq(productAttributes.productId, id));
  if (links.length === 0) return { colors: [], sizes: [] };
  const rows = await db.select().from(attributes).where(inArray(attributes.id, links.map((l) => l.attributeId)));
  return {
    colors: rows.filter((a) => a.type === "color").map((a) => a.label),
    sizes: rows.filter((a) => a.type === "size").map((a) => a.value),
  };
}

export type AdminAttribute = { id: string; type: string; label: string; value: string; productCount: number };

export async function listAdminAttributes(): Promise<AdminAttribute[]> {
  const gate = await requirePermission("attributes.read");
  if (!gate.ok) return [];
  const rows = await db.select().from(attributes).orderBy(asc(attributes.type), asc(attributes.label));
  const links = await db.select({ attributeId: productAttributes.attributeId, n: sql<number>`count(*)` }).from(productAttributes).groupBy(productAttributes.attributeId);
  const byAttr = new Map(links.map((l) => [l.attributeId, Number(l.n)]));
  return rows.map((r) => ({ ...r, productCount: byAttr.get(r.id) ?? 0 }));
}

const attrSchema = z.object({
  type: z.enum(["color", "size"]),
  label: z.string().trim().min(1, "برچسب لازم است").max(50),
  value: z.string().trim().min(1, "مقدار لازم است").max(50),
});

export async function saveAttribute(id: string | null, input: z.input<typeof attrSchema>): Promise<ActionRes<string>> {
  const gate = await requirePermission("attributes.write");
  if (!gate.ok) return gate;
  const parsed = attrSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  const d = parsed.data;
  if (d.type === "size" && d.label !== d.value) return { ok: false, error: "برای سایز، برچسب و مقدار باید یکسان باشند" };
  try {
    const attrId = await db.transaction(async (tx) => {
      if (id) {
        const [existing] = await tx.select({ id: attributes.id }).from(attributes).where(eq(attributes.id, id)).limit(1);
        if (!existing) throw new Error("ATTRIBUTE_NOT_FOUND");
        await tx.update(attributes).set(d).where(eq(attributes.id, id));
        return id;
      }
      const nid = crypto.randomUUID();
      await tx.insert(attributes).values({ id: nid, ...d });
      return nid;
    });
    revalidatePath("/admin/attributes");
    revalidatePath("/admin/products");
    return { ok: true, data: attrId };
  } catch (e) {
    if (e instanceof Error && e.message === "ATTRIBUTE_NOT_FOUND") return { ok: false, error: "ویژگی پیدا نشد" };
    return { ok: false, error: "ذخیره ناموفق بود" };
  }
}

export async function deleteAttribute(id: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("attributes.write");
  if (!gate.ok) return gate;
  try {
    const result = await db.transaction(async (tx) => {
      const [{ n }] = await tx.select({ n: count() }).from(productAttributes).where(eq(productAttributes.attributeId, id));
      if (Number(n) > 0) return { ok: false as const, error: "این ویژگی به محصولات وصل است؛ اول اتصال‌ها را حذف کنید" };
      const [existing] = await tx.select({ id: attributes.id }).from(attributes).where(eq(attributes.id, id)).limit(1);
      if (!existing) return { ok: false as const, error: "ویژگی پیدا نشد" };
      await tx.delete(attributes).where(eq(attributes.id, id));
      return { ok: true as const };
    });
    if (!result.ok) return result;
    revalidatePath("/admin/attributes");
    revalidatePath("/admin/products");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

export async function deleteProductImage(imageId: string, productId: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("products.write");
  if (!gate.ok) return gate;
  try {
    await db.delete(productImages).where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/products");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

export async function addProductImage(productId: string, url: string): Promise<ActionRes<null>> {
  const gate = await requirePermission("products.write");
  if (!gate.ok) return gate;
  if (!url.trim() || url.length > 500) return { ok: false, error: "لینک تصویر نامعتبر است" };
  try {
    await db.transaction(async (tx) => {
      const [product] = await tx.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
      if (!product) throw new Error("PRODUCT_NOT_FOUND");
      const [{ n }] = await tx.select({ n: sql<number>`count(*)` }).from(productImages).where(eq(productImages.productId, productId));
      await tx.insert(productImages).values({ productId, url: url.trim(), sort: Number(n) });
    });
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/admin/products");
    return { ok: true, data: null };
  } catch (e) {
    if (e instanceof Error && e.message === "PRODUCT_NOT_FOUND") return { ok: false, error: "محصول پیدا نشد" };
    return { ok: false, error: "افزودن تصویر ناموفق بود" };
  }
}

export async function moveProductImage(imageId: string, productId: string, direction: -1 | 1): Promise<ActionRes<null>> {
  const gate = await requirePermission("products.write");
  if (!gate.ok) return gate;
  try {
    const images = await db.select({ id: productImages.id, sort: productImages.sort }).from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.sort));
    const index = images.findIndex((i) => i.id === imageId);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= images.length) return { ok: false, error: "جابه‌جایی ممکن نیست" };
    const a = images[index];
    const b = images[swapWith];
    const sortA = a.sort;
    const sortB = b.sort;
    await db.transaction(async (tx) => {
      await tx.update(productImages).set({ sort: sortB === sortA ? sortA + 1 : sortB }).where(eq(productImages.id, a.id));
      await tx.update(productImages).set({ sort: sortA }).where(eq(productImages.id, b.id));
    });
    revalidatePath(`/admin/products/${productId}`);
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "جابه‌جایی ناموفق بود" };
  }
}

export async function listProductOrderRefs(productId: string): Promise<number> {
  const gate = await requirePermission("products.read");
  if (!gate.ok) return 0;
  const [{ n }] = await db.select({ n: count() }).from(orderItems).where(eq(orderItems.productId, productId));
  return Number(n);
}