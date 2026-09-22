import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const LINK_GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "راهنمای خرید از اکسسوری آس",
    links: [
      { label: "نحوه ثبت سفارش", href: "/faq" },
      { label: "رویه ارسال سفارش", href: "/faq" },
      { label: "شیوه‌های پرداخت", href: "/faq" },
    ],
  },
  {
    title: "خدمات مشتریان",
    links: [
      { label: "پاسخ به پرسش‌های متداول", href: "/faq" },
      { label: "شرایط استفاده", href: "/about" },
      { label: "حریم خصوصی", href: "/about" },
    ],
  },
  {
    title: "با اکسسوری آس",
    links: [
      { label: "فروشگاه اکسسوری آس", href: "/shop" },
      { label: "تماس با اکسسوری آس", href: "/contact" },
      { label: "درباره اکسسوری آس", href: "/about" },
    ],
  },
];

const PERKS = [
  { icon: "icons-20--delivery", title: "تحویل اکسپرس", sub: "تحویل سریع و بی‌تاخیر" },
  { icon: "icons-20--trolley", title: "حمل و نقل رایگان", sub: "برای خرید بالای ۵۰۰ هزار تومن" },
  { icon: "icons-20--repeat", title: "ضمانت بازگشت کالا", sub: "۷ روز ضمانت بازگشت کالا" },
  { icon: "icons-20--check-circle", title: "کیفیت پرمیوم", sub: "متریال و کیفیت ساخت بی‌نقص" },
];

const SOCIALS = [
  { label: "تلگرام", icon: "icons-24--telegram-2" },
  { label: "اینستاگرام", icon: "icons-24--instagram-2" },
  { label: "واتساپ", icon: "icons-24--whatsapp-2" },
];

export function Footer({ settings }: { settings?: Record<string, string> }) {
  const address = settings?.footer_address ?? "تهران، خیابان ولیعصر، بالاتر از خیابان زرتشت، کوچه جاوید، پلاک ۲۴";
  const phones = settings?.footer_phones ?? "۰۲۱ ۷۰۰۸۰۰۱ ــ ۰۹۳۵ ۱۷۹ ۰۸۵۳";
  const seoTitle = settings?.footer_seo_title ?? "اکسسوری آس، روایتی از سلیقه شما";
  const seoBody =
    settings?.footer_seo_body ??
    "فروشگاه اکسسوری آس با هدف ارائه مجموعه‌ای از اکسسوری‌های خاص، مدرن و باکیفیت فعالیت خود را آغاز کرده است. ما باور داریم که جزئیات، نقش مهمی در شکل‌گیری استایل و بیان شخصیت هر فرد دارند. به همین دلیل تلاش می‌کنیم با انتخاب محصولاتی متنوع و طراحی‌هایی خاص، تجربه‌ای متفاوت از خرید اکسسوری را برای مشتریان خود فراهم کنیم. در کنار تنوع محصولات، اصالت کالا، ضمانت بازگشت، ارسال سریع و پشتیبانی واقعی را نیز به همراه داشته باشیم. خدمات مطمئن و تجربه خریدی آسان، به انتخابی قابل اعتماد برای علاقه‌مندان به اکسسوری و استایل مدرن تبدیل شویم.";

  return (
    <footer className="mt-12 border-t bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {/* ردیف بالا: لوگو + آدرس + تلفن + سوشال */}
        <div className="flex flex-col items-start justify-between gap-4 border-b py-5 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-brand) font-bold text-white">
              AS
            </span>
            <span className="leading-tight">
              <span className="block font-bold">اکسسوری آس</span>
              <span className="block text-xs text-(--color-muted-fg)">روایتی از سلیقه تو</span>
            </span>
          </Link>
          <p className="flex items-center gap-1.5 text-[13px] text-(--color-muted-fg)" dir="ltr">
            <span dir="rtl">{phones}</span>
            <Icon name="icons-20--calling" className="h-4 w-4" alt="" />
          </p>
          <p className="flex items-center gap-1.5 text-[13px] text-(--color-muted-fg)">
            {address}
            <Icon name="icons-20--pinned-map" className="h-4 w-4 shrink-0" alt="" />
          </p>
          <div className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="/contact"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-(--color-muted-fg) hover:border-(--color-brand) hover:text-(--color-brand)"
              >
                <Icon name={s.icon} className="h-5 w-5" alt={s.label} />
              </a>
            ))}
          </div>
        </div>

        {/* ردیف میانی: نماد + ۳ ستون لینک */}
        <div className="grid gap-8 py-8 md:grid-cols-4">
          <div className="flex items-start justify-center md:justify-start">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-(--color-mist)">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/trust-badge.webp" alt="نماد اعتماد samandehi.ir" className="h-full w-full object-contain p-2" />
            </div>
          </div>
          {LINK_GROUPS.map((g) => (
            <div key={g.title} className="text-center md:text-right">
              <p className="font-bold">{g.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-(--color-muted-fg)">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-(--color-brand)">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ردیف پرک‌ها */}
        <div className="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-4">
          {PERKS.map((f, i) => (
            <div
              key={f.title}
              className={i > 0 ? "flex items-center gap-3 md:border-r md:border-black/10 md:pr-4" : "flex items-center gap-3"}
            >
              <span className="text-center">
                <span className="block text-sm font-bold">{f.title}</span>
                <span className="block text-xs text-(--color-muted-fg)">{f.sub}</span>
              </span>
              <Icon name={f.icon} className="h-6 w-6 shrink-0" alt="" />
            </div>
          ))}
        </div>

        {/* متن سئو */}
        <div className="border-t py-6 text-center md:text-right">
          <p className="text-sm font-bold text-(--color-brand)">{seoTitle}</p>
          <p className="mt-2 text-xs leading-6 text-(--color-muted-fg)">{seoBody}</p>
          <p className="mt-4 border-t pt-4 text-center text-xs text-(--color-muted-fg)">
            تمام حقوق این وب‌سایت برای فروشگاه اکسسوری آس است.
          </p>
        </div>
      </div>
    </footer>
  );
}
