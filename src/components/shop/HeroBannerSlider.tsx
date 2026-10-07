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

/* مسیر نرمال‌شده ماسک وکتور فیگما (نود 271:65 Rectangle 3215، قاب ۷۳۶ × ۳۹۱) با دو بریدگی مورب ۵۷ پیکسل در بالا-چپ و پایین-راست */
const MASK_PATH_NORMALIZED =
  "M 0 0.171377 C 0 0.157244 0.00609 0.14579 0.013599 0.145802 L 0.203341 0.146107 C 0.209277 0.146116 0.214529 0.138873 0.216312 0.128216 L 0.234777 0.01789 C 0.23656 0.007242 0.241806 0 0.247736 0 L 0.986413 0 C 0.993917 0 1 0.011451 1 0.025575 L 1 0.828645 C 1 0.84277 0.993917 0.85422 0.986413 0.85422 L 0.796391 0.85422 C 0.790261 0.85422 0.784889 0.861949 0.78328 0.873084 L 0.767671 0.981136 C 0.766062 0.992271 0.76069 1 0.75456 1 L 0.013587 1 C 0.006083 1 0 0.98855 0 0.974425 Z";

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
  const rawId = useId();
  const clipId = `banner-cutout-${rawId.replace(/[:]/g, "")}`;

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

  const activeSlide = slides[currentIndex] || slides[0];

  return (
    <div
      className="relative w-full max-w-[736px] h-[260px] sm:h-[310px] md:h-[391px] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="بنرهای تبلیغاتی"
    >
      {/* تعریف clip-path اختصاصی و برداری دقیق فیگما نود 271:65 با objectBoundingBox برای تطبیق ۱۰۰٪ فلوئید */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <path d={MASK_PATH_NORMALIZED} />
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
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out overflow-hidden ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              {/* تصویر اسلاید: در دسکتاپ مقیاس ۲۵٪ (۷۵۲ × ۴۴۸ با برش ۵۷px بالا و ۸px طرفین)، در موبایل پوشش کامل */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.imageUrl}
                alt={s.title}
                className={`absolute select-none pointer-events-none object-cover transition-transform duration-1000 ease-out ${
                  isActive ? "scale-100" : "scale-105"
                } inset-0 h-full w-full md:inset-auto`}
                style={{
                  maxWidth: "none",
                }}
                loading={idx === 0 ? "eager" : "lazy"}
              />

              {/* لایه گرادیان تیره در سمت راست برای وضوح خوانایی تیترها */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/35 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

              {/* نشان فروش ویژه در بالا سمت راست */}
              <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 md:top-8 md:right-8 z-20">
                <div
                  className={`inline-flex items-center gap-1.5 sm:gap-2.5 rounded-[26px] ${
                    s.badgeBg || "bg-[#9F1239]"
                  } py-1 pr-1 pl-3 sm:py-[7px] sm:pr-[7px] sm:pl-5 md:py-2 md:pr-2 md:pl-6 shadow-md transition-transform duration-500 ${
                    isActive ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                  }`}
                >
                  <span className="flex h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full border sm:border-2 md:border-[2.5px] border-white/90">
                    <span className="block h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 [&>img]:h-full [&>img]:w-full [&>img]:brightness-0 [&>img]:invert">
                      <Icon
                        name={s.badgeIcon || "icons-20--discount-percent"}
                        alt=""
                      />
                    </span>
                  </span>
                  <span className="text-xs sm:text-sm md:text-lg font-black text-white whitespace-nowrap">
                    {s.badgeLabel || "فـــروش ویـــــژه!"}
                  </span>
                </div>
              </div>

              {/* متون بنر در سمت راست (شناور در فضای خالی ابریشم بالای برش تب‌ها) */}
              <div className="absolute inset-x-0 bottom-10 sm:bottom-12 md:bottom-[120px] px-4 sm:px-6 md:px-10 text-center z-20">
                <h2
                  className={`text-lg sm:text-xl md:text-[32px] md:leading-[1.4] font-black text-white drop-shadow-sm transition-all duration-700 delay-100 ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                >
                  {s.title}
                </h2>
                {s.subtitle && (
                  <p
                    className={`mt-1 sm:mt-2 text-xs sm:text-sm md:text-lg font-medium text-[#E8EBED] drop-shadow-xs transition-all duration-700 delay-200 ${
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

      {/* ۲. کلید «مشاهده بیشتر» دقیقاً داخل بریدگی بالا-چپ (Carved Top-Left Notch: پهنای ۱۸۲px و ارتفاع ۵۷px) */}
      <div
        className="absolute top-0 left-0 z-30 flex items-start justify-start pointer-events-none p-1 sm:p-1.5"
        style={{
          width: "24.77%",
          height: "14.58%",
        }}
      >
        <Link
          href={activeSlide.ctaHref || "/shop"}
          className="group pointer-events-auto inline-flex flex-row-reverse items-center gap-1.5 sm:gap-2 rounded-full border border-gray-300 bg-white py-1 pl-1 pr-3 sm:py-[5px] sm:pl-[5px] sm:pr-4 shadow-xs transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-95"
          aria-label={activeSlide.ctaLabel ?? "مشاهده بیشتر"}
        >
          <span className="flex h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-[#0A5A55] text-white transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5">
            <svg
              className="h-4 w-4 sm:h-5 sm:w-5"
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
          <span className="text-[11px] sm:text-[13px] md:text-[14px] font-bold text-[#161B22] group-hover:text-[#0A5A55] whitespace-nowrap">
            {activeSlide.ctaLabel ?? "مشاهــده بیشتــر"}
          </span>
        </Link>
      </div>

      {/* ۳. نشانگر تب‌ها دقیقاً داخل بریدگی پایین-راست (Carved Bottom-Right Notch: عرض ۱۴۰px و ارتفاع ۳۱px عین فیگما نود 307:39) */}
      <div
        className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 z-30 flex items-center justify-center pointer-events-auto"
        style={{
          width: "19.02%", // ۱۴۰px / ۷۳۶px
          minWidth: "130px",
          height: "31px",
        }}
      >
        <div
          className="flex items-center justify-between w-full select-none"
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
                className="group flex flex-1 flex-col items-center gap-[2px] cursor-pointer transition-transform active:scale-90"
                aria-label={`اسلاید ${idx + 1}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    isActive ? "bg-[#0A5A55] opacity-100" : "bg-transparent opacity-0"
                  }`}
                />
                <span
                  className={`transition-all duration-300 ${
                    isActive
                      ? "w-10 sm:w-11 h-1 sm:h-1.5 rounded-full bg-[#0A5A55]"
                      : "w-10 sm:w-11 h-1 sm:h-1.5 rounded-full bg-[#ECEEF0] group-hover:bg-[#D8DDE1]"
                  }`}
                />
                <span
                  className={`text-[10px] sm:text-[11px] leading-4 transition-colors duration-200 ${
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

