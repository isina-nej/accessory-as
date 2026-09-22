import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { formatToman, toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { getOffers } from "@/lib/get-products";
import { getPublicBanners, getPublicCampaign, getPublicSettings } from "@/lib/cms-public";
import { type ShopProduct } from "@/lib/products";

export const revalidate = 60;

const DEFAULT_CATS = [
  { slug: "necklace", title: "گردنبند", count: "۳۴ محصول", img: "/images/cat-necklace.webp" },
  { slug: "ring", title: "انگشتر", count: "۲۷ محصول", img: "/images/cat-ring.webp" },
  { slug: "bracelet", title: "دستبند", count: "۲۳ محصول", img: "/images/cat-bracelet.webp" },
  { slug: "earring", title: "گوشواره", count: "۱۸ محصول", img: "/images/cat-earring.webp" },
  { slug: "anklet", title: "پابند", count: "۱۴ محصول", img: "/images/cat-anklet.webp" },
];

const PERKS = [
  { icon: "icons-20--delivery", title: "تحویل اکسپرس", sub: "تحویل سریع و بی‌تاخیر" },
  { icon: "icons-20--trolley", title: "حمل و نقل رایگان", sub: "برای خرید بالای ۵۰۰ هزار تومن" },
  { icon: "icons-20--check-circle", title: "کیفیت پرمیوم", sub: "متریال و کیفیت ساخت بی‌نقص" },
  { icon: "icons-20--repeat", title: "ضمانت بازگشت کالا", sub: "۷ روز ضمانت بازگشت کالا" },
];

const TABS = ["همه محصولات", "گردنبند", "انگشتر", "دستبند", "گوشواره", "پابند"];

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

function LandingCard({ p }: { p: ShopProduct }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white">
      <div className="relative bg-[#f4f6f6] p-3">
        <button aria-label="علاقه‌مندی" className="absolute top-2 right-2 text-black/30 hover:text-(--color-wine)">
          <Icon name="icons-20--favorite-icon" className="h-4 w-4" />
        </button>
        {p.discountPct ? (
          <span className="absolute top-2 left-2 rounded bg-(--color-wine) px-1.5 py-0.5 text-[10px] font-bold text-white">
            {toFa(`٪${p.discountPct}`)} تخفیف
          </span>
        ) : null}
        <Link href={`/products/${p.slug}`} className="flex aspect-square items-center justify-center" aria-label={p.title}>
          {p.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/images/product-01.webp" alt={p.title} className="h-full w-full object-cover" loading="lazy" />
          )}
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 text-center">
        <p className="text-[11px] text-(--color-muted-fg)">انگشتر</p>
        <Link href={`/products/${p.slug}`} className="text-[13px] font-bold">
          {p.title}
        </Link>
        <div className="mt-1 flex items-center justify-center gap-1">
          <span className="h-3 w-3 rounded-full bg-[#0a5954]" />
          <span className="h-3 w-3 rounded-full bg-[#d6c2a1]" />
        </div>
        <div className="mt-1">
          {p.oldPriceToman ? (
            <p className="text-[11px] text-(--color-muted-fg) line-through">{formatToman(p.oldPriceToman)}</p>
          ) : null}
          <p className="text-sm font-extrabold">{formatToman(p.priceToman)}</p>
        </div>
      </div>
    </div>
  );
}

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

  // Dynamic slot data with defaults
  const bHero = banners["hero"];
  const bOfferSide = banners["offer-side"];
  const bMidA = banners["mid-a"];
  const bMidB = banners["mid-b"];
  const bShine = banners["shine"];

  const heroSub = settings["hero_sub"] ?? "اکسسوری آس";
  const heroTitle = settings["hero_title"] ?? "انتخابی برای خاص‌پسندان";
  const catTitle = settings["cat_title"] ?? "دسته‌بندی محصولات";
  const catSub = settings["cat_sub"] ?? "اکسسوری‌هایی برای امروز و سال‌های بعد";
  const offerTitle = campaign?.title ?? settings["offer_title"] ?? "پیشنهاد شگفت‌انگیز";
  const newTitle = settings["new_title"] ?? "محصولات جدید";

  const timer = getRemainingTime(campaign?.endsAt);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4">
        <Breadcrumb trail={[{ label: "اکسسوری آس" }]} />

        {/* هیرو — داینامیک از CMS */}
        <section className="mt-2 text-center">
          <p className="text-xs text-(--color-muted-fg)">{heroSub}</p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#0b3b38] md:text-5xl">{heroTitle}</h1>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {/* بنر فروش ویژه راست — عکس فیگما */}
            <div className="relative overflow-hidden rounded-2xl bg-[#062e2b] text-right text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bHero?.imageUrl || "/images/banner-hero.webp"}
                alt={bHero?.title ?? "فروش ویژه"}
                className="absolute inset-0 h-full w-full object-cover opacity-90"
              />
              <div className="relative p-6 md:p-8">
                <span className="inline-flex items-center gap-1 rounded-full bg-(--color-wine) px-3 py-1 text-xs font-bold">
                  فروش ویژه!
                </span>
                <p className="mt-4 text-xl font-extrabold md:text-3xl">
                  {bHero?.title ?? "٪۷۵ تخفیف به مناسبت روز دختر"}
                </p>
                <p className="mt-2 text-sm text-white/80">
                  {bHero?.subtitle ?? "اکسسوری‌هایی برای امروز و سال‌های بعد"}
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs">
                  <span className="rounded bg-white/15 px-2 py-1">۰۱</span>
                  <span className="rounded bg-white/15 px-2 py-1">۰۲</span>
                  <span className="rounded bg-white/15 px-2 py-1">۰۳</span>
                </div>
                <Link
                  href={bHero?.ctaHref || "/shop"}
                  className="mt-6 inline-flex items-center gap-1 text-xs text-white/90 underline-offset-4 hover:underline"
                >
                  {bHero?.ctaLabel ?? "مشاهده بیشتر"} <Icon name="icons-20--vector-arrow-left" className="h-3.5 w-3.5 brightness-0 invert" />
                </Link>
              </div>
            </div>

            {/* کارت معرفی چپ */}
            <div className="rounded-2xl border border-black/10 bg-white p-6 text-right md:p-8">
              <p className="text-sm leading-7 text-(--color-muted-fg)">
                {bOfferSide?.subtitle ??
                  "جدیدترین اکسسوری‌های ترند را کشف کنید. مجموعه‌ای از گردنبندها، دستبندها، انگشترها و گوشواره‌های خاص برای درخشش بیشتر استایل شما آماده‌اند."}
              </p>
              <Link
                href={bOfferSide?.ctaHref || "/shop"}
                className="mt-4 inline-flex items-center gap-1 rounded-lg bg-[#0a5954] px-4 py-2 text-sm font-bold text-white"
              >
                {bOfferSide?.ctaLabel ?? "لیست محصولات"} <Icon name="icons-20--vector-arrow-left" className="h-4 w-4 brightness-0 invert" />
              </Link>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {PERKS.map((f) => (
                  <div key={f.title} className="flex items-center gap-2 rounded-xl bg-(--color-mist) p-2.5">
                    <Icon name={f.icon} className="h-4 w-4 shrink-0" />
                    <span>
                      <span className="block text-xs font-bold">{f.title}</span>
                      <span className="block text-[11px] text-(--color-muted-fg)">{f.sub}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* دسته‌بندی محصولات */}
        <section className="mt-12 text-center">
          <p className="text-xs tracking-widest text-black/10 select-none" aria-hidden>CATEGORIES</p>
          <h2 className="text-xl font-extrabold md:text-2xl">{catTitle}</h2>
          <p className="mt-1 text-xs text-(--color-muted-fg)">{catSub}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {DEFAULT_CATS.map((c) => (
              <Link key={c.slug} href={`/shop?cat=${c.slug}`} className="group relative overflow-hidden rounded-2xl border border-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={c.title} className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-10 text-center text-white">
                  <p className="text-sm font-extrabold">{c.title}</p>
                  <p className="text-[11px] opacity-80">{c.count}</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] text-[#161b22]">
                    مشاهده بیشتر <Icon name="icons-20--direction-left" className="h-3 w-3" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* پیشنهاد شگفت‌انگیز */}
        <section className="mt-10 overflow-hidden rounded-2xl bg-[#062e2b] p-4 text-white md:p-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex shrink-0 flex-col items-start justify-center gap-2 md:w-44">
              <h2 className="text-xl leading-8 font-extrabold">
                {offerTitle.includes(" ") ? (
                  <>
                    {offerTitle.split(" ").map((w, i) => (
                      <span key={i} className="block">{w}</span>
                    ))}
                  </>
                ) : (
                  offerTitle
                )}
              </h2>
              <div className="flex items-center gap-1 text-center" dir="ltr">
                <span className="rounded bg-white/15 px-2 py-1 text-xs">{timer.days} <small>روز</small></span>:
                <span className="rounded bg-white/15 px-2 py-1 text-xs">{timer.hours} <small>ساعت</small></span>:
                <span className="rounded bg-white/15 px-2 py-1 text-xs">{timer.mins} <small>دقیقه</small></span>
              </div>
              <Link href="/shop" className="mt-1 inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline">
                مشاهده همه <Icon name="icons-20--direction-left" className="h-3.5 w-3.5 brightness-0 invert" />
              </Link>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3 rounded-xl bg-white p-3 text-ink sm:grid-cols-3 md:grid-cols-5">
              {(offers.length > 0 ? offers : []).map((p) => (
                <LandingCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>

        {/* دو بنر میانی — عکس فیگما */}
        <section className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-[#0d3f3b] text-white md:min-h-70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bMidA?.imageUrl || "/images/banner-mid-a.webp"}
              alt={bMidA?.title ?? "گوشواره و دستبند"}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="relative p-6 md:p-8">
              <p className="text-lg leading-8 font-extrabold whitespace-pre-line">
                {bMidA?.title ?? "بهترین گوشواره‌ها\nو دستبندها"}
              </p>
              <p className="mt-2 max-w-55 text-xs leading-6 text-white/75">
                {bMidA?.subtitle ?? "گوشواره‌ها و دستبندهای خاص و مدرن برای تکمیل استایل روزانه و خاص شما"}
              </p>
              <Link
                href={bMidA?.ctaHref || "/shop"}
                className="mt-4 inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline"
              >
                {bMidA?.ctaLabel ?? "مشاهده بیشتر"} <Icon name="icons-20--vector-arrow-left" className="h-3.5 w-3.5 brightness-0 invert" />
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-[#dce7e5] md:min-h-70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bMidB?.imageUrl || "/images/banner-mid-b.webp"}
              alt={bMidB?.title ?? "ظرافت"}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="relative p-6 md:p-8">
              <p className="text-lg leading-8 font-extrabold text-[#0b3b38] whitespace-pre-line">
                {bMidB?.title ?? "ظرافتی که همراه\nتو می‌ماند"}
              </p>
              <Link
                href={bMidB?.ctaHref || "/shop"}
                className="mt-4 inline-flex items-center gap-1 text-xs text-[#0b3b38] underline-offset-4 hover:underline"
              >
                {bMidB?.ctaLabel ?? "مشاهده بیشتر"} <Icon name="icons-20--vector-arrow-left" className="h-3.5 w-3.5 brightness-0 invert" />
              </Link>
            </div>
          </div>
        </section>

        {/* محصولات جدید + تب دسته */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="border-l-2 border-(--color-brand) pl-2 text-lg font-extrabold">{newTitle}</h2>
            <Link href="/shop" className="rounded-full border px-3 py-1 text-xs">مشاهده همه</Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr]">
            <aside className="h-fit rounded-xl border border-black/10 bg-white p-2">
              <p className="rounded-lg bg-(--color-mist) p-2 text-xs font-bold">همه محصولات</p>
              <ul className="mt-1 space-y-1 text-[13px]">
                {TABS.slice(1).map((t) => (
                  <li key={t}>
                    <Link href="/shop" className="block rounded-lg px-2 py-1.5 hover:bg-(--color-mist)">{t}</Link>
                  </li>
                ))}
              </ul>
            </aside>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {newest.map((p) => (
                <LandingCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>

        {/* بنر درخشش — عکس فیگما */}
        <section className="relative mt-10 overflow-hidden rounded-2xl bg-[#062e2b] text-center text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bShine?.imageUrl || "/images/banner-shine.webp"}
            alt={bShine?.title ?? "درخشش"}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative p-8 md:p-12">
            <h2 className="text-2xl font-extrabold md:text-4xl">{bShine?.title ?? "درخشش در هر نگاه"}</h2>
            <p className="mt-2 text-sm text-white/80">{bShine?.subtitle ?? "جزئیاتی کوچک با تاثیری بزرگ بر استایل شما"}</p>
            <Link
              href={bShine?.ctaHref || "/shop"}
              className="mt-5 inline-flex items-center gap-1 rounded-full border border-white/40 px-5 py-2 text-sm"
            >
              {bShine?.ctaLabel ?? "مشاهده محصولات"} <Icon name="icons-20--vector-arrow-left" className="h-4 w-4 brightness-0 invert" />
            </Link>
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
