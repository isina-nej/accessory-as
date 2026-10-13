"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { toggleFavorite } from "@/lib/account-actions";

export function ProductDetailGallery({
  images,
  title,
  productId,
  initialFav = false,
}: {
  images: string[];
  title: string;
  productId: string;
  initialFav?: boolean;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fav, setFav] = useState(initialFav);
  const [favBusy, setFavBusy] = useState(false);

  const fallbackList = [
    "/images/product-details/product-main-ring.png",
    "/images/product-details/product-thumb-ring-plain.png",
    "/images/product-details/product-thumb-necklace.png",
    "/images/product-details/product-thumb-bracelet.png",
    "/images/product-details/product-thumb-earring.png",
  ];

  const list = images.length > 0 ? images : fallbackList;
  const currentImage = list[activeIndex] ?? list[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
  };

  const handleToggleFav = async () => {
    if (favBusy) return;
    setFavBusy(true);
    try {
      const res = await toggleFavorite(productId);
      if (res.ok) setFav(res.data);
    } finally {
      setFavBusy(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {/* Main Image Box */}
      <div className="box-border flex min-h-[330px] w-full flex-col items-center justify-between rounded-[10px] border border-[#D6DBDE] bg-white p-3 sm:min-h-[390px] sm:p-4 md:min-h-[513px] md:p-6">
        {/* Top Controls: Arrows on Right in LTR (Left in RTL), Heart on Right in RTL */}
        <div className="flex h-9 w-full flex-row items-center justify-between sm:h-[44px]">
          {/* Heart rate / Favorite button */}
          <button
            type="button"
            onClick={handleToggleFav}
            disabled={favBusy}
            aria-label={fav ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
            className="flex items-center justify-center w-6 h-6 text-[#8A9398] hover:text-[#9F1239] transition-colors focus-visible:outline-2 focus-visible:outline-[#0A5A55] rounded"
          >
            <Icon
              name="icons-20--favorite-icon"
              className={`w-6 h-6 transition-all ${
                fav
                  ? "text-[#9F1239] fill-[#9F1239] [filter:invert(16%)_sepia(89%)_saturate(2248%)_hue-rotate(315deg)]"
                  : "opacity-60 hover:opacity-100"
              }`}
              alt=""
            />
          </button>

          {/* Navigation Arrows */}
          <div className="flex flex-row items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="تصویر قبلی"
              className="box-border flex h-9 w-9 items-center justify-center rounded-full border border-[#D6DBDE] bg-[#F8FAF9] text-[#161B22] shadow-[0px_4px_35px_rgba(0,0,0,0.04)] transition-all hover:border-[#0A5A55] hover:bg-white focus-visible:outline-2 focus-visible:outline-[#0A5A55] sm:h-[44px] sm:w-[44px]"
            >
              <Icon name="icons-20--direction-down" className="w-5 h-5 -rotate-90 text-[#161B22]" alt="" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="تصویر بعدی"
              className="box-border flex h-9 w-9 items-center justify-center rounded-full border border-[#D6DBDE] bg-[#F8FAF9] text-[#161B22] shadow-[0px_4px_35px_rgba(0,0,0,0.04)] transition-all hover:border-[#0A5A55] hover:bg-white focus-visible:outline-2 focus-visible:outline-[#0A5A55] sm:h-[44px] sm:w-[44px]"
            >
              <Icon name="icons-20--direction-down" className="w-5 h-5 rotate-90 text-[#161B22]" alt="" />
            </button>
          </div>
        </div>

        {/* Big Preview Image */}
        <div className="my-auto flex min-h-[240px] w-full flex-1 items-center justify-center overflow-hidden py-2 sm:min-h-[290px] md:min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt={title}
            className="h-[220px] w-full max-w-[580px] object-contain transition-transform duration-300 hover:scale-105 sm:h-[280px] md:h-[421px]"
          />
        </div>
      </div>

      {/* Thumbnails Row */}
      <div className="grid grid-cols-5 gap-3 w-full" role="tablist" aria-label="تصاویر بندانگشتی محصول">
        {list.slice(0, 5).map((img, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={img + idx}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`تصویر ${idx + 1}`}
              onClick={() => setActiveIndex(idx)}
              className={`box-border flex h-[68px] items-center justify-center overflow-hidden rounded-[10px] border bg-white p-1.5 transition-all focus-visible:outline-2 focus-visible:outline-[#0A5A55] sm:h-[92px] md:h-[138px] md:p-2 ${
                isActive
                  ? "border-[#0A5A55] ring-2 ring-[#0A5A55]/20"
                  : "border-[#D6DBDE] hover:border-[#8A9398]"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${title} - بندانگشتی ${idx + 1}`}
                className="h-full w-full max-h-[58px] object-contain sm:max-h-[76px] md:max-h-[110px]"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
