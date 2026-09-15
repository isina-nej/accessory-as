import Link from "next/link";
import { Diamond, RefreshCcw, Truck, Zap } from "lucide-react";

const FEATURES = [
  { icon: Zap, title: "تحویل اکسپرس", sub: "تحویل سریع و بی‌تاخیر" },
  { icon: Truck, title: "حمل و نقل رایگان", sub: "برای خرید بالای ۵۰۰ هزار تومن" },
  { icon: RefreshCcw, title: "ضمانت بازگشت کالا", sub: "۷ روز ضمانت بازگشت کالا" },
  { icon: Diamond, title: "کیفیت پرمیوم", sub: "متریال و کیفیت ساخت بی‌نقص" },
];

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

export function Footer() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--color-mist)">
                <f.icon className="h-5 w-5 text-(--color-brand)" />
              </span>
              <span>
                <span className="block text-sm font-bold">{f.title}</span>
                <span className="block text-xs text-(--color-muted-fg)">{f.sub}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="grid gap-8 border-t py-8 md:grid-cols-4">
          <div>
            <p className="font-bold">اکسسوری آس، روایتی از سلیقه شما</p>
            <p className="mt-2 text-sm text-(--color-muted-fg)">
              تهران، خیابان ولیعصر، بالاتر از خیابان زرتشت، کوچه جاوید، پلاک ۲۴
            </p>
            <p className="mt-2 text-sm">تلفن پشتیبانی: ۰۲۱ ۷۰۰۸۰۰۱ ــ ۰۹۳۵ ۱۷۹ ۰۸۵۳</p>
          </div>
          {LINK_GROUPS.map((g) => (
            <div key={g.title}>
              <p className="font-bold">{g.title}</p>
              <ul className="mt-2 space-y-1 text-sm text-(--color-muted-fg)">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-(--color-brand)">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="border-t py-4 text-center text-xs text-(--color-muted-fg)">
          تمام حقوق این وب‌سایت برای فروشگاه اکسسوری آس است.
        </p>
      </div>
    </footer>
  );
}
