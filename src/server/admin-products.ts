"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { categories, productAttributes, productImages, products } from "@/db/schema";
import type { ActionRes } from "../lib/address-actions";
import { requireStaff } from "./staff";

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

async function linkAttrs(productId: string, colors: string[], sizes: string[]) {
  const { attributes } = await import("@/db/schema");
  await db.delete(productAttributes).where(eq(productAttributes.productId, productId));
  const names = [...colors, ...sizes];
  if (names.length === 0) return;
  const rows = await db.select().from(attributes);
  const links = names
    .map((n) => rows.find((a) => a.label === n || a.value === n)?.id)
    .filter((x): x is string => !!x)
    .map((attributeId) => ({ productId, attributeId }));
  if (links.length > 0) await db.insert(productAttributes).values(links);
}

export async function listAdminProducts(q: string, page: number): Promise<{ items: (typeof products.$inferSelect)[]; total: number }> {
  const gate = await requireStaff();
  if (!gate.ok) return { items: [], total: 0 };
  const where = q ? like(products.title, `%${q}%`) : undefined;
  const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(products).where(where);
  const rows = await db.select().from(products).where(where).orderBy(desc(products.createdAt)).limit(20).offset(Math.max(0, page - 1) * 20);
  return { items: rows, total: Number(n) };
}

export async function getAdminProduct(id: string) {
  const gate = await requireStaff();
  if (!gate.ok) return null;
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!row) return null;
  const imgs = await db.select().from(productImages).where(eq(productImages.productId, id));
  const links = await db.select().from(productAttributes).where(eq(productAttributes.productId, id));
  return { ...row, images: imgs, attributeIds: links.map((l) => l.attributeId) };
}

export async function saveProduct(id: string | null, input: ProductInput): Promise<ActionRes<string>> {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  const d = parsed.data;
  try {
    if (id) {
      await db.update(products).set({
        title: d.title, slug: d.slug, categoryId: d.categoryId ?? null,
        priceToman: d.priceToman, oldPriceToman: d.oldPriceToman ?? null,
        discountPct: d.discountPct ?? null, stock: d.stock, status: d.status,
        sku: d.sku || null, description: d.description || null,
      }).where(eq(products.id, id));
      await linkAttrs(id, d.colors, d.sizes);
      if (d.imageUrl) {
        const ex = await db.select().from(productImages).where(eq(productImages.productId, id)).limit(1);
        if (ex.length === 0) await db.insert(productImages).values({ productId: id, url: d.imageUrl, sort: 0 });
        else await db.update(productImages).set({ url: d.imageUrl }).where(eq(productImages.id, ex[0].id));
      }
    } else {
      const pid = crypto.randomUUID();
      await db.insert(products).values({
        id: pid, title: d.title, slug: d.slug, categoryId: d.categoryId ?? null,
        priceToman: d.priceToman, oldPriceToman: d.oldPriceToman ?? null,
        discountPct: d.discountPct ?? null, stock: d.stock, status: d.status,
        sku: d.sku || null, description: d.description || null,
      });
      await linkAttrs(pid, d.colors, d.sizes);
      if (d.imageUrl) await db.insert(productImages).values({ productId: pid, url: d.imageUrl, sort: 0 });
      id = pid;
    }
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { ok: true, data: id };
  } catch (e) {
    const msg = e instanceof Error && e.message.includes("Duplicate") ? "اسلاگ تکراری است" : "ذخیره ناموفق بود";
    return { ok: false, error: msg };
  }
}

export async function deleteProduct(id: string): Promise<ActionRes<null>> {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  try {
    await db.delete(productAttributes).where(eq(productAttributes.productId, id));
    await db.delete(productImages).where(eq(productImages.productId, id));
    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

export async function adjustStock(id: string, delta: number): Promise<ActionRes<number>> {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  if (!Number.isInteger(delta) || Math.abs(delta) > 100000) return { ok: false, error: "مقدار نامعتبر" };
  try {
    const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!row) return { ok: false, error: "پیدا نشد" };
    const next = Math.max(0, row.stock + delta);
    await db.update(products).set({ stock: next }).where(eq(products.id, id));
    revalidatePath("/shop");
    return { ok: true, data: next };
  } catch {
    return { ok: false, error: "ناموفق بود" };
  }
}

const catSchema = z.object({
  title: z.string().trim().min(2, "نام کوتاه است").max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/, "اسلاگ فقط حروف کوچک، عدد و خط‌تیره"),
});

export async function listAdminCats() {
  const gate = await requireStaff();
  if (!gate.ok) return [];
  const rows = await db.select().from(categories);
  const counts = await db.select({ cid: products.categoryId, n: sql<number>`count(*)` }).from(products).groupBy(products.categoryId);
  const byId = new Map(counts.map((c) => [c.cid, Number(c.n)]));
  return rows.map((c) => ({ ...c, count: byId.get(c.id) ?? 0 }));
}

export async function saveCategory(id: string | null, input: { title: string; slug: string }): Promise<ActionRes<string>> {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  const parsed = catSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  try {
    if (id) {
      await db.update(categories).set({ title: parsed.data.title, slug: parsed.data.slug }).where(eq(categories.id, id));
    } else {
      const cid = crypto.randomUUID();
      await db.insert(categories).values({ id: cid, title: parsed.data.title, slug: parsed.data.slug });
      id = cid;
    }
    revalidatePath("/shop");
    revalidatePath("/admin/categories");
    return { ok: true, data: id };
  } catch {
    return { ok: false, error: "اسلاگ تکراری است" };
  }
}

export async function deleteCategory(id: string): Promise<ActionRes<null>> {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  try {
    const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(products).where(eq(products.categoryId, id));
    if (Number(n) > 0) return { ok: false, error: "این دسته محصول دارد؛ اول محصولات را جابه‌جا کن" };
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/shop");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}

export async function listAttrOptions() {
  const gate = await requireStaff();
  if (!gate.ok) return { colors: [], sizes: [] } as { colors: string[]; sizes: string[] };
  const { attributes } = await import("@/db/schema");
  const rows = await db.select().from(attributes);
  return {
    colors: [...new Set(rows.filter((a) => a.type === "color").map((a) => a.label))],
    sizes: [...new Set(rows.filter((a) => a.type === "size").map((a) => a.value))],
  };
}

export async function getProductAttrNames(id: string): Promise<{ colors: string[]; sizes: string[] }> {
  const gate = await requireStaff();
  if (!gate.ok) return { colors: [], sizes: [] };
  const { attributes } = await import("@/db/schema");
  const links = await db.select().from(productAttributes).where(eq(productAttributes.productId, id));
  if (links.length === 0) return { colors: [], sizes: [] };
  const { inArray } = await import("drizzle-orm");
  const rows = await db.select().from(attributes).where(inArray(attributes.id, links.map((l) => l.attributeId)));
  return {
    colors: rows.filter((a) => a.type === "color").map((a) => a.label),
    sizes: rows.filter((a) => a.type === "size").map((a) => a.value),
  };
}

export async function deleteProductImage(imageId: string, productId: string): Promise<ActionRes<null>> {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  try {
    await db.delete(productImages).where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));
    revalidatePath("/admin/products");
    return { ok: true, data: null };
  } catch {
    return { ok: false, error: "حذف ناموفق بود" };
  }
}
