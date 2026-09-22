import fs from "node:fs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { attributes, banners, campaigns, categories, contactMessages, coupons, faqs, pages, productAttributes, productImages, products, reviews, settings, shippingMethods } from "./schema";

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
  colors: string[]; sizes: string[]; img: string;
};

// بازه فیلتر فیگما: ۲۵۰هزار تا ۲۵میلیون — عکس از public/images (فیگما)
const PRODUCTS: P[] = [
  { slug: "full-nagin-ring", title: "انگشتر فول نگین زنانه", cat: "ring", price: 4250000, old: 5312500, off: 20, stock: 12, sku: "WC009", colors: ["نقره‌ای", "طلایی"], sizes: ["20", "21", "22", "23", "24", "25"], img: "/images/product-01.webp" },
  { slug: "minimal-steel-ring", title: "انگشتر مینیمال استیل", cat: "ring", price: 1250000, stock: 30, sku: "WC011", colors: ["نقره‌ای"], sizes: ["20", "21", "22", "23", "24"], img: "/images/product-02.webp" },
  { slug: "gold-plated-ring", title: "انگشتر آبکاری طلا", cat: "ring", price: 2980000, old: 3500000, off: 15, stock: 0, sku: "WC012", colors: ["طلایی"], sizes: ["21", "22", "23"], img: "/images/product-03.webp" },
  { slug: "full-nagin-necklace", title: "گردنبند فول نگین زنانه", cat: "necklace", price: 5250000, old: 6562500, off: 20, stock: 5, sku: "WN007", colors: ["طلایی", "نقره‌ای"], sizes: [], img: "/images/product-04.webp" },
  { slug: "minimal-chain-necklace", title: "گردنبند زنجیری مینیمال", cat: "necklace", price: 1890000, stock: 18, sku: "WN008", colors: ["طلایی"], sizes: [], img: "/images/product-05.webp" },
  { slug: "pearl-necklace", title: "گردنبند مروارید", cat: "necklace", price: 7650000, stock: 3, sku: "WN009", colors: ["سفید"], sizes: [], img: "/images/product-06.webp" },
  { slug: "full-nagin-bracelet", title: "دستبند فول نگین", cat: "bracelet", price: 1870000, old: 2337500, off: 20, stock: 8, sku: "WB014", colors: ["طلایی", "نقره‌ای"], sizes: [], img: "/images/product-07.webp" },
  { slug: "cartier-bracelet", title: "دستبند کارتیر", cat: "bracelet", price: 2450000, stock: 10, sku: "WB015", colors: ["طلایی"], sizes: [], img: "/images/product-08.webp" },
  { slug: "bangle-bracelet", title: "دستبند النگویی", cat: "bracelet", price: 3980000, stock: 6, sku: "WB016", colors: ["طلایی"], sizes: [], img: "/images/product-09.webp" },
  { slug: "double-nagin-earring", title: "گوشواره دو عددی فول نگین", cat: "earring", price: 3050000, old: 3812500, off: 20, stock: 15, sku: "WE021", colors: ["نقره‌ای", "طلایی"], sizes: [], img: "/images/product-10.webp" },
  { slug: "hoop-earring", title: "گوشواره حلقه‌ای", cat: "earring", price: 1450000, stock: 22, sku: "WE022", colors: ["طلایی"], sizes: [], img: "/images/product-11.webp" },
  { slug: "pearl-drop-earring", title: "گوشواره مروارید آویز", cat: "earring", price: 2750000, stock: 7, sku: "WE023", colors: ["سفید"], sizes: [], img: "/images/product-12.webp" },
  { slug: "women-anklet", title: "پابند زنانه", cat: "anklet", price: 750000, stock: 20, sku: "WA031", colors: ["نقره‌ای"], sizes: [], img: "/images/product-13.webp" },
  { slug: "chain-anklet", title: "پابند زنجیری طلا", cat: "anklet", price: 1350000, stock: 14, sku: "WA032", colors: ["طلایی"], sizes: [], img: "/images/product-14.webp" },
  { slug: "minimal-anklet", title: "پابند مینیمال", cat: "anklet", price: 280000, stock: 40, sku: "WA033", colors: ["نقره‌ای", "صورتی"], sizes: [], img: "/images/product-13.webp" },
  { slug: "half-set-nagin", title: "نیم‌ست فول نگین", cat: "half-set", price: 6800000, old: 8500000, off: 20, stock: 4, sku: "WH041", colors: ["نقره‌ای"], sizes: [], img: "/images/cat-half-set.webp" },
  { slug: "half-set-pearl", title: "نیم‌ست مروارید", cat: "half-set", price: 9200000, stock: 2, sku: "WH042", colors: ["سفید", "طلایی"], sizes: [], img: "/images/cat-half-set.webp" },
  { slug: "full-set-nagin", title: "ست کامل فول نگین", cat: "full-set", price: 14800000, old: 16400000, off: 10, stock: 2, sku: "WF051", colors: ["نقره‌ای"], sizes: [], img: "/images/cat-full-set.webp" },
  { slug: "full-set-gold", title: "ست کامل طلا", cat: "full-set", price: 23500000, stock: 1, sku: "WF052", colors: ["طلایی"], sizes: [], img: "/images/cat-full-set.webp" },
  { slug: "full-set-minimal", title: "ست کامل مینیمال", cat: "full-set", price: 8950000, stock: 3, sku: "WF053", colors: ["نقره‌ای", "طلایی"], sizes: [], img: "/images/cat-full-set.webp" },
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
    const [img] = await db.select().from(productImages).where(eq(productImages.productId, row.id)).limit(1);
    if (!img) await db.insert(productImages).values({ productId: row.id, url: p.img, sort: 0 });
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

  // --- CMS seed (بنرها با عکس فیگما) ---
  const BANNER_IMGS: Record<string, string> = {
    hero: "/images/banner-hero.webp",
    "offer-side": "/images/banner-offer-side.webp",
    "mid-a": "/images/banner-mid-a.webp",
    "mid-b": "/images/banner-mid-b.webp",
    shine: "/images/banner-shine.webp",
  };
  for (const b of [
    { slot: "hero", title: "٪۷۵ تخفیف به مناسبت روز دختر", subtitle: "اکسسوری‌هایی برای امروز و سال‌های بعد", ctaLabel: "مشاهده بیشتر", ctaHref: "/shop", sort: 0 },
    { slot: "offer-side", title: "جدیدترین اکسسوری‌های ترند", subtitle: "مجموعه‌ای از گردنبندها، دستبندها، انگشترها و گوشواره‌های خاص", ctaLabel: "لیست محصولات", ctaHref: "/shop", sort: 0 },
    { slot: "mid-a", title: "بهترین گوشواره‌ها و دستبندها", subtitle: "گوشواره‌ها و دستبندهای خاص و مدرن برای تکمیل استایل روزانه و خاص شما", ctaLabel: "مشاهده بیشتر", ctaHref: "/shop", sort: 0 },
    { slot: "mid-b", title: "ظرافتی که همراه تو می‌ماند", subtitle: null, ctaLabel: "مشاهده بیشتر", ctaHref: "/shop", sort: 0 },
    { slot: "shine", title: "درخشش در هر نگاه", subtitle: "جزئیاتی کوچک با تاثیری بزرگ بر استایل شما", ctaLabel: "مشاهده محصولات", ctaHref: "/shop", sort: 0 },
  ]) {
    const existing = await db.select().from(banners).where(eq(banners.slot, b.slot)).limit(1);
    if (existing.length === 0) {
      await db.insert(banners).values({ ...b, imageUrl: BANNER_IMGS[b.slot] ?? null, active: true });
    } else if (!existing[0].imageUrl && BANNER_IMGS[b.slot]) {
      await db.update(banners).set({ imageUrl: BANNER_IMGS[b.slot] }).where(eq(banners.slot, b.slot));
    }
  }

  for (const p of [
    { slug: "about", title: "درباره ما", body: "اکسسوری آس، روایتی از سلیقه شما.\n\nتهران، خیابان ولیعصر، بالاتر از خیابان زرتشت، کوچه جاوید، پلاک ۲۴\nتلفن پشتیبانی: ۰۲۱ ۷۰۰۸۰۰۱ ــ ۰۹۳۵ ۱۷۹ ۰۸۵۳" },
    { slug: "contact", title: "تماس با ما", body: "تهران، خیابان ولیعصر، بالاتر از خیابان زرتشت، کوچه جاوید، پلاک ۲۴\nتلفن پشتیبانی: ۰۲۱ ۷۰۰۸۰۰۱ ــ ۰۹۳۵ ۱۷۹ ۰۸۵۳\nشنبه تا پنجشنبه، ۹ تا ۱۸" },
    { slug: "terms", title: "شرایط استفاده", body: "شرایط استفاده از فروشگاه اکسسوری آس." },
    { slug: "privacy", title: "حریم خصوصی", body: "سیاست حریم خصوصی فروشگاه اکسسوری آس." },
  ]) {
    await db.insert(pages).values(p).onDuplicateKeyUpdate({ set: { title: p.title } });
  }

  const existingFaqs = await db.select().from(faqs).limit(1);
  if (existingFaqs.length === 0) {
    const FAQS = [
      ["سفارش من چه زمانی ارسال می‌شود؟", "سفارش‌های ثبت‌شده پس از تأیید، در کوتاه‌ترین زمان ممکن پردازش و ارسال می‌شوند."],
      ["آیا امکان مرجوع کردن کالا وجود دارد؟", "در صورت وجود ایراد یا مغایرت با سفارش، تا ۷ روز امکان ثبت درخواست مرجوعی داری."],
      ["چگونه وضعیت سفارش خود را پیگیری کنم؟", "پس از ثبت سفارش، کد رهگیری در صفحه جزئیات سفارش نمایش داده می‌شود."],
      ["آیا محصولات دارای ضمانت کیفیت هستند؟", "تمام محصولات پیش از ارسال از نظر کیفیت و سلامت بررسی می‌شوند."],
      ["روش‌های پرداخت به چه صورت است؟", "پرداخت از طریق درگاه‌های امن زرین‌پال و زیبال انجام می‌شود."],
      ["آیا ارسال به سراسر کشور انجام می‌شود؟", "بله، سفارش‌ها به تمامی شهرهای ایران ارسال می‌شوند."],
      ["در صورت داشتن سؤال چه کار کنم؟", "تیم پشتیبانی از طریق صفحه تماس با ما پاسخگوست."],
      ["چگونه از موجود شدن محصولات مطلع شوم؟", "محصول را به علاقه‌مندی اضافه کن و شبکه‌های اجتماعی ما را دنبال کن."],
    ] as const;
    await db.insert(faqs).values(FAQS.map(([q, a], i) => ({ q, a, sort: i, active: true })));
  }

  for (const [key, value] of [
    ["footer_seo_title", "اکسسوری آس، روایتی از سلیقه شما"],
    ["footer_seo_body", "فروشگاه اکسسوری آس با هدف ارائه مجموعه‌ای از اکسسوری‌های خاص، مدرن و باکیفیت فعالیت خود را آغاز کرده است."],
    ["footer_address", "تهران، خیابان ولیعصر، بالاتر از خیابان زرتشت، کوچه جاوید، پلاک ۲۴"],
    ["footer_phones", "۰۲۱ ۷۰۰۸۰۰۱ ــ ۰۹۳۵ ۱۷۹ ۰۸۵۳"],
    ["site_title", "اکسسوری آس | فروشگاه"],
    ["site_desc", "اکسسوری آس، روایتی از سلیقه شما — گردنبند، انگشتر، دستبند، گوشواره و ست‌های خاص."],
    ["hero_title", "انتخابی برای خاص‌پسندان"],
    ["hero_sub", "اکسسوری آس"],
    ["cat_title", "دسته‌بندی محصولات"],
    ["cat_sub", "اکسسوری‌هایی برای امروز و سال‌های بعد"],
    ["offer_title", "پیشنهاد شگفت‌انگیز"],
    ["new_title", "محصولات جدید"],
    ["shine_title", "درخشش در هر نگاه"],
    ["shine_sub", "جزئیاتی کوچک با تاثیری بزرگ بر استایل شما"],
  ] as const) {
    await db.insert(settings).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
  }

  const existingContact = await db.select().from(contactMessages).limit(1);
  if (existingContact.length === 0) {
    await db.insert(contactMessages).values({ name: "نمونه", phone: "09120000000", body: "پیام نمونه — از پنل حذف کن.", read: true });
  }

  await db.insert(campaigns).values({ slug: "amazing", title: "پیشنهاد شگفت‌انگیز", active: true }).onDuplicateKeyUpdate({ set: { title: "پیشنهاد شگفت‌انگیز" } });

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
