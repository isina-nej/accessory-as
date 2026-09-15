"use client";

import { useState } from "react";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [i, setI] = useState(0);
  const list = images.length > 0 ? images : [];
  const cur = list[i] ?? null;
  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-2xl border bg-white">
        {cur ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cur} alt={title} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-7xl">💍</span>
        )}
      </div>
      {list.length > 1 && (
        <div className="grid grid-cols-4 gap-2" role="tablist" aria-label="تصاویر محصول">
          {list.slice(0, 4).map((src, n) => (
            <button
              key={src + n}
              role="tab"
              aria-selected={n === i}
              onClick={() => setI(n)}
              className={`aspect-square overflow-hidden rounded-xl border bg-white ${n === i ? "border-(--color-brand)" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${title} ${n + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
