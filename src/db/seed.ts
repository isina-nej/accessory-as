import fs from "node:fs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { attributes, categories, coupons, productAttributes, productImages, products, reviews, shippingMethods } from "./schema";

// tsx برخلاف Next خودش .env را لود نمی‌کند
try {
  const raw = fs.readFileSync(`${process.cwd()}/.env`, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i).trim();
    if (!k || process.env[k] !== undefined) continue;
    process.env[k] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
} catch { /* .env نیست: خطا موقع اتصال می‌آید */ }

// از فیگما 708:439 + صفحه محصول (Details/Review)
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
const SIZES = ["20", "21", "22", "23", "24", "25"];

const DESC = (t: string) =>
  `این ${t} با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است.`;

type P = {
  slug: string; title: string; cat: string; price: number;
  old?: number; off?: number; stock: number; sku: string;
  colors: string[]; sizes: string[];
};

// بازه فیلتر فیگما: ۲۵۰هزار تا ۲۵میلیون
const PRODUCTS: P[] = [
  { slug: "full-nagin-ring", title: "انگشتر فول نگین زنانه", cat: "ring", price: 4250000, old: 5312500, off: 20, stock: 12, sku: "WC009", colors: ["نقره‌ای", "طلایی"], sizes: ["20", "21", "22", "23", "24", "25"] },
  { slug: "minimal-steel-ring", title: "انگشتر مینیمال استیل", cat: "ring", price: 1250000, stock: 30, sku: "WC011", colors: ["نقره‌ای"], sizes: ["20", "21", "22", "23", "24"] },
  { slug: "gold-plated-ring", title: "انگشتر آبکاری طلا", cat: "ring", price: 2980000, old: 3500000, off: 15, stock: 0, sku: "WC012", colors: ["طلایی"], sizes: ["21", "22", "23"] },
  { slug: "full-nagin-necklace", title: "گردنبند فول نگین زنانه", cat: "necklace", price: 5250000, old: 6562500, off: 20, stock: 5, sku: "WN007", colors: ["طلایی", "نقره‌ای"], sizes: [] },
  { slug: "minimal-chain-necklace", title: "گردنبند زنجیری مینیمال", cat: "necklace", price: 1890000, stock: 18, sku: "WN008", colors: ["طلایی"], sizes: [] },
  { slug: "pearl-necklace", title: "گردنبند مروارید", cat: "necklace", price: 7650000, stock: 3, sku: "WN009", colors: ["سفید"], sizes: [] },
  { slug: "full-nagin-bracelet", title: "دستبند فول نگین", cat: "bracelet", price: 1870000, old: 2337500, off: 20, stock: 8, sku: "WB014", colors: ["طلایی", "نقره‌ای"], sizes: [] },
  { slug: "cartier-bracelet", title: "دستبند کارتیر", cat: "bracelet", price: 2450000, stock: 10, sku: "WB015", colors: ["طلایی"], sizes: [] },
  { slug: "bangle-bracelet", title: "دستبند النگویی", cat: "bracelet", price: 3980000, stock: 6, sku: "WB016", colors: ["طلایی"], sizes: [] },
  { slug: "double-nagin-earring", title: "گوشواره دو عددی فول نگین", cat: "earring", price: 3050000, old: 3812500, off: 20, stock: 15, sku: "WE021", colors: ["نقره‌ای", "طلایی"], sizes: [] },
  { slug: "hoop-earring", title: "گوشواره حلقه‌ای", cat: "earring", price: 1450000, stock: 22, sku: "WE022", colors: ["طلایی"], sizes: [] },
  { slug: "pearl-drop-earring", title: "گوشواره مروارید آویز", cat: "earring", price: 2750000, stock: 7, sku: "WE023", colors: ["سفید"], sizes: [] },
  { slug: "women-anklet", title: "پابند زنانه", cat: "anklet", price: 750000, stock: 20, sku: "WA031", colors: ["نقره‌ای"], sizes: [] },
  { slug: "chain-anklet", title: "پابند زنجیری طلا", cat: "anklet", price: 1350000, stock: 14, sku: "WA032", colors: ["طلایی"], sizes: [] },
  { slug: "minimal-anklet", title: "پابند مینیمال", cat: "anklet", price: 280000, stock: 40, sku: "WA033", colors: ["نقره‌ای", "صورتی"], sizes: [] },
  { slug: "half-set-nagin", title: "نیم‌ست فول نگین", cat: "half-set", price: 6800000, old: 8500000, off: 20, stock: 4, sku: "WH041", colors: ["نقره‌ای"], sizes: [] },
  { slug: "half-set-pearl", title: "نیم‌ست مروارید", cat: "half-set", price: 9200000, stock: 2, sku: "WH042", colors: ["سفید", "طلایی"], sizes: [] },
  { slug: "full-set-nagin", title: "ست کامل فول نگین", cat: "full-set", price: 14800000, old: 16400000, off: 10, stock: 2, sku: "WF051", colors: ["نقره‌ای"], sizes: [] },
  { slug: "full-set-gold", title: "ست کامل طلا", cat: "full-set", price: 23500000, stock: 1, sku: "WF052", colors: ["طلایی"], sizes: [] },
  { slug: "full-set-minimal", title: "ست کامل مینیمال", cat: "full-set", price: 8950000, stock: 3, sku: "WF053", colors: ["نقره‌ای", "طلایی"], sizes: [] },
];

