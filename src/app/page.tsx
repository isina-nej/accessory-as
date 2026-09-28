import Link from "next/link";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { Icon } from "@/components/ui/Icon";
import { toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { getOffers } from "@/lib/get-products";
import { getPublicBanners, getPublicCampaign, getPublicSettings } from "@/lib/cms-public";
import { type ShopProduct } from "@/lib/products";
import { HeroBannerSlider } from "@/components/shop/HeroBannerSlider";

export const revalidate = 60;

/* دسته‌بندی‌ها عین نود 1:2 فیگما — راست به چپ در RTL: پابند، گوشواره، دستبند، انگشتر، گردنبند */
const CATS = [
  { slug: "anklet", title: "پابنـــد", count: "۱۴ محصــول", img: "/images/figma-landing/cat-anklet.webp" },
  { slug: "earring", title: "گوشــــواره", count: "۱۸ محصــول", img: "/images/figma-landing/cat-earring.webp" },
  { slug: "bracelet", title: "دســـتبند", count: "۲۳ محصــول", img: "/images/figma-landing/cat-bracelet.webp" },
  { slug: "ring", title: "انگشـــتر", count: "۲۷ محصــول", img: "/images/figma-landing/cat-ring.webp" },
  { slug: "necklace", title: "گــــردنبند", count: "۳۴ محصــول", img: "/images/figma-landing/cat-necklace.webp" },
];

/* تب‌های محصولات جدید عین فیگما نود 1:2 */
const TABS = [
  { slug: "", title: "همه محصولات", icon: "icons-20--bag" },
  { slug: "necklace", title: "گـــردنبند", icon: "icons-20--necklace" },
  { slug: "ring", title: "انگشتـــر", icon: "icons-20--ring" },
  { slug: "bracelet", title: "دســـتبند", icon: "icons-20--bracelet" },
  { slug: "earring", title: "گوشـــواره", icon: "icons-20--ear-rings" },
  { slug: "anklet", title: "پابند", icon: "icons-20--shopping-bag" },
];

const DOTS_OFFER = ["#D6DBDE", "#0A5A55", "#D6C2A1"];

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

/* کارت محصول در بخش پیشنهاد شگفت‌انگیز عین فیگما 1:2 */
function OfferCard({ p }: { p: ShopProduct }) {
  const href = p.id.startsWith("fb-") ? "/shop" : `/products/${p.slug}`;
  const oldPrice = p.oldPriceToman ?? p.priceToman;
  return (
    <div className="group relative flex flex-col justify-between bg-white p-3 md:p-3.5 text-right transition hover:bg-[#FAFBFB]">
      {/* ردیف بالا: بج تخفیف (راست در RTL) و آیکون قلب (چپ در RTL) */}
      <div className="flex items-center justify-between">
        <span className="rounded-xs bg-[#9F1239] px-2 py-0.5 text-[10px] font-extrabold text-white">
          ٪{toFa(String(p.discountPct || 20))} تخفیفـــــ
        </span>
        <button
          type="button"
          aria-label="علاقه‌مندی"
          className="text-gray-300 transition hover:text-red-500"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* تصویر محصول روی پایه سنگ مرمر سفید */}
      <Link href={href} aria-label={p.title} className="my-2 block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image || "/images/figma-landing/offers-anklet.webp"}
          alt={p.title}
          className="aspect-[154/107] w-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* نام محصول */}
      <Link href={href} className="line-clamp-1 text-xs md:text-sm font-bold text-[#161B22] hover:text-[#0A5A55]">
        {p.title}
      </Link>

      {/* نقاط رنگ انتخابی: نقره‌ای، سبز زمردی، طلایی */}
      <div className="mt-1.5 flex items-center justify-start gap-1">
        {DOTS_OFFER.map((c) => (
          <span key={c} className="h-3 w-3 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: c }} />
        ))}
      </div>

      {/* قیمت‌ها: خط‌خورده خاکستری + قیمت نهایی تومن */}
      <div className="mt-2 text-right">
        <span className="block text-[11px] text-[#8A9398] line-through font-medium">
          {priceNum(oldPrice)}
        </span>
        <span className="block text-xs md:text-sm font-extrabold text-[#161B22]">
          {priceNum(p.priceToman)} تومن
        </span>
      </div>
    </div>
  );
}

