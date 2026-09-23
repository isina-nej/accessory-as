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
/* ترتیب و متن‌ها عین فیگما node 1:2 و اسکرین‌شات کاربر — راست‌به‌چپ: پابند، گوشواره، دستبند، انگشتر، گردنبند */
const CATS = [
  { slug: "anklet", title: "پابند", count: "۱۴ محصول", img: "/images/figma-landing/cat-anklet.webp" },
  { slug: "earring", title: "گوشواره", count: "۱۸ محصول", img: "/images/figma-landing/cat-earring.webp" },
  { slug: "bracelet", title: "دستبند", count: "۲۳ محصول", img: "/images/figma-landing/cat-bracelet.webp" },
  { slug: "ring", title: "انگشتر", count: "۲۷ محصول", img: "/images/figma-landing/cat-ring.webp" },
  { slug: "necklace", title: "گردنبند", count: "۳۴ محصول", img: "/images/figma-landing/cat-necklace.webp" },
];

const TABS = [
  { slug: "", title: "همه محصولات", icon: "icons-20--bag" },
  { slug: "necklace", title: "گردنبند", icon: "icons-20--necklace" },
  { slug: "ring", title: "انگشتر", icon: "icons-20--ring" },
  { slug: "bracelet", title: "دستبند", icon: "icons-20--bracelet" },
  { slug: "earring", title: "گوشواره", icon: "icons-20--ear-rings" },
  { slug: "anklet", title: "پابند", icon: "icons-20--shopping-bag" },
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

/* کارت محصول در بخش پیشنهاد شگفت‌انگیز عین اسکرین‌شات فیگما */
function OfferCard({ p }: { p: ShopProduct }) {
  const href = p.id.startsWith("fb-") ? "/shop" : `/products/${p.slug}`;
  const oldPrice = p.oldPriceToman ?? p.priceToman;
  return (
    <div className="group relative flex flex-col justify-between bg-white p-3 md:p-3.5 text-right transition hover:bg-[#FAFBFB]">
      {/* ردیف بالا: آیکون قلب و بج تخفیف */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="علاقه‌مندی"
          className="text-gray-300 transition hover:text-red-500"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        <span className="rounded-xs bg-[#9F1239] px-2 py-0.5 text-[10px] font-extrabold text-white">
          ٪{toFa(String(p.discountPct || 20))} تخفیفـــــ
        </span>
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

      {/* ۳ نقطه رنگ انتخابی: نقره‌ای، سبز زمردی، طلایی */}
      <div className="mt-1.5 flex items-center justify-start gap-1">
        {DOTS.map((c) => (
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

      {/* هیرو روی بک‌گراند ملایم با خطوط مواج و شاخه زیتون/جواهر عین عکس */}
      <div className="relative overflow-hidden bg-[#FAFBFB] bg-[url('/images/figma-landing/hero-pattern.svg')] bg-top bg-no-repeat">
        {/* شاخه برگ و جواهر آویزان در بالا سمت چپ */}
        <div className="pointer-events-none absolute -top-8 -left-12 z-10 w-64 md:w-96 select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/figma-landing/hero-branch.webp"
            alt=""
            className="h-auto w-full object-contain"
            loading="eager"
          />
        </div>

        {/* فرم موج ملایم در لبه راست */}
        <div className="pointer-events-none absolute top-28 -right-8 h-32 w-32 rounded-full bg-[#E8F1F0] opacity-70 blur-xs" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pt-6 pb-10">
          {/* بخش تیتر هیرو: گیومه چپ + تیتر بزرگ با هاله سفید + لیبل بالای راست */}
          <section className="relative text-center">
            <div className="mx-auto flex max-w-5xl items-center justify-center gap-3">
              {/* گیومه سبز تیره */}
              <span aria-hidden className="font-serif text-5xl font-black text-[#01413E] select-none md:text-7xl">
                “
              </span>

              {/* تیتر و لیبل */}
              <div className="relative">
                <span className="absolute -top-5 right-2 text-xs font-medium text-[#8A9398] md:text-sm">
                  اکسسوری آس
                </span>
                <h1 className="text-3xl font-black text-[#01413E] drop-shadow-[0_2px_10px_rgba(255,255,255,1)] md:text-[54px] md:leading-[1.4]">
                  {settings["hero_title"] ?? "انتخابی برای خاص پسندان"}
                </h1>
              </div>
            </div>
          </section>

          {/* گرید دو کارت: چپ بنر فروش ویژه، راست پنل معرفی */}
          <section className="mt-8 grid gap-5 md:grid-cols-2">
            {/* بنر فروش ویژه (سمت چپ در تصویر) */}
            <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-[#062e2b] shadow-sm md:min-h-[420px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bHero?.imageUrl || "/images/figma-new/hero-banner.webp"}
                alt={bHero?.title ?? "فروش ویژه"}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* دکمه کپسولی شناور مشاهده بیشتر در بالا سمت چپ */}
              <Link
                href={bHero?.ctaHref || "/shop"}
                className="absolute top-4 left-4 z-20 inline-flex items-center gap-2 rounded-full bg-white py-1.5 pr-3.5 pl-1.5 shadow-md transition-transform hover:scale-105"
              >
                <span className="text-xs font-bold text-[#161B22]">
                  {bHero?.ctaLabel ?? "مشاهده بیشتر"}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A5A55] text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </span>
              </Link>

              {/* نشان فروش ویژه در بالا سمت راست */}
              <div className="absolute top-6 right-6 inline-flex items-center gap-2 rounded-full bg-[#9F1239] px-5 py-2 shadow-md">
                <span className="text-base font-black text-white">فروش ویژه!</span>
                <Icon name="icons-20--discount-tag" className="h-5 w-5 brightness-0 invert" alt="" />
              </div>

              {/* متون بنر در سمت راست */}
              <div className="absolute top-22 right-6 max-w-sm text-right">
                <p className="text-2xl font-black text-white leading-tight md:text-[32px]">
                  {bHero?.title ?? "٪۷۵ تخفیف به مناسبت روز دختر"}
                </p>
                <p className="mt-2 text-sm font-medium text-white/85 md:text-base">
                  {bHero?.subtitle ?? "اکسسوری هایی برای امروز و سال های بعد"}
                </p>
              </div>

              {/* اسلایدر تبی در پایین سمت راست */}
              <div className="absolute bottom-0 right-16 flex items-center gap-4 rounded-t-2xl bg-white px-6 py-2 shadow-sm md:right-24" dir="rtl">
                <span className="text-xs font-medium text-[#8A9398]">۰۱</span>
                <span className="flex flex-col items-center gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0A5A55]" />
                  <span className="h-0.5 w-7 rounded-full bg-[#0A5A55]" />
                  <span className="text-xs font-extrabold text-[#161B22]">۰۲</span>
                </span>
                <span className="text-xs font-medium text-[#8A9398]">۰۳</span>
              </div>
            </div>

            {/* کارت معرفی و فیچرها (سمت راست در تصویر) */}
            <div className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white p-6 md:p-8 text-right shadow-sm">
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

              {/* ۴ ویژگی ۲ در ۲ مطابق اسکرین‌شات */}
              <div className="mt-8 grid grid-cols-2 gap-y-5 gap-x-4">
                {/* ستون راست در RTL: حمل و نقل رایگان / ضمانت بازگشت کالا */}
                <div className="flex items-center gap-3">
                  <span>
                    <span className="block text-xs font-bold text-[#161B22]">حمل و نقل رایگان</span>
                    <span className="block text-[11px] text-[#4B5563]">برای خرید بالای ۵۰۰ هزار تومن</span>
                  </span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D7E8E7]">
                    <Icon name="icons-20--truck" className="h-5 w-5" alt="" />
                  </span>
                </div>

                {/* ستون چپ در RTL: تحویل اکسپرس / کیفیت پرمیوم */}
                <div className="flex items-center gap-3">
                  <span>
                    <span className="block text-xs font-bold text-[#161B22]">تحویل اکسپرس</span>
                    <span className="block text-[11px] text-[#4B5563]">تحویل سریع و بی تاخیر</span>
                  </span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D7E8E7]">
                    <Icon name="icons-20--delivery" className="h-5 w-5" alt="" />
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span>
                    <span className="block text-xs font-bold text-[#161B22]">ضمانت بازگشت کالا</span>
                    <span className="block text-[11px] text-[#4B5563]">۷ روز ضمانت بازگشت کالا</span>
                  </span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D7E8E7]">
                    <Icon name="icons-20--repeat" className="h-5 w-5" alt="" />
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span>
                    <span className="block text-xs font-bold text-[#161B22]">کیفیت پرمیوم</span>
                    <span className="block text-[11px] text-[#4B5563]">متریال و کیفیت ساخت بی‌نقص</span>
                  </span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D7E8E7]">
                    <Icon name="icons-20--diamond" className="h-5 w-5" alt="" />
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* دسته‌بندی محصولات */}
      <div className="mx-auto w-full max-w-7xl px-4 mt-12 md:mt-16">
        <section className="relative text-center">
          <p
            aria-hidden
            className="pointer-events-none select-none font-serif text-[60px] md:text-[110px] font-bold tracking-[0.15em] text-transparent leading-none opacity-40 [-webkit-text-stroke:1.5px_rgba(22,27,34,0.08)]"
          >
            CATEGORIES
          </p>
          <h2 className="-mt-7 md:-mt-14 text-2xl md:text-[40px] font-extrabold text-[#161B22]">
            {settings["cat_title"] ?? "دسته‌ بندی محصولات"}
          </h2>
          <p className="mt-2 text-sm md:text-base font-medium text-[#8A9398]">
            {settings["cat_sub"] ?? "اکسسوری هایی برای امروز و ســــال های بعد"}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {CATS.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?cat=${c.slug}`}
                className="group relative flex aspect-[204/223] flex-col justify-between overflow-hidden rounded-2xl bg-[#E8F1F0] p-4 text-center shadow-xs transition-all duration-300 hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.img}
                  alt={c.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#1F2D2D]/60 via-[#1F2D2D]/20 to-transparent" />
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-xl md:text-2xl font-extrabold text-white drop-shadow-sm tracking-tight">
                    {c.title}
                  </span>
                  <span className="mt-0.5 text-xs md:text-sm font-medium text-white/95 drop-shadow-xs">
                    {c.count}
                  </span>
                </div>
                <div className="relative z-10 mx-auto inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#D7E8E7]/35 px-3 py-1.5 backdrop-blur-md shadow-xs transition-all duration-200 group-hover:bg-[#D7E8E7]/55">
                  <span className="text-xs md:text-sm font-bold text-[#161B22] whitespace-nowrap">
                    مشاهده بیشتر
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

      {/* پیشنهاد شگفت‌انگیز */}
      <div className="mx-auto w-full max-w-7xl px-4 my-10 md:my-14">
        <section className="relative overflow-hidden rounded-[20px] md:rounded-[24px] bg-[#02312E] bg-[url('/images/figma-landing/offers-bg.webp')] bg-cover bg-center p-5 md:p-7 shadow-xl">
          {/* Subtle gradient overlay on top of silk texture */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(1,65,62,0.65)_0%,rgba(15,93,90,0.5)_51%,rgba(1,65,62,0.65)_100%)]" />

          <div className="relative z-10 flex flex-col-reverse md:flex-row items-center gap-5 md:gap-6 justify-between">
            {/* Cards container with floating left arrow */}
            <div className="relative flex-1 w-full">
              {/* Floating circular arrow on left */}
              <Link
                href="/shop"
                aria-label="مشاهده همه پیشنهادها"
                className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-white text-[#161B22] shadow-xl hover:bg-gray-50 border border-gray-100 transition hover:scale-105"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </Link>

              {/* 5 Seamless Cards in single white box */}
              <div className="overflow-hidden rounded-xl md:rounded-2xl bg-white shadow-md">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-x-reverse divide-gray-100">
                  {offers.map((p) => (
                    <OfferCard key={p.id} p={p} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Title + Timer + View All */}
            <div className="flex flex-col items-center justify-center text-center shrink-0 w-full md:w-44 gap-4">
              <p className="text-center font-extrabold text-white text-3xl md:text-[38px] leading-[1.25] tracking-tight">
                پیشنـهاد
                <br />
                شـگـفت
                <br />
                انگـــــیز
              </p>

              <div className="flex items-center justify-center gap-1.5" dir="rtl">
                {/* دقیقه */}
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-white font-extrabold text-[#0D2B28] text-base md:text-lg shadow-sm">
                    {timer.mins}
                  </span>
                  <span className="mt-1 text-[11px] font-medium text-white/90">دقیقه</span>
                </div>

                <span className="text-lg font-bold text-white mb-4">:</span>

                {/* ساعت */}
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-white font-extrabold text-[#0D2B28] text-base md:text-lg shadow-sm">
                    {timer.hours}
                  </span>
                  <span className="mt-1 text-[11px] font-medium text-white/90">ساعت</span>
                </div>

                <span className="text-lg font-bold text-white mb-4">:</span>

                {/* روز */}
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-lg bg-white font-extrabold text-[#0D2B28] text-base md:text-lg shadow-sm">
                    {timer.days}
                  </span>
                  <span className="mt-1 text-[11px] font-medium text-white/90">روز</span>
                </div>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white transition group"
              >
                <Icon name="icons-20--direction-left" className="h-4 w-4 brightness-0 invert transition-transform group-hover:-translate-x-1" alt="" />
                مشاهده همه
              </Link>
            </div>
          </div>
        </section>
      </div>

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