const SEED_REVIEWS: Record<string, { author: string; rating: number; body: string }[]> = {
  "full-nagin-ring": [
    { author: "حسین کاظمی", rating: 5, body: "کیفیت عالی و متریال استفاده شده بی‌نظیره." },
    { author: "سارا محمدی", rating: 5, body: "بسته‌بندی شیک و ارسال سریع. روی دست خیلی قشنگه." },
    { author: "نگار احمدی", rating: 4, body: "قشنگه ولی حتما راهنمای سایز رو ببینید، قالبش کمی کوچیکه." },
    { author: "امیر رضایی", rating: 5, body: "برای هدیه گرفتم، خیلی راضی بود. برق نگین‌ها عالیه." },
    { author: "مریم کریمی", rating: 4, body: "نسبت به قیمتش کیفیت خوبی داره. ممنون از پشتیبانی." },
  ],
  "full-nagin-necklace": [
    { author: "الهه صادقی", rating: 5, body: "زنجیرش محکمه و نگین‌ها تمیز کار شدن." },
    { author: "رضا مرادی", rating: 4, body: "خوبه، فقط جعبه‌اش می‌تونست شیک‌تر باشه." },
  ],
  "full-nagin-bracelet": [
    { author: "شیما نادری", rating: 5, body: "هم برای مهمونی هم روزمره مناسبه. راضیم." },
  ],
};

async function main() {
  for (const [slug, title] of CATS) {
    await db.insert(categories).values({ slug, title }).onDuplicateKeyUpdate({ set: { title } });
  }
  await db.delete(productAttributes);
  await db.delete(attributes);
  await db.delete(productImages);
  for (const label of COLORS) {
    await db.insert(attributes).values({ type: "color", label, value: label });
  }
  for (const v of SIZES) {
    await db.insert(attributes).values({ type: "size", label: v, value: v });
  }

  const catRows = await db.select().from(categories);
  const attrRows = await db.select().from(attributes);
  const attrId = (type: string, label: string) => attrRows.find((a) => a.type === type && (a.label === label || a.value === label))?.id;

  for (const p of PRODUCTS) {
    const cat = catRows.find((c) => c.slug === p.cat);
    await db
      .insert(products)
      .values({
        slug: p.slug, title: p.title, categoryId: cat?.id ?? null,
        priceToman: p.price, oldPriceToman: p.old ?? null, discountPct: p.off ?? null,
        stock: p.stock, status: "active", sku: p.sku, description: DESC(p.title),
      })
      .onDuplicateKeyUpdate({
        set: {
          title: p.title, categoryId: cat?.id ?? null, priceToman: p.price,
          oldPriceToman: p.old ?? null, discountPct: p.off ?? null,
          stock: p.stock, status: "active", sku: p.sku, description: DESC(p.title),
        },
      });
    const [row] = await db.select().from(products).where(eq(products.slug, p.slug)).limit(1);
    if (!row) continue;
    await db.delete(productAttributes).where(eq(productAttributes.productId, row.id));
    const links: { productId: string; attributeId: string }[] = [];
    for (const c of p.colors) {
      const id = attrId("color", c);
      if (id) links.push({ productId: row.id, attributeId: id });
    }
    for (const s of p.sizes) {
      const id = attrId("size", s);
      if (id) links.push({ productId: row.id, attributeId: id });
    }
    if (links.length > 0) await db.insert(productAttributes).values(links);
  }

  for (const [slug, list] of Object.entries(SEED_REVIEWS)) {
    const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!row) continue;
    const existing = await db.select().from(reviews).where(eq(reviews.productId, row.id)).limit(1);
    if (existing.length > 0) continue;
    await db.insert(reviews).values(list.map((r) => ({ productId: row.id, ...r, verified: true })));
  }

  // روش‌های ارسال فیگما: پست + تیپاکس، رایگان بالای ۵۰۰هزار
  for (const m of [
    { slug: "post", title: "پست پیشتاز", feeToman: 150000, freeOverToman: 500000 },
    { slug: "tipax", title: "تیپاکس", feeToman: 220000, freeOverToman: 500000 },
  ]) {
    await db.insert(shippingMethods).values(m).onDuplicateKeyUpdate({
      set: { title: m.title, feeToman: m.feeToman, freeOverToman: m.freeOverToman },
    });
  }

  // کوپن نمونه فیگما
  await db
    .insert(coupons)
    .values({ code: "GH632LO", pct: 20, maxToman: 2000000, minToman: 1000000, active: true })
    .onDuplicateKeyUpdate({
      set: { pct: 20, maxToman: 2000000, minToman: 1000000, active: true },
    });

  const allP = await db.select().from(products);
  const allR = await db.select().from(reviews);
  console.log(`seed ok: ${allP.length} products, ${allR.length} reviews`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("seed failed:", e instanceof Error ? e.message : e);
    process.exit(1);
  });