/* کارت محصول محصولات جدید عین فیگما 1:2 (شبکه یکپارچه با خطوط تفکیک) */
function NewProductCard({ p }: { p: ShopProduct }) {
  const href = p.id.startsWith("fb-") ? "/shop" : `/products/${p.slug}`;
  const oldPrice = p.oldPriceToman ?? p.priceToman;
  return (
    <div className="group relative flex flex-col justify-between bg-white p-3.5 md:p-4 text-right transition hover:bg-[#FAFBFB]">
      {/* ردیف بالا: آیکون قلب در چپ */}
      <div className="flex items-center justify-between">
        <span />
        <button
          type="button"
          aria-label="علاقه‌مندی"
          className="text-gray-300 transition hover:text-red-500"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      {/* تصویر محصول */}
      <Link href={href} aria-label={p.title} className="my-2 block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image || "/images/figma-landing/prod-ring.webp"}
          alt={p.title}
          className="aspect-[154/107] w-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      {/* عنوان محصول */}
      <Link href={href} className="line-clamp-1 text-right text-xs md:text-sm font-bold text-[#161B22] hover:text-[#0A5A55]">
        {p.title}
      </Link>

      {/* ۳ نقطه رنگی مطابق فیگما */}
      <div className="mt-1.5 flex items-center justify-start gap-1">
        {DOTS_OFFER.map((c) => (
          <span key={c} className="h-3 w-3 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: c }} />
        ))}
      </div>

      {/* ردیف قیمت */}
      <div className="mt-2 text-right">
        {oldPrice && oldPrice !== p.priceToman ? (
          <span className="block text-[11px] text-[#8A9398] line-through font-medium">
            {priceNum(oldPrice)}
          </span>
        ) : null}
        <span className="block text-xs md:text-sm font-extrabold text-[#161B22]">
          {priceNum(p.priceToman)} تومن
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
  image: "/images/figma-landing/offers-anklet.webp",
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
  image: "/images/figma-landing/prod-ring.webp",
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
    <div className="flex min-h-full flex-1 flex-col bg-[#F8FAF9]" dir="rtl">
      <Header menu={menu} />

      {/* ۱. بخش هیرو: پس‌زمینه لطیف فیگما با خطوط منحنی، بیضی‌های نعنایی، شاخه زیتون و کالیگرافی خاص‌پسندان */}
      <section className="relative overflow-hidden bg-[#FAFBFB]">
        {/* بیضی دکوراتیو سمت چپ (Ellipse 814) پشت شاخه زیتون */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-14 h-72 w-80 rounded-full bg-[#DEECEB] opacity-90 blur-[1px] md:-left-20 md:top-12 md:h-80 md:w-96"
        />

        {/* بیضی دکوراتیو سمت راست (Ellipse 813) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-28 top-16 h-80 w-96 rounded-full bg-[#DEECEB] opacity-90 blur-[1px] md:-right-24 md:top-14 md:h-96 md:w-[460px]"
        />

        {/* پترن خطوط موج‌دار گیلوش فیگما (Design Elements) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-12 z-0 h-48 md:h-56 bg-[url('/images/figma-landing/hero-waves.svg')] bg-center bg-no-repeat opacity-90"
        />

        {/* شاخه جواهر و برگ آویزان در بالا سمت چپ عین فیگما نود 245:1064 */}
        <div className="pointer-events-none absolute -top-4 -left-8 md:top-2 md:-left-6 z-10 w-52 sm:w-64 md:w-80 lg:w-[350px] select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/figma-landing/hero-branch.webp"
            alt=""
            className="h-auto w-full object-contain"
            loading="eager"
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1280px] px-4 md:px-0 pt-6 pb-12">
          {/* تیتر هیرو: خوشنویسی اختصاصی، گیومه تکی سمت چپ، تگ اکسسوری آس سمت راست */}
          <div className="relative z-10 flex items-center justify-center pt-6 md:pt-10 pb-2 md:pb-4">
            <div className="relative inline-flex items-center justify-center">
              {/* گیومه سبز تیره فقط سمت چپ عنوان (کنار پسندان و شاخه) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/figma-landing/hero-quote.webp"
                alt=""
                className="pointer-events-none absolute -left-8 sm:-left-10 md:-left-14 lg:-left-16 top-0 sm:top-0.5 md:top-1 w-5 sm:w-6 md:w-8 lg:w-10 select-none"
                aria-hidden
              />

              {/* تگ کج اکسسوری آس بالای انتخابی در سمت راست */}
              <span className="pointer-events-none absolute right-4 sm:right-6 md:right-8 -top-5 sm:-top-6 md:-top-8 select-none text-[10px] sm:text-xs md:text-sm font-bold text-[#8A9398] -rotate-[7deg] whitespace-nowrap">
                اکسسوری آس
              </span>

              {/* عنوان سئو برای دسترس‌پذیری */}
              <h1 className="sr-only">
                {settings["hero_title"] ?? "انتخابی برای خاص پسندان"}
              </h1>

              {/* تایپوگرافی کشیده خوشنویسی وکتوری عین پیوست و فیگما */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/figma-landing/hero-title-calligraphy.webp"
                alt={settings["hero_title"] ?? "انتخابی برای خاص پسندان"}
                className="h-10 sm:h-14 md:h-[72px] lg:h-[84px] w-auto max-w-[85vw] md:max-w-[900px] object-contain select-none"
                loading="eager"
              />
            </div>
          </div>

          {/* دو کارت هیرو در RTL: راست کارت معرفی و فیچرها (520px)، چپ بنر فروش ویژه (736px) */}
          <div className="mt-6 md:mt-8 grid gap-6 md:grid-cols-[520px_1fr] items-end">
            {/* ۱. کارت معرفی و فیچرها (در RTL ستون راست — 520px) */}
            <div className="flex flex-col justify-between rounded-3xl border border-black/10 bg-white p-6 md:p-8 text-right shadow-sm md:min-h-[389px]">
              <div>
                <p className="text-sm font-medium leading-7 text-[#161B22] md:text-base md:leading-8">
                  {bOfferSide?.subtitle ??
                    "جدید ترین اکسسوری های ترند را کشف کنید. مجموعه ای از گردنبند ها، دستبند ها، انگشتر ها و گوشواره های خاص که برای درخشش بیشتر استایل شما انتخاب شده‌اند."}
                </p>
                <Link
                  href={bOfferSide?.ctaHref || "/shop"}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0A5A55] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#084A46]"
                >
                  <span>{bOfferSide?.ctaLabel ?? "لیست محصولات"}</span>
                  <Icon name="icons-20--vector-arrow-left" className="h-4 w-4 brightness-0 invert" alt="" />
                </Link>
              </div>

              {/* ۴ ویژگی ۲ در ۲ مطابق فیگما */}
              <div className="mt-8 grid grid-cols-2 gap-y-5 gap-x-4 border-t border-black/5 pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D7E8E7]">
                    <Icon name="icons-20--truck" className="h-5 w-5" alt="" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-[#161B22]">حمل و نقل رایــگان</span>
                    <span className="block text-[11px] text-[#4B5563]">برای خرید بالای ۵۰۰ هزار تومن</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D7E8E7]">
                    <Icon name="icons-20--delivery" className="h-5 w-5" alt="" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-[#161B22]">تحویل اکسـپرس</span>
                    <span className="block text-[11px] text-[#4B5563]">تحویل سریع و بی تاخیر</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D7E8E7]">
                    <Icon name="icons-20--repeat" className="h-5 w-5" alt="" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-[#161B22]">ضمانت بازگشــت کالا</span>
                    <span className="block text-[11px] text-[#4B5563]">۷ روز ضمانت بازگشت کالا</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D7E8E7]">
                    <Icon name="icons-20--diamond" className="h-5 w-5" alt="" />
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-[#161B22]">کیفیت پرمیــوم</span>
                    <span className="block text-[11px] text-[#4B5563]">متریال‌ و کیفیت ساخت بی ‌نقص</span>
                  </span>
                </div>
              </div>
            </div>

            {/* ۲. بنر فروش ویژه متحرک و پویا با برش اختصاصی گوشه‌ها (Carved Notches) مطابق فیگما */}
            <HeroBannerSlider
              slides={[
                {
                  id: bHero?.id || "hero-1",
                  title: bHero?.title || "٪۷۵ تخفیــف به مناسـبت روز دختــــر",
                  subtitle: bHero?.subtitle || "اکسســوری ‌هایی برای امروز و ســـال ‌های بعد",
                  badgeLabel: "فـــروش ویـــــژه!",
                  badgeBg: "bg-[#9F1239]",
                  badgeIcon: "icons-20--discount-tag",
                  imageUrl: bHero?.imageUrl || "/images/figma-landing/hero-banner-1.webp",
                  ctaLabel: bHero?.ctaLabel || "مشاهــده بیشتــر",
                  ctaHref: bHero?.ctaHref || "/shop",
                },
                {
                  id: "curated-2",
                  title: "درخشش ماندگار با طلای ۱۸ عیار",
                  subtitle: "طراحی‌های دست‌ساز و منحصر‌به‌فرد برای هر سلیقه",
                  badgeLabel: "کالکشن جدید",
                  badgeBg: "bg-[#0A5A55]",
                  badgeIcon: "icons-20--diamond",
                  imageUrl: "/images/figma-landing/hero-banner-2.webp",
                  ctaLabel: "مشاهــده بیشتــر",
                  ctaHref: "/shop?sort=newest",
                },
                {
                  id: "curated-3",
                  title: "زیبایی خیره‌کننده با ظرافت بی‌نظیر",
                  subtitle: "تنوع بی‌نظیر انواع گوشواره، دستبند و گردنبند",
                  badgeLabel: "طرح‌های برتر",
                  badgeBg: "bg-[#8B5E1E]",
                  badgeIcon: "icons-20--star",
                  imageUrl: "/images/figma-landing/hero-banner-3.webp",
                  ctaLabel: "مشاهــده بیشتــر",
                  ctaHref: "/shop",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ۲. دسته‌بندی محصولات (CATEGORIES) */}
      <div className="mx-auto w-full max-w-[1280px] px-4 mt-16 md:mt-24">
        <section className="relative text-center">
          <p
            aria-hidden
            className="pointer-events-none select-none font-serif text-[60px] md:text-[110px] font-bold tracking-[0.15em] text-transparent leading-none opacity-40 [-webkit-text-stroke:1.5px_rgba(22,27,34,0.08)]"
          >
            CATEGORIES
          </p>
          <h2 className="-mt-8 md:-mt-14 text-2xl md:text-[40px] font-extrabold text-[#161B22]">
            {settings["cat_title"] ?? "دســـته بنـدی محصـولات"}
          </h2>
          <p className="mt-2 text-sm md:text-base font-medium text-[#8A9398]">
            {settings["cat_sub"] ?? "اکسســـوری ‌هایـی برای امــروز و ســـــال ‌های بعد"}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {CATS.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?cat=${c.slug}`}
                className="group relative flex aspect-[204/223] flex-col justify-between overflow-hidden rounded-[14px] bg-[#E8F1F0] p-4 text-center shadow-xs transition-all duration-300 hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.img}
                  alt={c.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#324948]/75 via-[#324948]/25 to-transparent" />
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-xl md:text-2xl font-extrabold text-white drop-shadow-sm tracking-tight">
                    {c.title}
                  </span>
                  <span className="mt-0.5 text-xs md:text-sm font-medium text-white/95 drop-shadow-xs">
                    {c.count}
                  </span>
                </div>
                <div className="relative z-10 mx-auto inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/35 px-3 py-1.5 backdrop-blur-md shadow-xs transition-all duration-200 group-hover:bg-white/55">
                  <span className="text-xs md:text-sm font-bold text-[#161B22] whitespace-nowrap">
                    مشاهــده بیشتــر
                  </span>
                  <span className="flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-full bg-[#0A5A55] text-white shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">
                    <svg className="h-3 w-3 md:h-3.5 md:w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 17L7 7m0 0h9m-9 0v9" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ۳. پیشنهاد شگفت‌انگیز */}
      <div className="mx-auto w-full max-w-[1280px] px-4 my-12 md:my-16">
        <section className="relative overflow-hidden rounded-3xl bg-[#02312E] bg-[url('/images/figma-landing/offers-bg.webp')] bg-cover bg-center p-5 md:p-8 shadow-xl">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(1,65,62,0.65)_0%,rgba(15,93,90,0.5)_51%,rgba(1,65,62,0.65)_100%)]" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
            {/* ستون راست در RTL: عنوان ۳ خطی + تایمر شمارش معکوس + مشاهده همه */}
            <div className="flex flex-col items-center justify-center text-center shrink-0 w-full md:w-44 gap-4">
              <p className="text-center font-extrabold text-white text-3xl md:text-[38px] leading-[1.25] tracking-tight">
                پیشنــهاد
                <br />
                شــگــفت
                <br />
                انگـــــــیز
              </p>

              <div className="flex items-center justify-center gap-1.5" dir="rtl">
                <div className="flex flex-col items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-extrabold text-[#0D2B28] text-base md:text-lg shadow-sm">
                    {timer.mins}
                  </span>
                  <span className="mt-1 text-[11px] font-bold text-white/90">دقیقه</span>
                </div>

                <span className="text-lg font-bold text-white mb-4">:</span>

                <div className="flex flex-col items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-extrabold text-[#0D2B28] text-base md:text-lg shadow-sm">
                    {timer.hours}
                  </span>
                  <span className="mt-1 text-[11px] font-bold text-white/90">ساعت</span>
                </div>

                <span className="text-lg font-bold text-white mb-4">:</span>

                <div className="flex flex-col items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-extrabold text-[#0D2B28] text-base md:text-lg shadow-sm">
                    {timer.days}
                  </span>
                  <span className="mt-1 text-[11px] font-bold text-white/90">روز</span>
                </div>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-1 text-sm font-bold text-white/90 hover:text-white transition group"
              >
                <span>مشاهده همه</span>
                <span className="text-xs">‹</span>
              </Link>
            </div>

            {/* ۵ کارت محصول با دکمه شناور سمت چپ (در RTL ستون چپ) */}
            <div className="relative flex-1 w-full">
              <Link
                href="/shop"
                aria-label="مشاهده همه پیشنهادها"
                className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#161B22] shadow-xl hover:bg-gray-50 border border-gray-100 transition hover:scale-105"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </Link>

              <div className="overflow-hidden rounded-2xl bg-white shadow-md">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-x-reverse divide-gray-100">
                  {offers.map((p) => (
                    <OfferCard key={p.id} p={p} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ۴. دو بنر میانی */}
      <div className="mx-auto w-full max-w-[1280px] px-4 my-8">
        <section className="grid gap-6 md:grid-cols-2">
          {/* بنر سمت راست (تیره: بهترین گوشواره و دستبندها) */}
          <div className="relative min-h-[340px] md:min-h-[362px] overflow-hidden rounded-[14px] bg-[#062e2b] shadow-sm flex flex-col justify-between p-6 md:p-8 text-right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bMidB?.imageUrl || "/images/figma-landing/mid-earring-bracelet.webp"}
              alt={bMidB?.title ?? "بهترین گوشواره و دستبندها"}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="relative z-10">
              <p className="text-2xl md:text-[30px] font-black text-[#F8FAF9] leading-tight">
                {bMidB?.title ?? (
                  <>
                    بهترین گوشواره
                    <br />و دستبند ها
                  </>
                )}
              </p>
              <p className="mt-3 max-w-xs text-xs md:text-sm font-medium text-[#C4CBD2] leading-6">
                {bMidB?.subtitle ?? "گوشواره و دستبند های ظریف و مدرن برای تکمیل استایل روزمره و خاص شما"}
              </p>
            </div>

            <div className="relative z-10 mt-auto flex justify-end">
              <Link
                href={bMidB?.ctaHref || "/shop"}
                className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pr-4 pl-1.5 text-sm font-bold text-[#161B22] shadow-sm transition hover:scale-105"
              >
                <span>{bMidB?.ctaLabel ?? "مشاهــده بیشتــر"}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A5A55] text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* بنر سمت چپ (روشن: ظرافتی که همراه تو می‌ماند) */}
          <div className="relative min-h-[340px] md:min-h-[362px] overflow-hidden rounded-[14px] bg-[#D7E8E7] shadow-sm flex flex-col justify-between p-6 md:p-8 text-right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bMidA?.imageUrl || "/images/figma-landing/mid-ring.webp"}
              alt={bMidA?.title ?? "ظرافتی که همراه تو می‌ماند"}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />

            <div className="relative z-10 flex justify-end">
              <Link
                href={bMidA?.ctaHref || "/shop"}
                className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pr-4 pl-1.5 text-sm font-bold text-[#161B22] shadow-sm transition hover:scale-105"
              >
                <span>{bMidA?.ctaLabel ?? "مشاهــده بیشتــر"}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A5A55] text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </span>
              </Link>
            </div>

            <div className="relative z-10 mt-auto mb-4">
              <p className="text-2xl md:text-[32px] font-black text-[#01413E] leading-snug">
                {bMidA?.title ?? (
                  <>
                    ظرافتی که همراه
                    <br />
                    تو می‌ماند
                  </>
                )}
              </p>
              {bMidA?.subtitle && (
                <p className="mt-2 max-w-sm text-sm font-bold text-[#0A5A55] leading-7">
                  {bMidA.subtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ۵. محصولات جدید (New Products) */}
      <div className="mx-auto w-full max-w-[1280px] px-4 my-10 md:my-14">
        <section>
          {/* هدر بخش: عنوان راست + مشاهده همه چپ */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-7 w-1.5 rounded-full bg-[#0A5A55]" />
              <h2 className="text-xl md:text-[28px] font-black text-[#161B22]">
                {settings["new_title"] ?? "مـحـصــولات جـــــدیــد"}
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white py-1.5 pr-4 pl-1.5 text-xs md:text-sm font-bold shadow-xs hover:bg-gray-50"
            >
              <span>مشاهــده همه</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A5A55] text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </span>
            </Link>
          </div>

          {/* بدنه بخش در RTL: سایدبار دسته‌بندی در راست + گرید یکپارچه ۸ تایی در چپ */}
          <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
            {/* ۱. سایدبار دسته‌بندی‌ها (در RTL ستون راست) */}
            <aside className="h-fit rounded-2xl border border-black/5 bg-white p-2 shadow-xs">
              {TABS.map((t, i) => (
                <span key={t.title}>
                  <Link
                    href={t.slug ? `/shop?cat=${t.slug}` : "/shop"}
                    className={`flex items-center justify-between px-3.5 py-3 text-xs md:text-sm font-bold transition-colors ${
                      i === 0
                        ? "rounded-xl bg-[#E7EFEE] text-[#01413E] border-r-3 border-[#0A5A55]"
                        : "text-[#161B22] hover:bg-[#F8FAF9] rounded-xl"
                    }`}
                  >
                    <span>{t.title}</span>
                    <Icon name={t.icon} className="h-5 w-5" alt="" />
                  </Link>
                  {i < TABS.length - 1 && <span className="my-1 block border-b border-black/5" />}
                </span>
              ))}
            </aside>

            {/* ۲. گرید یکپارچه محصولات (در RTL ستون چپ) با خطوط تفکیک ظریف */}
            <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-y divide-gray-100">
                {newest.map((p) => (
                  <NewProductCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ۶. بنر درخشش در هر نگاه */}
      <div className="mx-auto w-full max-w-[1280px] px-4 my-10 md:my-14">
        <section className="relative overflow-hidden rounded-3xl bg-[#062e2b] bg-[url('/images/figma-landing/shine-bg.webp')] bg-cover bg-center min-h-[340px] md:min-h-[362px] p-6 md:p-12 shadow-xl">
          <div className="relative z-10 grid items-center gap-6 md:grid-cols-2">
            {/* ستون متن در سمت راست */}
            <div className="text-right">
              <h2 className="text-3xl md:text-[48px] font-black text-[#F8FAF9] leading-tight">
                {bShine?.title ?? "درخــشش در هــر نگـــاه"}
              </h2>
              <p className="mt-3 text-base md:text-[22px] font-bold text-[#C4CBD2] leading-snug">
                {bShine?.subtitle ?? "جزئیـاتــی کوچــک با تأثیــری بـزرگ بر استـایل شمــا"}
              </p>
              <Link
                href={bShine?.ctaHref || "/shop"}
                className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#41534E]/80 backdrop-blur-md border border-white/15 py-1.5 pr-5 pl-2 text-sm md:text-base font-bold text-white transition hover:bg-[#41534E]"
              >
                <span>{bShine?.ctaLabel ?? "مشاهده محصولات"}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#0A5A55]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* ستون انگشتر زمرد درخشان در سمت چپ */}
            <div className="relative flex items-center justify-center md:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/figma-landing/shine-ring.webp"
                alt="انگشتر زمرد درخشش"
                className="h-64 md:h-80 w-auto object-contain drop-shadow-2xl"
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
