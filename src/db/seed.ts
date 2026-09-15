import { db } from "./index";
import { attributes, categories, products } from "./schema";

// سید از فیگما 708:439 — 7 دسته، 6 رنگ، سایز 20-24، قیمت نمونه
const CATS = [
  ["necklace", "گردنبند"],
  ["ring", "انگشتر"],
  ["bracelet", "دستبند"],
  ["earring", "گوشواره"],
  ["anklet", "پابند"],
  ["half-set", "نیم‌ست"],
  ["full-set", "ست کامل"],
] as const;

const COLORS = ["طلایی", "صورتی", "نقره‌ای", "بنفش", "آبی", "سفید"];
const SIZES = ["20", "21", "22", "23", "24"];

async function main() {
  for (const [slug, title] of CATS) {
    await db.insert(categories).values({ slug, title }).onDuplicateKeyUpdate({ set: { title } });
  }
  for (const label of COLORS) {
    await db.insert(attributes).values({ type: "color", label, value: label });
  }
  for (const v of SIZES) {
    await db.insert(attributes).values({ type: "size", label: v, value: v });
  }
  const rows = await db.select().from(categories);
  const ring = rows.find((c) => c.slug === "ring");
  if (ring) {
    await db
      .insert(products)
      .values({
        slug: "full-nagin-ring",
        title: "انگشتر فول نگین زنانه",
        categoryId: ring.id,
        priceToman: 4250000,
        oldPriceToman: 5312500,
        discountPct: 20,
        stock: 12,
        status: "active",
      })
      .onDuplicateKeyUpdate({ set: { priceToman: 4250000 } });
  }
  console.log("seed ok");
}

main().then(() => process.exit(0));
