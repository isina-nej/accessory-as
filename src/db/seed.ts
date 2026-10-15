import { and, eq } from "drizzle-orm";
import { pathToFileURL } from "node:url";
import { attributes, banners, campaigns, categories, coupons, faqs, pages, productAttributes, productImages, products, reviews, settings, shippingMethods } from "./schema";
import { assertBaseSeedAllowed, assertSeedDataValid, describeDatabaseTarget } from "./seed-guards";

import { CATS, COLORS, SIZES, DESC, PRODUCTS, SEED_REVIEWS } from "./seed-data";

export async function runBaseSeed(db: typeof import("./index").db): Promise<void> {
  assertSeedDataValid(PRODUCTS);
  for (const [slug, title] of CATS) {
    const [existing] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (!existing) await db.insert(categories).values({ slug, title });
  }
  for (const label of COLORS) {
    const [existing] = await db.select().from(attributes).where(and(eq(attributes.type, "color"), eq(attributes.value, label))).limit(1);
    if (!existing) await db.insert(attributes).values({ type: "color", label, value: label });
  }
  for (const v of SIZES) {
    const [existing] = await db.select().from(attributes).where(and(eq(attributes.type, "size"), eq(attributes.value, v))).limit(1);
    if (!existing) await db.insert(attributes).values({ type: "size", label: v, value: v });
  }

  const catRows = await db.select().from(categories);
  const attrRows = await db.select().from(attributes);
  const attrId = (type: string, label: string) => attrRows.find((a) => a.type === type && (a.label === label || a.value === label))?.id;

  for (const p of PRODUCTS) {
    const cat = catRows.find((c) => c.slug === p.cat);
    const [existingProduct] = await db.select().from(products).where(eq(products.slug, p.slug)).limit(1);
    if (!existingProduct) {
      await db.insert(products).values({
        slug: p.slug, title: p.title, categoryId: cat?.id ?? null,
        priceToman: p.price, oldPriceToman: p.old ?? null, discountPct: p.off ?? null,
        stock: p.stock, status: "active", sku: p.sku, description: DESC(p.title),
      });
    }
    const [row] = await db.select().from(products).where(eq(products.slug, p.slug)).limit(1);
    if (!row) continue;
    const imgList = p.images && p.images.length > 0 ? p.images : [p.img];
    const presentImages = await db.select().from(productImages).where(eq(productImages.productId, row.id));
    if (presentImages.length === 0) {
      for (let i = 0; i < imgList.length; i++) {
        await db.insert(productImages).values({ productId: row.id, url: imgList[i], sort: i });
      }
    }
    const presentLinks = await db.select().from(productAttributes).where(eq(productAttributes.productId, row.id)).limit(1);
    if (presentLinks.length === 0) {
      const links: { productId: string; attributeId: string }[] = [];
      for (const color of p.colors) {
        const id = attrId("color", color);
        if (id) links.push({ productId: row.id, attributeId: id });
      }
      for (const size of p.sizes) {
        const id = attrId("size", size);
        if (id) links.push({ productId: row.id, attributeId: id });
      }
      if (links.length) await db.insert(productAttributes).values(links);
    }
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
    const [existing] = await db.select().from(shippingMethods).where(eq(shippingMethods.slug, m.slug)).limit(1);
    if (!existing) await db.insert(shippingMethods).values(m);
  }

  // کوپن نمونه فیگما
  const [existingCoupon] = await db.select().from(coupons).where(eq(coupons.code, "GH632LO")).limit(1);
  if (!existingCoupon) await db.insert(coupons).values({ code: "GH632LO", pct: 20, maxToman: 2000000, minToman: 1000000, active: true });

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
    }
  }

  for (const p of [
    { slug: "about", title: "درباره ما", body: "اکسسوری آس، روایتی از سلیقه شما.\n\nتهران، خیابان ولیعصر، بالاتر از خیابان زرتشت، کوچه جاوید، پلاک ۲۴\nتلفن پشتیبانی: ۰۲۱ ۷۰۰۸۰۰۱ ــ ۰۹۳۵ ۱۷۹ ۰۸۵۳" },
    { slug: "contact", title: "تماس با ما", body: "تهران، خیابان ولیعصر، بالاتر از خیابان زرتشت، کوچه جاوید، پلاک ۲۴\nتلفن پشتیبانی: ۰۲۱ ۷۰۰۸۰۰۱ ــ ۰۹۳۵ ۱۷۹ ۰۸۵۳\nشنبه تا پنجشنبه، ۹ تا ۱۸" },
    { slug: "terms", title: "شرایط استفاده", body: "شرایط استفاده از فروشگاه اکسسوری آس." },
    { slug: "privacy", title: "حریم خصوصی", body: "سیاست حریم خصوصی فروشگاه اکسسوری آس." },
  ]) {
    const [existing] = await db.select().from(pages).where(eq(pages.slug, p.slug)).limit(1);
    if (!existing) await db.insert(pages).values(p);
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
    const [existing] = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (!existing) await db.insert(settings).values({ key, value });
  }

  const [existingCampaign] = await db.select().from(campaigns).where(eq(campaigns.slug, "amazing")).limit(1);
  if (!existingCampaign) await db.insert(campaigns).values({ slug: "amazing", title: "پیشنهاد شگفت‌انگیز", active: true });

  const allP = await db.select().from(products);
  const allR = await db.select().from(reviews);
  console.log(`seed ok: ${allP.length} products, ${allR.length} reviews`);
}

async function main() {
  assertBaseSeedAllowed(process.env.NODE_ENV, process.env.DATABASE_URL, process.env.SEED_ALLOW_REMOTE_HOSTS);
  console.log(`seed target: ${describeDatabaseTarget(process.env.DATABASE_URL)}`);
  const { db } = await import("./index");
  await runBaseSeed(db);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then(() => process.exit(0))
    .catch((e: unknown) => {
      console.error("seed failed:", e instanceof Error ? e.message : e);
      process.exit(1);
    });
}
