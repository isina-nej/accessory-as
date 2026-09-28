"use client";

import { useState, useEffect, useRef, useId, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export interface HeroSlide {
  id: string | number;
  title: string;
  subtitle?: string;
  badgeLabel?: string;
  badgeBg?: string;
  badgeIcon?: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    title: "٪۷۵ تخفیــف به مناسـبت روز دختــــر",
    subtitle: "اکسســوری ‌هایی برای امروز و ســـال ‌های بعد",
    badgeLabel: "فـــروش ویـــــژه!",
    badgeBg: "bg-[#9F1239]",
    badgeIcon: "icons-20--discount-tag",
    imageUrl: "/images/figma-landing/hero-banner-1.webp",
    ctaLabel: "مشاهــده بیشتــر",
    ctaHref: "/shop?sort=discount",
  },
  {
    id: "slide-2",
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
    id: "slide-3",
    title: "زیبایی خیره‌کننده با ظرافت بی‌نظیر",
    subtitle: "تنوع بی‌نظیر انواع گوشواره، دستبند و گردنبند",
    badgeLabel: "طرح‌های برتر",
    badgeBg: "bg-[#8B5E1E]",
    badgeIcon: "icons-20--star",
    imageUrl: "/images/figma-landing/hero-banner-3.webp",
    ctaLabel: "مشاهــده بیشتــر",
    ctaHref: "/shop",
  },
];

const FA_NUMS = ["۰۱", "۰۲", "۰۳", "۰۴", "۰۵"];

interface HeroBannerSliderProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
  initialSlideIndex?: number;
}

