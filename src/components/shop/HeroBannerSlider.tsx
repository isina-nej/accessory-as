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
  // ponytail: fixed design-space coordinate system; if layout ever becomes
  // truly fluid, re-derive dims from ResizeObserver and scale constants below.
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 672, h: 364 });

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

  // Pixel-measured from ref 672x364 (lum threshold, banner dark vs page white):
  // top edge y=5, sides x=7/664, bottom y=353, TL wall x~155->135,
  // BR wall x~521->509, badge x407..635 y34..86, pill x8..157 y8..55.
  const SX = dims.w / 672;
  const SY = dims.h / 364;
  const X = (v: number) => Math.round(v * SX);
  const Y = (v: number) => Math.round(v * SY);
  // Banner body: full-bleed sides/top (x0..672, y0..302), bottom edge y=353
  // with 30px concave quarter-circle cutouts where BG circles overlap.
  const BOT = Y(353);
  // BR tabs notch: wall x=521(top)->509(bottom), ceiling y=302
  const BR_X_TOP = X(521);
  const BR_X_BOT = X(509);
  const BR_Y = Y(302);
  // Outer corners: TR R~10 (x658..668,y5..15), BL R~8 (x7..15,y348..356)
  const R_TR = Math.max(6, Math.round(10 * SX));
  const R_BL = Math.max(5, Math.round(8 * SX));
  // Concave joints: BG circle cutouts r~30 (left) / r~22 (bottom), notch
  // fillets r~8 like the pill's own corner radius
  const C_L = Math.round(30 * SX);
  const C_B = Math.round(22 * SX);
  const F = Math.max(5, Math.round(8 * SX));

  const pathD = [
    `M 0 0`,
    `L ${X(658)} 0`,
    `A ${R_TR} ${R_TR} 0 0 1 ${X(668)} ${Y(15)}`,
    `L ${X(668)} ${Y(280)}`,
    `A ${F} ${F} 0 0 1 ${X(668) - F} ${BR_Y}`,
    `L ${BR_X_TOP + F} ${BR_Y}`,
    `A ${F} ${F} 0 0 0 ${BR_X_TOP} ${BR_Y + F}`,
    `L ${BR_X_BOT} ${BOT - C_B}`,
    `A ${C_B} ${C_B} 0 0 1 ${BR_X_BOT - C_B} ${BOT}`,
    `L ${X(40)} ${BOT}`,
    `A ${C_L} ${C_L} 0 0 0 ${X(15)} ${BOT - C_L}`,
    `L ${X(13)} ${Y(120)}`,
    `A ${C_L} ${C_L} 0 0 1 0 ${Y(100)}`,
    `L 0 0`,
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
                  className={`inline-flex items-center gap-2.5 rounded-[26px] ${
                    s.badgeBg || "bg-[#9F1239]"
                  } py-[7px] pr-[7px] pl-5 sm:py-2 sm:pr-2 sm:pl-6 shadow-md transition-transform duration-500 ${
                    isActive ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[2.5px] border-white/90">
                    <span className="block h-5 w-5 [&>img]:h-full [&>img]:w-full [&>img]:brightness-0 [&>img]:invert">
                      <Icon
                        name={s.badgeIcon || "icons-20--discount-percent"}
                        alt=""
                      />
                    </span>
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
          width: X(165),
          height: Y(63),
          paddingTop: Y(8),
          paddingLeft: X(8),
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
          width: X(151),
          height: Y(51),
          paddingBottom: Y(5),
          paddingRight: X(4),
        }}
      >
        <div
          className="flex items-center justify-center gap-[15px] select-none"
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
                className="group flex min-w-12 flex-col items-center gap-[3px] cursor-pointer transition-transform active:scale-90"
                aria-label={`اسلاید ${idx + 1}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    isActive ? "bg-[#0A5A55] opacity-100" : "bg-transparent opacity-0"
                  }`}
                />
                <span
                  className={`transition-all duration-300 ${
                    isActive
                      ? "w-12 h-1.5 rounded-full bg-[#0A5A55]"
                      : "w-12 h-1.5 rounded-full bg-[#ECEEF0] group-hover:bg-[#D8DDE1]"
                  }`}
                />
                <span
                  className={`text-[11px] leading-5 transition-colors duration-200 ${
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
