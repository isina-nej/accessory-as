"use client";

import { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { toFa } from "@/lib/fa";
import { ReviewModal } from "./ReviewModal";
import type { ProductReview } from "@/lib/get-products";

export interface ReviewItemData {
  id: string;
  author: string;
  avatarUrl?: string;
  verified: boolean;
  body: string;
  createdAt: string | Date;
  variantColor?: string;
  rating?: number;
}

export function ProductTabs({
  slug,
  sku,
  categoryTitle,
  description,
  initialReviews = [],
  totalReviewsCount = 0,
  initialTab = "specs",
}: {
  slug: string;
  sku?: string | null;
  categoryTitle?: string | null;
  description?: string | null;
  initialReviews?: ProductReview[];
  totalReviewsCount?: number;
  initialTab?: "specs" | "reviews";
}) {
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">(initialTab);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [visibleCount, setVisibleCount] = useState(2);

  // Format date to Persian شمسی
  const formatFaDate = (d: string | Date) => {
    try {
      const dt = typeof d === "string" ? new Date(d) : d;
      return toFa(
        new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(dt),
      );
    } catch {
      return toFa("۱۴۰۵/۰۲/۲۵");
    }
  };

  // Default seed reviews matching Figma 1926:713
  const defaultFigmaReviews: ReviewItemData[] = useMemo(
    () => [
      {
        id: "figma-1",
        author: "حسین کاظمی",
        avatarUrl: "/images/product-details/review-avatar-hosein.png",
        verified: true,
        body: "کیفیت عالی و متریال استفاده شده بی نظیره.",
        createdAt: "2026-05-15T10:00:00Z",
        variantColor: "#D6C2A1",
        rating: 5,
      },
      {
        id: "figma-2",
        author: "حسین کاظمی",
        avatarUrl: "/images/product-details/review-avatar-hosein.png",
        verified: true,
        body: "کیفیت عالی و متریال استفاده شده بی نظیره.",
        createdAt: "2026-05-15T09:00:00Z",
        variantColor: "#D6C2A1",
        rating: 5,
      },
      {
        id: "figma-3",
        author: "سارا محمدی",
        avatarUrl: "/images/product-details/review-avatar-hosein.png",
        verified: true,
        body: "بسته‌بندی بسیار شیک بود و درخشش نگین‌ها از نزدیک عالیه.",
        createdAt: "2026-05-14T08:00:00Z",
        variantColor: "#D6DBDE",
        rating: 5,
      },
      {
        id: "figma-4",
        author: "نگار احمدی",
        avatarUrl: "/images/product-details/review-avatar-hosein.png",
        verified: true,
        body: "طراحی ظریف و شیک، روی دست خیلی نما داره.",
        createdAt: "2026-05-12T11:00:00Z",
        variantColor: "#0A5A55",
        rating: 4,
      },
    ],
    [],
  );

  const reviewsList: ReviewItemData[] = useMemo(() => {
    if (initialReviews.length > 0) {
      return initialReviews.map((r, idx) => ({
        id: r.id,
        author: r.author,
        avatarUrl: "/images/product-details/review-avatar-hosein.png",
        verified: Boolean(r.verified),
        body: r.body,
        createdAt: r.createdAt,
        variantColor: idx % 2 === 0 ? "#D6C2A1" : "#D6DBDE",
        rating: r.rating,
      }));
    }
    return defaultFigmaReviews;
  }, [initialReviews, defaultFigmaReviews]);

  // Filter & Sort
  const filteredReviews = useMemo(() => {
    let list = [...reviewsList];
    if (onlyVerified) {
      list = list.filter((r) => r.verified);
    }
    list.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [reviewsList, onlyVerified, sortOrder]);

  const displayedReviews = filteredReviews.slice(0, visibleCount);
  const remainingCount = Math.max(0, totalReviewsCount - displayedReviews.length);

  return (
    <div className="w-full flex flex-col gap-4 mt-6 text-right">
      {/* Tab Switcher Bar */}
      <div
        className="box-border flex h-[48px] w-full flex-row items-center gap-1 rounded-[10px] border border-[#D6DBDE] bg-[#F8FAF9] p-1.5 sm:h-[52px]"
        role="tablist"
        aria-label="اطلاعات محصول"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "specs"}
          onClick={() => setActiveTab("specs")}
          className={`flex h-9 flex-1 items-center justify-center rounded-[8px] text-xs font-extrabold transition-all focus-visible:outline-2 focus-visible:outline-[#0A5A55] sm:h-10 sm:text-sm ${
            activeTab === "specs"
              ? "bg-white border border-[#D6DBDE] shadow-[0px_4px_12px_rgba(0,0,0,0.04)] text-[#161B22]"
              : "text-[#161B22] hover:text-[#0A5A55]"
          }`}
        >
          مشخصات محصول
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "reviews"}
          onClick={() => setActiveTab("reviews")}
          className={`flex h-9 flex-1 items-center justify-center rounded-[8px] text-xs font-extrabold transition-all focus-visible:outline-2 focus-visible:outline-[#0A5A55] sm:h-10 sm:text-sm ${
            activeTab === "reviews"
              ? "bg-white border border-[#D6DBDE] shadow-[0px_4px_12px_rgba(0,0,0,0.04)] text-[#161B22]"
              : "text-[#161B22] hover:text-[#0A5A55]"
          }`}
        >
          دیدگاه کاربــران
        </button>
      </div>

      {/* Tab 1: Specs View */}
      {activeTab === "specs" && (
        <div className="flex flex-col gap-3 w-full py-1 animate-fadeIn">
          <p className="text-sm font-medium leading-[24px] text-[#161B22] text-right">
            {description ||
              "این انگشتر با طراحی مینیمال و ظاهری مدرن، انتخابی مناسب برای استفاده روزمره و استایل‌های رسمی و کژوال است. ساختار مقاوم و پرداخت دقیق سطح محصول، جلوه‌ای شیک و ماندگار به آن بخشیده است."}
          </p>

          <div className="flex flex-col gap-1 w-full mt-2">
            <div className="flex flex-row justify-between items-center py-2.5 border-b border-[#D6DBDE] text-sm font-medium text-[#161B22]">
              <span>جنس</span>
              <span className="text-[#161B22]">نقره</span>
            </div>
            <div className="flex flex-row justify-between items-center py-2.5 border-b border-[#D6DBDE] text-sm font-medium text-[#161B22]">
              <span>کشور تولید ‌کننده</span>
              <span className="text-[#161B22]">ایران</span>
            </div>
            <div className="flex flex-row justify-between items-center py-2.5 border-b border-[#D6DBDE] text-sm font-medium text-[#161B22]">
              <span>کد کالای محصول</span>
              <span className="text-[#161B22]">{sku || "WC۰۰۹"}</span>
            </div>
            {categoryTitle ? (
              <div className="flex flex-row justify-between items-center py-2.5 text-sm font-medium text-[#161B22]">
                <span>دسته‌بندی</span>
                <span className="text-[#161B22]">{categoryTitle}</span>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Tab 2: Reviews View (Matching Figma 1926:713) */}
      {activeTab === "reviews" && (
        <div className="flex flex-col gap-4 w-full animate-fadeIn">
          {/* Header Controls: Filters & Action */}
          <div className="flex flex-row items-center justify-between w-full h-[28px]">
            {/* Left in RTL: Submit Review Button */}
            <div className="flex items-center">
              <ReviewModal
                slug={slug}
                trigger={
                  <button
                    type="button"
                    className="flex flex-row items-center gap-1.5 text-xs md:text-sm font-medium text-[#4B5563] hover:text-[#161B22] transition-colors focus-visible:outline-2 focus-visible:outline-[#0A5A55] rounded"
                  >
                    <span>ثبت دیدگاه</span>
                    <Icon name="icons-20--bubble-chat-edit" className="w-5 h-5 text-[#4B5563]" alt="" />
                  </button>
                }
              />
            </div>

            {/* Right in RTL: Sorting & Filter */}
            <div className="flex flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setOnlyVerified((prev) => !prev)}
                className={`box-border px-2 py-0.5 rounded-[6px] text-xs font-bold transition-all focus-visible:outline-2 focus-visible:outline-[#9F1239] ${
                  onlyVerified
                    ? "bg-white border border-[#9F1239] text-[#9F1239]"
                    : "bg-[#F8FAF9] border border-[#D6DBDE] text-[#4B5563] hover:border-[#9F1239]"
                }`}
                aria-pressed={onlyVerified}
              >
                خریداران
              </button>

              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
                className="text-xs md:text-sm font-medium text-[#4B5563] hover:text-[#161B22] transition-colors"
              >
                {sortOrder === "newest" ? "جـدید ترین" : "قدیمی‌ترین"}
              </button>

              <div className="flex flex-row items-center gap-1 text-xs md:text-sm font-bold text-[#161B22]">
                <Icon name="icons-20--sorting" className="w-5 h-5 text-[#161B22]" alt="" />
                <span>مرتــب سازی :</span>
              </div>
            </div>
          </div>

          {/* Review Cards List */}
          <div className="flex flex-col gap-3 w-full">
            {displayedReviews.length === 0 ? (
              <div className="bg-[#F8FAF9] border border-[#E5E7EB] rounded-[10px] p-6 text-center text-sm text-[#6C7E8E]">
                دیدگاهی با این فیلتر یافت نشد.
              </div>
            ) : (
              displayedReviews.map((rev) => (
                <article
                  key={rev.id}
                  className="box-border w-full bg-white border border-[#E5E7EB] rounded-[10px] p-3 md:p-4 flex flex-col gap-2.5 shadow-[0px_0px_16px_rgba(0,0,0,0.04)] text-right"
                >
                  {/* Rate / Date / User Row */}
                  <div className="flex flex-row items-center justify-between w-full">
                    {/* Left in RTL: Purchased Color + Date */}
                    <div className="flex flex-row items-center gap-2">
                      <span className="text-xs font-medium text-[#6C7E8E]">
                        {formatFaDate(rev.createdAt)}
                      </span>
                      {rev.variantColor ? (
                        <span
                          className="w-[20px] h-[20px] rounded-full border border-white shadow-sm shrink-0"
                          style={{ backgroundColor: rev.variantColor }}
                          title="رنگ خریداری‌شده"
                        />
                      ) : null}
                    </div>

                    {/* Right in RTL: Avatar + Name + Verified Badge */}
                    <div className="flex flex-row items-center gap-2">
                      {rev.verified ? (
                        <span className="px-2 py-0.5 rounded-[6px] bg-[#F8FAF9] text-[#0A5A55] text-xs font-bold leading-normal">
                          خریدار
                        </span>
                      ) : null}
                      <span className="text-sm font-bold text-[#111827]">
                        {rev.author}
                      </span>
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E8EBED] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={rev.avatarUrl || "/images/product-details/review-avatar-hosein.png"}
                          alt={rev.author}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Body Text */}
                  <p className="text-sm font-medium leading-[24px] text-[#111827]">
                    {rev.body}
                  </p>
                </article>
              ))
            )}
          </div>

          {/* More Reviews Expander */}
          {remainingCount > 0 && (
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 4)}
              className="flex flex-row items-center justify-center gap-2 py-2 mt-1 text-sm font-medium text-[#6C7E8E] hover:text-[#161B22] transition-colors focus-visible:outline-2 focus-visible:outline-[#0A5A55] rounded"
            >
              <Icon name="icons-20--direction-down" className="w-5 h-5 text-[#6C7E8E]" alt="" />
              <span>{toFa(remainingCount)} دیدگاه دیگـر‌</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
