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
    badgeIcon: "icons-20--discount-percent",
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
  // Exact notch proportions matching Figma reference (672x364 ref scaled to render size)
  // Ref outer corners R~8px/672 => ~9px at 736w; notch fillet r~10px; walls slant ~20deg
  // Ref 672px: pill 8..157 x 8..58 => nw1=185 nh1=68 (desktop); wall slant ~14deg
  const nw1 = isMobile ? 158 : 185; // top-left notch width at top edge (CTA button)
  const nh1 = isMobile ? 56 : 68;   // top-left notch height (ref button h~55 + margin)
  const nw2 = isMobile ? 140 : 156; // bottom-right notch width at ceiling (tabs)
  const nh2 = isMobile ? 48 : 56;   // bottom-right notch height (ref ~50 + margin)
  const R = isMobile ? 8 : 9;       // main outer corners radius (ref ~8px)
  const r = isMobile ? 8 : 10;      // notch fillet radius
  // Calculate SVG clip path with smooth concave fillets
  const w = dims.w;
  const h = dims.h;
  // Slanted notch walls like ref: TL ~25deg, BR ~20deg (x shrinks going down)
  const slant1 = Math.round(nh1 * 0.25);
  const slant2 = Math.round(nh2 * 0.3);
  const xTop1 = nw1;              // wall x at top edge (y=0)
  const xBot1 = nw1 - slant1;     // wall x at notch ceiling (y=nh1)
  const xTop2 = w - nw2;          // wall x at notch ceiling (y=h-nh2)
  const xBot2 = w - nw2 - slant2; // wall x at bottom edge (y=h)

  const pathD = [
    `M ${xTop1 + r} 0`,
    `L ${w - R} 0`,
    `A ${R} ${R} 0 0 1 ${w} ${R}`,
    `L ${w} ${h - nh2 - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${h - nh2}`,
    `L ${xTop2 + r} ${h - nh2}`,
    `A ${r} ${r} 0 0 0 ${xTop2} ${h - nh2 + r}`,
    `L ${xBot2} ${h - r}`,
    `A ${r} ${r} 0 0 1 ${xBot2 - r} ${h}`,
    `L ${R} ${h}`,
    `A ${R} ${R} 0 0 1 0 ${h - R}`,
    `L 0 ${nh1 + r}`,
    `A ${r} ${r} 0 0 1 ${r} ${nh1}`,
    `L ${xBot1 - r} ${nh1}`,
    `A ${r} ${r} 0 0 0 ${xBot1} ${nh1 - r}`,
    `L ${xTop1} ${r}`,
    `A ${r} ${r} 0 0 1 ${xTop1 + r} 0`,
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
                  className={`inline-flex items-center gap-2.5 rounded-full ${
                    s.badgeBg || "bg-[#9F1239]"
                  } py-2 pr-2 pl-5 sm:py-2.5 sm:pr-2.5 sm:pl-6 shadow-md transition-transform duration-500 ${
                    isActive ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                  }`}
                >
                  <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border-2 border-white/90">
                    <Icon
                      name={s.badgeIcon || "icons-20--discount-percent"}
                      className="h-4 w-4 sm:h-[18px] sm:w-[18px] brightness-0 invert"
                      alt=""
                    />
                  </span>
                  <span className="text-sm sm:text-base md:text-lg font-black text-white whitespace-nowrap">
                    {s.badgeLabel || "فـــروش ویـــــژه!"}
                  </span>
                </div>
              </div>

              {/* متون بنر در سمت راست (شناور در فضای خالی ابریشم بالای برش تب‌ها) */}
              <div className="absolute inset-x-0 bottom-[104px] sm:bottom-[112px] px-6 sm:px-10 text-center z-20">
                <h2
                  className={`text-2xl sm:text-3xl md:text-[38px] md:leading-[1.4] font-black text-white drop-shadow-sm transition-all duration-700 delay-100 ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  {s.title}
                </h2>
                {s.subtitle && (
                  <p
                    className={`mt-2 text-sm sm:text-base md:text-lg font-medium text-white/90 drop-shadow-xs transition-all duration-700 delay-200 ${
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
        className="absolute top-0 left-0 z-30 flex items-start justify-start pointer-events-none"
        style={{
          width: nw1 + 26,
          height: nh1 + 16,
          paddingTop: 8,
          paddingLeft: 8,
        }}
      >
        <Link
          href={activeSlide.ctaHref || "/shop"}
          className="group pointer-events-auto inline-flex flex-row-reverse items-center gap-2 rounded-full border border-gray-300 bg-white py-[5px] pl-[5px] pr-4 shadow-xs transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-95"
          aria-label={activeSlide.ctaLabel ?? "مشاهده بیشتر"}
        >
          <span className="flex h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-full bg-[#0A5A55] text-white transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
            <svg
              className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 17L7 7M16 7H7v9" />
            </svg>
          </span>
          <span className="text-[13px] sm:text-[15px] font-bold text-[#161B22] group-hover:text-[#0A5A55] whitespace-nowrap">
            {activeSlide.ctaLabel ?? "مشاهــده بیشتــر"}
          </span>
        </Link>
      </div>

      {/* ۳. نشانگر تب‌ها دقیقاً داخل بریدگی پایین-راست (Carved Bottom-Right Notch) */}
      <div
        className="absolute bottom-0 right-0 z-30 flex items-end justify-center pointer-events-auto"
        style={{
          width: nw2 + 12,
          height: nh2 + 6,
          paddingBottom: 2,
          paddingRight: 4,
        }}
      >
        <div
          className="flex items-center justify-center gap-4 sm:gap-6 select-none pt-1"
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
                className="group flex min-w-[56px] sm:min-w-[64px] flex-col items-center gap-[3px] cursor-pointer p-0.5 transition-transform active:scale-90"
                aria-label={`اسلاید ${idx + 1}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className={`h-[6px] w-[6px] rounded-full transition-all duration-300 ${
                    isActive ? "bg-[#0A5A55] opacity-100" : "bg-transparent opacity-0"
                  }`}
                />
                <span
                  className={`transition-all duration-300 ${
                    isActive
                      ? "w-[56px] sm:w-[64px] h-2 rounded-full bg-[#0A5A55]"
                      : "w-[56px] sm:w-[64px] h-2 rounded-full bg-[#ECEEF0] group-hover:bg-[#D8DDE1]"
                  }`}
                />
                <span
                  className={`text-[11px] sm:text-xs leading-5 transition-colors duration-200 ${
                    isActive
                      ? "font-extrabold text-[#101828]"
                      : "font-medium text-[#98A2B3] group-hover:text-[#667085]"
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
