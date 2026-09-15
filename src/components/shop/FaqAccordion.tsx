"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

const FAQS = [
  {
    q: "سفارش من چه زمانی ارسال می‌شود؟",
    a: "سفارش‌های ثبت‌شده پس از تأیید، در کوتاه‌ترین زمان ممکن پردازش و ارسال می‌شوند.",
  },
  {
    q: "آیا امکان مرجوع کردن کالا وجود دارد؟",
    a: "در صورت وجود ایراد یا مغایرت با سفارش، تا ۷ روز امکان ثبت درخواست مرجوعی داری.",
  },
  {
    q: "چگونه وضعیت سفارش خود را پیگیری کنم؟",
    a: "پس از ثبت سفارش، کد رهگیری در صفحه جزئیات سفارش نمایش داده می‌شود.",
  },
  {
    q: "آیا محصولات دارای ضمانت کیفیت هستند؟",
    a: "تمام محصولات پیش از ارسال از نظر کیفیت و سلامت بررسی می‌شوند.",
  },
  {
    q: "روش‌های پرداخت به چه صورت است؟",
    a: "پرداخت از طریق درگاه‌های امن زرین‌پال و زیبال انجام می‌شود.",
  },
  {
    q: "آیا ارسال به سراسر کشور انجام می‌شود؟",
    a: "بله، سفارش‌ها به تمامی شهرهای ایران ارسال می‌شوند.",
  },
  {
    q: "در صورت داشتن سؤال چه کار کنم؟",
    a: "تیم پشتیبانی از طریق صفحه تماس با ما پاسخگوست.",
  },
  {
    q: "چگونه از موجود شدن محصولات مطلع شوم؟",
    a: "محصول را به علاقه‌مندی اضافه کن و شبکه‌های اجتماعی ما را دنبال کن.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {FAQS.map((f, i) => (
        <div key={f.q} className="rounded-2xl border bg-white">
          <button
            onClick={() => setOpen((v) => (v === i ? null : i))}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between p-4 text-right text-sm font-bold"
          >
            {f.q}
            <span className={cn("text-(--color-brand)", open === i && "rotate-180")}>▾</span>
          </button>
          {open === i && <p className="px-4 pb-4 text-sm leading-7 text-(--color-muted-fg)">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

export function FaqJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
