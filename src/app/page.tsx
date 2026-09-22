import Link from "next/link";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { Icon } from "@/components/ui/Icon";
import { toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { getOffers } from "@/lib/get-products";
import { getPublicBanners, getPublicCampaign, getPublicSettings } from "@/lib/cms-public";
import { type ShopProduct } from "@/lib/products";

export const revalidate = 60;

/* ترتیب و متن‌ها عین فیگما node 1:2 — چپ‌به‌راست x: گردنبند، انگشتر، دستبند، گوشواره، پابند */
const CATS = [
  { slug: "necklace", title: "گردنبند", count: "۳۴ محصول", img: "/images/cat-necklace.webp" },
  { slug: "ring", title: "انگشتر", count: "۲۷ محصول", img: "/images/figma-landing/cat-ring.webp" },
  { slug: "bracelet", title: "دستبند", count: "۲۳ محصول", img: "/images/figma-landing/cat-bracelet.webp" },
  { slug: "earring", title: "گوشواره", count: "۱۸ محصول", img: "/images/cat-earring.webp" },
  { slug: "anklet", title: "پابند", count: "۱۴ محصول", img: "/images/figma-landing/cat-anklet.webp" },
];

const TABS = [
  { slug: "", title: "همه محصولات", icon: "icons-20--bag" },
  { slug: "necklace", title: "گردنبند", icon: "icons-20--necklace" },
  { slug: "ring", title: "انگشتر", icon: "icons-20--ring" },
  { slug: "bracelet", title: "دستبند", icon: "icons-20--bracelet" },
  { slug: "earring", title: "گوشواره", icon: "icons-20--ear-rings" },
  { slug: "anklet", title: "پابند", icon: "icons-20--shopping-bag" },
];

const PERKS = [
  { icon: "icons-20--delivery", title: "تحویل اکسپرس", sub: "تحویل سریع و بی‌تاخیر" },
  { icon: "icons-20--trolley", title: "حمل و نقل رایگان", sub: "برای خرید بالای ۵۰۰ هزار تومن" },
  { icon: "icons-20--check-circle", title: "کیفیت پرمیوم", sub: "متریال و کیفیت ساخت بی‌نقص" },
  { icon: "icons-20--repeat", title: "ضمانت بازگشت کالا", sub: "۷ روز ضمانت بازگشت کالا" },
];

const DOTS = ["#D6DBDE", "#0A5A55", "#D6C2A1"];

function priceNum(n: number): string {
  return toFa(n.toLocaleString("en-US"));
}

function getRemainingTime(endsAt?: Date | null) {
  if (!endsAt) return { days: "۰۳", hours: "۲۰", mins: "۳۵" };
  const diff = endsAt.getTime() - Date.now();
  if (diff <= 0) return { days: "۰۰", hours: "۰۰", mins: "۰۰" };
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  return {
    days: toFa(String(d).padStart(2, "0")),
    hours: toFa(String(h).padStart(2, "0")),
    mins: toFa(String(m).padStart(2, "0")),
  };
}

/* کارت محصول فیگما: بج تخفیف، قلب، عکس، نام، ۳ نقطه رنگ، قیمت خط‌خورده + قیمت */
function FigmaCard({ p }: { p: ShopProduct }) {
  const href = p.id.startsWith("fb-") ? "/shop" : `/products/${p.slug}`;
  return (
    <div className="flex flex-col rounded-[10px] bg-[#F8FAF9] p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] text-[#161B22]">
          انگشتر
          <Icon name="icons-20--favorite-icon" className="h-5 w-5" alt="" />
        </span>
        {p.discountPct ? (
          <span className="rounded bg-[#9F1239] px-1.5 py-0.5 text-[11px] font-bold text-white">
            تخفیف {toFa(`٪${p.discountPct}`)}
          </span>
        ) : (
          <span />
        )}
      </div>
      <Link href={href} aria-label={p.title} className="mt-2 block overflow-hidden rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image || "/images/figma-landing/prod.webp"}
          alt={p.title}
          className="aspect-[182/110] w-full object-cover"
          loading="lazy"
        />
      </Link>
      <Link href={href} className="mt-2 text-right text-sm font-bold text-[#161B22]">
        {p.title}
      </Link>
      <div className="mt-1.5 flex items-center justify-center gap-1.5">
        {DOTS.map((c) => (
          <span key={c} className="h-5 w-5 rounded-full border border-black/5" style={{ background: c }} />
        ))}
      </div>
      <div className="mt-1.5 flex items-end justify-between">
        <span className="flex items-center gap-1 text-xs text-[#4B5563]">
          <Icon name="icons-20--price-tag" className="h-4 w-4" alt="" />
          تومن
        </span>
        <span className="text-left">
          {p.oldPriceToman ? (
            <span className="block text-xs text-[#8A9398] line-through">{priceNum(p.oldPriceToman)}</span>
          ) : null}
          <span className="block text-lg font-bold text-[#161B22]">{priceNum(p.priceToman)}</span>
        </span>
      </div>
    </div>
  );
}

const FB_OFFER: ShopProduct = {
  id: "fb-offer",
  slug: "shop",
  title: "پابند زنانه",
  categoryId: null,
  priceToman: 750000,
  oldPriceToman: 750000,
  discountPct: 20,
  stock: 10,
  image: "/images/figma-landing/prod.webp",
};

const FB_NEW: ShopProduct = {
  id: "fb-new",
  slug: "shop",
  title: "انگشتر فول نگین زنانه",
  categoryId: null,
  priceToman: 4250000,
  oldPriceToman: 4250000,
  discountPct: 20,
  stock: 10,
  image: "/images/figma-landing/prod.webp",
};

export default async function LandingPage() {
  const [menu, banners, settings, campaign] = await Promise.all([
    getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} })),
    getPublicBanners(),
    getPublicSettings(),
    getPublicCampaign(),
  ]);

  let offers: ShopProduct[] = [];
  let newest: ShopProduct[] = [];
  try {
    offers = (await getOffers()).slice(0, 5);
    const { db } = await import("@/db");
    const { products, productImages } = await import("@/db/schema");
    const { desc, eq, asc } = await import("drizzle-orm");
    const rows = await db.select().from(products).where(eq(products.status, "active")).orderBy(desc(products.createdAt)).limit(8);
    newest = await Promise.all(
      rows.map(async (r) => {
        const [img] = await db.select().from(productImages).where(eq(productImages.productId, r.id)).orderBy(asc(productImages.sort)).limit(1);
        return { ...r, image: img?.url ?? null };
      }),
    );
  } catch {
    offers = [];
    newest = [];
  }
  if (offers.length === 0) offers = Array.from({ length: 5 }, (_, i) => ({ ...FB_OFFER, id: `fb-offer-${i}` }));
  if (newest.length === 0) newest = Array.from({ length: 8 }, (_, i) => ({ ...FB_NEW, id: `fb-new-${i}` }));

  const bHero = banners["hero"];
  const bOfferSide = banners["offer-side"];
  const bMidA = banners["mid-a"];
  const bMidB = banners["mid-b"];
  const bShine = banners["shine"];

  const timer = getRemainingTime(campaign?.endsAt);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <Header menu={menu} />

      {/* هیرو روی بک‌گراند کرم #F8F6F1 عین Rectangle 1 فیگما */}
      <div className="bg-[#F8F6F1]">
        <div className="mx-auto w-full max-w-7xl px-4">
          {/* H: لیبل + تیتر ۶۶ + ساب + گیومه */}
          <section className="relative pt-8 text-center">
            <span aria-hidden className="pointer-events-none absolute top-2 left-4 text-[120px] leading-none text-[#D6DBDE] select-none md:left-16">
              “
            </span>
            <p className="text-base text-[#8A9398]">اکسسوری آس</p>
            <h1 className="mx-auto mt-2 max-w-4xl text-4xl leading-[1.7] font-extrabold text-[#01413E] md:text-[66px]">
              {settings["hero_title"] ?? "انتخابی برای خاص‌پسندان"}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-lg text-[#4B5563]">
              {settings["hero_sub"] ?? "اکسسوری‌های خاص و ماندگار برای تکمیل استایل روزمره و رسمی شما."}
            </p>
          </section>

          {/* Body: راست پنل معرفی، چپ بنر فروش ویژه */}
          <section className="mt-6 grid gap-4 pb-10 md:grid-cols-[520px_1fr]">
            <div className="rounded-[10px] bg-white p-6">
              <p className="text-right text-base leading-7 text-[#161B22]">
                {bOfferSide?.subtitle ??
                  "جدیدترین اکسسوری‌های ترند را کشف کنید. مجموعه‌ای از گردنبندها، دستبندها، انگشترها و گوشواره‌های خاص که برای درخشش بیشتر استایل شما انتخاب شده‌اند."}
              </p>
              <Link
                href={bOfferSide?.ctaHref || "/shop"}
                className="mt-4 inline-flex w-44 items-center justify-center gap-2 rounded-[10px] bg-[linear-gradient(135deg,#00807A,#01413E)] px-4 py-3 text-base font-extrabold text-white"
              >
                <Icon name="icons-20--add-to-cart-button" className="h-5 w-5 brightness-0 invert" alt="" />
                {bOfferSide?.ctaLabel ?? "لیست محصولات"}
              </Link>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PERKS.map((f) => (
                  <div key={f.title} className="flex items-center gap-2">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D7E8E7]">
                      <Icon name={f.icon} className="h-6 w-6" alt="" />
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold text-[#161B22]">{f.title}</span>
                      <span className="block text-xs text-[#4B5563]">{f.sub}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[10px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bHero?.imageUrl || "/images/figma-landing/hero-bg.webp"}
                alt={bHero?.title ?? "فروش ویژه"}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <Link
                href={bHero?.ctaHref || "/shop"}
                className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#161B22]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A5A55]">
                  <Icon name="icons-20--vector-arrow-left" className="h-4 w-4 brightness-0 invert" alt="" />
                </span>
                {bHero?.ctaLabel ?? "مشاهده بیشتر"}
              </Link>
              <div className="relative flex h-full min-h-[320px] flex-col items-end justify-end p-6 text-right md:min-h-[391px] md:p-8">
                <span className="rounded-full bg-[#9F1239] px-6 py-2 text-2xl font-extrabold text-white">
                  فروش ویژه!
                </span>
                <p className="mt-3 text-3xl leading-snug font-bold text-white md:text-[38px]">
                  {bHero?.title ?? "٪۷۵ تخفیف به مناسبت روز دختر"}
                </p>
                <p className="mt-1 text-2xl text-[#E8EBED]">
                  {bHero?.subtitle ?? "اکسسوری‌هایی برای امروز و سال‌های بعد"}
                </p>
                <div className="mt-4 flex items-start gap-4" dir="rtl">
                  {[
                    { n: "۰۱", active: false },
                    { n: "۰۲", active: true },
                    { n: "۰۳", active: false },
                  ].map((s) => (
                    <span key={s.n} className="flex w-10 flex-col items-center gap-1">
                      <span className={`h-1 w-full rounded-full ${s.active ? "bg-[#0A5A55]" : "bg-[#E8EBED]"}`} />
                      <span className={`text-xs font-bold ${s.active ? "text-[#161B22]" : "text-[#8A9398]"}`}>{s.n}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* دسته‌بندی محصولات */}
      <div className="mx-auto w-full max-w-7xl px-4">
        <section className="relative mt-8 text-center">
          <p aria-hidden className="pointer-events-none text-[64px] leading-none font-extrabold tracking-wide text-[#161B22]/5 select-none md:text-[110px]">
            CATEGORIES
          </p>
          <h2 className="-mt-8 text-2xl font-extrabold text-[#161B22] md:-mt-14 md:text-[40px]">
            {settings["cat_title"] ?? "دسته‌بندی محصولات"}
          </h2>
          <p className="mt-2 text-base text-[#4B5563]">
            {settings["cat_sub"] ?? "اکسسوری‌هایی برای امروز و سال‌های بعد"}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {CATS.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?cat=${c.slug}`}
                className="group relative overflow-hidden rounded-[10px] bg-[#F8FAF9]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.img}
                  alt={c.title}
                  className="aspect-[204/260] w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[#324948] via-[#324948]/35 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 p-3">
                  <span className="text-2xl font-bold text-[#F8FAF9]">{c.title}</span>
                  <span className="text-base font-bold text-[#F9F9F9]">{c.count}</span>
                  <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#D7E8E7] px-4 py-1.5 text-sm font-bold text-[#161B22]">
                    مشاهده بیشتر
                    <Icon name="icons-20--direction-left" className="h-4 w-4" alt="" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* پیشنهاد شگفت‌انگیز — باند تمام‌عرض گرادیانی */}
      <section className="mt-10 bg-[linear-gradient(180deg,#01413E_0%,#0F5D5A_51%,#01413E_100%)]">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:grid-cols-[152px_1fr_44px] md:items-center">
          <div className="flex flex-row items-center justify-between gap-3 md:flex-col md:justify-center">
            <p className="text-center text-2xl leading-10 font-extrabold text-[#F8FAF9] md:text-[40px] md:leading-[56px]">
              پیشنهاد
              <br />
              شگفت
              <br />
              انگیز
            </p>
            <div className="flex items-start gap-1" dir="rtl">
              {[
                { n: timer.days, l: "روز" },
                { n: timer.hours, l: "ساعت" },
                { n: timer.mins, l: "دقیقه" },
              ].map((t, i) => (
                <span key={t.l} className="flex items-start gap-1">
                  <span className="flex flex-col items-center gap-1">
                    <span className="rounded-md bg-[#F8FAF9] px-2 py-1.5 text-sm font-bold text-[#161B22]">{t.n}</span>
                    <span className="text-xs font-bold text-[#F8FAF9]">{t.l}</span>
                  </span>
                  {i < 2 && <span className="pt-1.5 text-base font-bold text-[#F8FAF9]">:</span>}
                </span>
              ))}
            </div>
            <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-bold text-white">
              <Icon name="icons-20--direction-left" className="h-5 w-5 brightness-0 invert" alt="" />
              مشاهده همه
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {offers.map((p) => (
              <FigmaCard key={p.id} p={p} />
            ))}
          </div>
          <Link
            href="/shop"
            aria-label="بعدی"
            className="mx-auto hidden h-11 w-11 items-center justify-center rounded-full bg-[#F8FAF9] md:flex"
          >
            <Icon name="icons-20--direction-left" className="h-5 w-5" alt="" />
          </Link>
        </div>
      </section>

      {/* دو بنر میانی */}
      <div className="mx-auto w-full max-w-7xl px-4">
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="relative min-h-[300px] overflow-hidden rounded-[10px] bg-[#D7E8E7] md:min-h-[362px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bMidA?.imageUrl || "/images/figma-landing/mid.webp"}
              alt={bMidA?.title ?? "ظرافت"}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="relative flex h-full min-h-[300px] flex-col items-end justify-center p-6 text-right md:min-h-[362px] md:p-8">
              <p className="max-w-70 text-2xl leading-10 font-extrabold text-[#01413E] md:text-3xl">
                {bMidA?.title ?? "ظرافتی که همراه تو می‌ماند"}
              </p>
              <p className="mt-2 max-w-60 text-sm leading-7 text-white">
                {bMidA?.subtitle ?? "اکسسوری‌هایی خاص برای تکمیل استایل منحصربه‌فرد شما"}
              </p>
              <Link
                href={bMidA?.ctaHref || "/shop"}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#161B22]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A5A55]">
                  <Icon name="icons-20--vector-arrow-left" className="h-4 w-4 brightness-0 invert" alt="" />
                </span>
                {bMidA?.ctaLabel ?? "مشاهده بیشتر"}
              </Link>
            </div>
          </div>
          <div className="relative min-h-[300px] overflow-hidden rounded-[10px] bg-[#0d3f3b] md:min-h-[362px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bMidB?.imageUrl || "/images/figma-landing/hero-fg.webp"}
              alt={bMidB?.title ?? "گوشواره و دستبند"}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
            <div className="relative flex h-full min-h-[300px] flex-col items-start justify-center p-6 text-right md:min-h-[362px] md:p-8">
              <p className="max-w-70 text-2xl leading-10 font-extrabold text-[#F8FAF9] md:text-3xl">
                {bMidB?.title ?? "بهترین گوشواره‌ها و دستبندها"}
              </p>
              <p className="mt-2 max-w-65 text-sm leading-7 text-[#C4CBD2]">
                {bMidB?.subtitle ?? "گوشواره و دستبندهای ظریف و مدرن برای تکمیل استایل روزمره و خاص شما"}
              </p>
              <Link
                href={bMidB?.ctaHref || "/shop"}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#161B22]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A5A55]">
                  <Icon name="icons-20--vector-arrow-left" className="h-4 w-4 brightness-0 invert" alt="" />
                </span>
                {bMidB?.ctaLabel ?? "مشاهده بیشتر"}
              </Link>
            </div>
          </div>
        </section>

        {/* محصولات جدید: راست منو، چپ گرید */}
        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <p className="max-w-md text-sm leading-6 text-[#4B5563]">
              اکسسوری‌های منتخب با طراحی متمایز و کیفیت ممتاز، اکنون با پیشنهادهای ویژه در دسترس شما هستند. انتخابی خاص برای سلیقه‌های خاص.
            </p>
            <Link href="/shop" className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A5A55]">
                <Icon name="icons-20--vector-arrow-left" className="h-4 w-4 brightness-0 invert" alt="" />
              </span>
              مشاهده همه
            </Link>
            <h2 className="shrink-0 border-l-4 border-[#A8B8A5] pl-3 text-xl font-extrabold text-[#161B22] md:text-[28px]">
              {settings["new_title"] ?? "محصولات جدید"}
            </h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-[214px_1fr]">
            <aside className="h-fit rounded-xl border border-black/5 bg-white">
              {TABS.map((t, i) => (
                <span key={t.title}>
                  <Link
                    href={t.slug ? `/shop?cat=${t.slug}` : "/shop"}
                    className={`flex items-center justify-between px-4 py-3 text-sm font-bold ${
                      i === 0 ? "rounded-xl bg-[#E7EFEE] text-[#01413E] shadow-[inset_-2px_0_0_#0A5A55]" : "text-[#161B22] hover:bg-[#F8FAF9]"
                    }`}
                  >
                    {t.title}
                    <Icon name={t.icon} className="h-5 w-5" alt="" />
                  </Link>
                  {i < TABS.length - 1 && <span className="mx-4 block border-b border-black/5" />}
                </span>
              ))}
            </aside>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {newest.map((p) => (
                <div key={p.id} className="rounded-[10px] border border-black/5">
                  <FigmaCard p={p} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* بنر درخشش: راست متن، چپ مدل */}
        <section className="relative mt-10 overflow-hidden rounded-[10px] bg-[linear-gradient(180deg,#01413E,#0F5D5A)]">
          <div className="grid items-center gap-4 md:grid-cols-2">
            <div className="p-8 text-right md:p-12">
              <h2 className="text-3xl font-extrabold text-[#F8FAF9] md:text-5xl">
                {bShine?.title ?? "درخشش در هر نگاه"}
              </h2>
              <p className="mt-3 text-xl font-bold text-[#C4CBD2] md:text-2xl">
                {bShine?.subtitle ?? "جزئیاتی کوچک با تاثیری بزرگ بر استایل شما"}
              </p>
              <Link
                href={bShine?.ctaHref || "/shop"}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#D7E8E7] px-5 py-2.5 text-base font-extrabold text-[#01413E]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A5A55]">
                  <Icon name="icons-20--vector-arrow-left" className="h-4 w-4 brightness-0 invert" alt="" />
                </span>
                {bShine?.ctaLabel ?? "مشاهده محصولات"}
              </Link>
            </div>
            <div className="relative min-h-[280px] md:min-h-[362px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/figma-landing/shine-model.webp"
                alt="درخشش در هر نگاه"
                className="absolute inset-0 h-full w-full object-cover object-top"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      </div>

      <Footer settings={settings} />
    </div>
  );
}

// ponytail: CMS fallbacks render exact Figma copy.
