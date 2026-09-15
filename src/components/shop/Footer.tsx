import Link from "next/link";
import { Diamond, MapPin, Package, Phone, RefreshCcw, Truck } from "lucide-react";

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
  { icon: Package, title: "تحویل اکسپرس", sub: "تحویل سریع و بی‌تاخیر" },
  { icon: Truck, title: "حمل و نقل رایگان", sub: "برای خرید بالای ۵۰۰ هزار تومن" },
  { icon: RefreshCcw, title: "ضمانت بازگشت کالا", sub: "۷ روز ضمانت بازگشت کالا" },
  { icon: Diamond, title: "کیفیت پرمیوم", sub: "متریال و کیفیت ساخت بی‌نقص" },
];

export function Footer() {
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
            <span dir="rtl">۰۹۳۵ ۱۷۹ ۰۸۵۳</span>
            <span className="text-black/20">|</span>
            <span dir="rtl">۰۲۱ ۷۰۰۸۰۰۱</span>
            <Phone className="h-4 w-4 text-(--color-brand)" />
          </p>
          <p className="flex items-center gap-1.5 text-[13px] text-(--color-muted-fg)">
            تهران، خیابان ولیعصر، بالاتر از خیابان زرتشت، کوچه جاوید، پلاک ۲۴
            <MapPin className="h-4 w-4 shrink-0 text-(--color-brand)" />
          </p>
          <div className="flex items-center gap-2">
            {["تلگرام", "اینستاگرام", "واتساپ"].map((label) => (
              <a
                key={label}
                href="/contact"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 text-(--color-muted-fg) hover:border-(--color-brand) hover:text-(--color-brand)"
              >
                <span className="text-xs font-bold">{label.slice(0, 1)}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ردیف میانی: نماد + ۳ ستون لینک */}
        <div className="grid gap-8 py-8 md:grid-cols-4">
          <div className="flex items-start justify-center md:justify-start">
            <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-black/10 bg-(--color-mist) text-center">
              <span className="px-2 text-[11px] leading-5 text-(--color-muted-fg)">
                نماد اعتماد
                <br />
                samandehi.ir
              </span>
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
              <f.icon className="h-6 w-6 shrink-0 text-(--color-brand)" />
            </div>
          ))}
        </div>

        {/* متن سئو */}
        <div className="border-t py-6 text-center md:text-right">
          <p className="text-sm font-bold text-(--color-brand)">اکسسوری آس، روایتی از سلیقه شما</p>
          <p className="mt-2 text-xs leading-6 text-(--color-muted-fg)">
            فروشگاه اکسسوری آس با هدف ارائه مجموعه‌ای از اکسسوری‌های خاص، مدرن و باکیفیت فعالیت خود را آغاز کرده است. ما باور داریم که جزئیات، نقش مهمی در شکل‌گیری
            استایل و بیان شخصیت هر فرد دارند. به همین دلیل تلاش می‌کنیم با انتخاب محصولاتی متنوع و طراحی‌هایی خاص، تجربه‌ای متفاوت از خرید اکسسوری را برای مشتریان خود
            فراهم کنیم. در کنار تنوع محصولات، اصالت کالا، ضمانت بازگشت، ارسال سریع و پشتیبانی واقعی را نیز به همراه داشته باشیم. خدمات مطمئن و تجربه خریدی آسان، به
            انتخابی قابل اعتماد برای علاقه‌مندان به اکسسوری و استایل مدرن تبدیل شویم.
          </p>
          <p className="mt-4 border-t pt-4 text-center text-xs text-(--color-muted-fg)">
            تمام حقوق این وب‌سایت برای فروشگاه اکسسوری آس است.
          </p>
        </div>
      </div>
    </footer>
  );
}