export function HeroBannerSlider({
  slides: propSlides,
  autoPlayInterval = 5500,
  initialSlideIndex = 0,
}: HeroBannerSliderProps) {
  const slides = propSlides && propSlides.length > 0 ? propSlides : DEFAULT_SLIDES;
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const clipId = `banner-cutout-${rawId.replace(/[:]/g, "")}`;

  // Dimensions for dynamic SVG clipPath
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 736, h: 449 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDims = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDims({
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        });
      }
    };

    updateDims();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDims({
            w: Math.round(width),
            h: Math.round(height),
          });
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Auto-play timer
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, autoPlayInterval, nextSlide, slides.length]);

  // Touch gesture handling
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  const isMobile = dims.w < 640;
  // Exact notch proportions matching Figma reference
  // nw1 and nh1 accommodate the "مشاهده بیشتر" pill button
  const nw1 = isMobile ? 148 : 178; 
  const nh1 = isMobile ? 46 : 52;  
  // nw2 and nh2 accommodate the pagination tabs (۰۱, ۰۲, ۰۳)
  const nw2 = isMobile ? 142 : 168; 
  const nh2 = isMobile ? 50 : 58;  
  const R = isMobile ? 22 : 28;    // main outer corners radius
  const r = isMobile ? 16 : 20;    // notch fillet radius

  // Calculate SVG clip path with smooth concave fillets
  const w = dims.w;
  const h = dims.h;

  const pathD = [
    `M ${nw1 + r} 0`,
    `L ${w - R} 0`,
    `A ${R} ${R} 0 0 1 ${w} ${R}`,
    `L ${w} ${h - nh2 - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${h - nh2}`,
    `L ${w - nw2 + r} ${h - nh2}`,
    `A ${r} ${r} 0 0 0 ${w - nw2} ${h - nh2 + r}`,
    `L ${w - nw2} ${h - r}`,
    `A ${r} ${r} 0 0 1 ${w - nw2 - r} ${h}`,
    `L ${R} ${h}`,
    `A ${R} ${R} 0 0 1 0 ${h - R}`,
    `L 0 ${nh1 + r}`,
    `A ${r} ${r} 0 0 1 ${r} ${nh1}`,
    `L ${nw1 - r} ${nh1}`,
    `A ${r} ${r} 0 0 0 ${nw1} ${nh1 - r}`,
    `L ${nw1} ${r}`,
    `A ${r} ${r} 0 0 1 ${nw1 + r} 0`,
    `Z`,
  ].join(" ");

  const activeSlide = slides[currentIndex] || slides[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380px] sm:h-[410px] md:h-[449px] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="بنرهای تبلیغاتی"
    >
      {/* تعریف clip-path اختصاصی و داینامیک */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={pathD} />
          </clipPath>
        </defs>
      </svg>

      {/* ۱. بدنه اصلی بنر با برش منحنی گوشه‌ها (Carved Inverted Notches) */}
      <div
        className="relative w-full h-full overflow-hidden bg-[#062e2b] shadow-sm transition-all duration-300"
        style={{
          clipPath: `url(#${clipId})`,
          WebkitClipPath: `url(#${clipId})`,
        }}
      >
        {/* اسلایدهای چرخان */}
        {slides.map((s, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              {/* عکس اسلاید (جواهرات در چپ، فضای باز پارچه ابریشمی در راست) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.imageUrl}
                alt={s.title}
                className={`absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out ${
                  isActive ? "scale-100" : "scale-105"
                }`}
                loading={idx === 0 ? "eager" : "lazy"}
              />

              {/* لایه گرادیان تیره در سمت راست برای وضوح خوانایی تیترها */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/35 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* نشان فروش ویژه در بالا سمت راست */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-6 md:top-6 md:right-8 z-20">
                <div
                  className={`inline-flex items-center gap-2 rounded-full ${
                    s.badgeBg || "bg-[#9F1239]"
                  } px-3.5 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2 shadow-md transition-transform duration-500 ${
                    isActive ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                  }`}
                >
                  <span className="text-xs sm:text-sm md:text-base font-black text-white whitespace-nowrap">
                    {s.badgeLabel || "فـــروش ویـــــژه!"}
                  </span>
                  <Icon
                    name={s.badgeIcon || "icons-20--discount-tag"}
                    className="h-4 w-4 md:h-5 md:w-5 brightness-0 invert"
                    alt=""
                  />
                </div>
              </div>

              {/* متون بنر در سمت راست (شناور در فضای خالی ابریشم بالای برش تب‌ها) */}
              <div className="absolute right-4 sm:right-6 md:right-8 bottom-20 sm:bottom-24 md:bottom-28 left-4 sm:left-auto max-w-[90%] sm:max-w-[460px] md:max-w-[500px] text-right z-20">
                <h2
                  className={`text-xl sm:text-2xl md:text-[32px] lg:text-[34px] font-black text-white leading-tight md:leading-snug drop-shadow-sm transition-all duration-700 delay-100 ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  {s.title}
                </h2>
                {s.subtitle && (
                  <p
                    className={`mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base font-medium text-white/90 drop-shadow-xs transition-all duration-700 delay-200 ${
                      isActive ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                    }`}
                  >
                    {s.subtitle}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ۲. کلید «مشاهده بیشتر» دقیقاً داخل بریدگی بالا-چپ (Carved Top-Left Notch) */}
      <div
        className="absolute top-0 left-0 z-30 flex items-center justify-start pointer-events-auto"
        style={{
          width: nw1,
          height: nh1,
        }}
      >
        <Link
          href={activeSlide.ctaHref || "/shop"}
          className="group inline-flex items-center gap-2 rounded-full border border-[#D1D5DB] bg-white py-1 pr-3.5 pl-1 sm:py-1.5 sm:pr-4 sm:pl-1.5 shadow-xs transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-95"
          aria-label={activeSlide.ctaLabel ?? "مشاهده بیشتر"}
        >
          {/* دایره آیکون در سمت چپ در LTR / راست در RTL: ما dir=ltr می‌گذاریم تا آیکون دقیقاً سمت چپ دکمه باشد */}
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#0A5A55] text-white transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
            <svg
              className="h-3.5 w-3.5 sm:h-4 sm:w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </span>
          <span className="text-[11px] sm:text-xs md:text-sm font-bold text-[#161B22] group-hover:text-[#0A5A55] whitespace-nowrap pl-1">
            {activeSlide.ctaLabel ?? "مشاهــده بیشتــر"}
          </span>
        </Link>
      </div>

      {/* ۳. نشانگر تب‌ها دقیقاً داخل بریدگی پایین-راست (Carved Bottom-Right Notch) */}
      <div
        className="absolute bottom-0 right-0 z-30 flex items-center justify-center pointer-events-auto"
        style={{
          width: nw2,
          height: nh2,
        }}
      >
        <div
          className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 select-none"
          dir="ltr"
        >
          {slides.slice(0, 3).map((_, idx) => {
            const isActive = idx === currentIndex;
            const faNum = FA_NUMS[idx] ?? `۰${idx + 1}`;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className="group flex flex-col items-center gap-1 cursor-pointer p-0.5 transition-transform active:scale-90"
                aria-label={`اسلاید ${idx + 1}`}
                aria-current={isActive ? "true" : undefined}
              >
                {/* نقطه فعال بالای خط نشانگر */}
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    isActive ? "bg-[#0A5A55] opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
                />
                {/* خط نشانگر */}
                <span
                  className={`h-1 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-6 sm:w-7 md:w-8 bg-[#0A5A55]"
                      : "w-5 sm:w-6 bg-[#E5E7EB] group-hover:bg-[#CBD5E1]"
                  }`}
                />
                {/* شماره اسلاید فارسی */}
                <span
                  className={`text-[11px] sm:text-xs transition-colors duration-200 ${
                    isActive
                      ? "font-black text-[#0A5A55]"
                      : "font-medium text-[#8A9398] group-hover:text-[#4B5563]"
                  }`}
                >
                  {faNum}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
