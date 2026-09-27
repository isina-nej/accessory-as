import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const LINK_GROUPS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "با اکسســـوری آس",
    links: [
      { label: "فروشــگاه کسســـوری آس", href: "/shop" },
      { label: "تمـاس با کسســـوری آس", href: "/contact" },
      { label: "دربــاره کسســـوری آس", href: "/about" },
    ],
  },
  {
    title: "خدمـــات مشــتریان",
    links: [
      { label: "پاســخ به پرسـش هـای متـداول", href: "/faq" },
      { label: "شرایـط اســتفاده", href: "/about" },
      { label: "حریــم خصـوصــی", href: "/about" },
    ],
  },
  {
    title: "راهنمـای خریــد از اکسســـوری آس",
    links: [
      { label: "نحـوه ثبــت سـفارش", href: "/faq" },
      { label: "رویــه ارســال سـفارش", href: "/faq" },
      { label: "شیـوه هـای پرداخــت", href: "/faq" },
    ],
  },
];

const PERKS = [
  { icon: "icons-20--diamond", title: "کیفیت پرمیــوم", sub: "متریال‌ و کیفیت ساخت بی ‌نقص" },
  { icon: "icons-20--repeat", title: "ضمانت بازگشــت کالا", sub: "۷ روز ضمانت بازگشت کالا" },
  { icon: "icons-20--truck", title: "حمل و نقل رایــگان", sub: "برای خرید بالای ۵۰۰ هزار تومن" },
  { icon: "icons-20--delivery", title: "تحویل اکسـپرس", sub: "تحویل سریع و بی تاخیر" },
];

const SOCIALS = [
  { label: "تلگرام", icon: "icons-24--telegram-2" },
  { label: "اینستاگرام", icon: "icons-24--instagram-2" },
  { label: "واتساپ", icon: "icons-24--whatsapp-2" },
];

export function Footer({ settings }: { settings?: Record<string, string> }) {
  const address = settings?.footer_address ?? "تهران، خیابان ولیعصر، بالاتر از خیابان زرتشت، کوچه جاوید، پلاک ۲۴";
  const phones = settings?.footer_phones ?? "۰۲۱ ۷۰۰۸۰۰۱ ــ ۰۹۳۵ ۱۷۹ ۰۸۵۳";
  const seoTitle = settings?.footer_seo_title ?? "اکسســـوری آس، روایتــی از سلیـقه شمـــا";
  const seoBody =
    settings?.footer_seo_body ??
    "فروشگاه اکسســوری آس با هدف ارائه مجموعه‌ ای از اکسسوری ‌های خاص، مدرن و با کیفیت فعالیت خود را آغاز کرده است. ما باور داریم که جزئیات، نقش مهمی در شکل‌گیری استایل و بیان شخصیت هر فرد دارند. به همین دلیل تلاش می‌کنیم با انتخاب محصولاتی متمایز و طراحی‌ هایی چشم‌ نواز، تجربه ‌ای متفاوت از خرید اکسسوری را برای مشتریان خود فراهم کنیم. در AS مجموعه ‌ای متنوع از دستبند، گردنبند، انگشتر، گوشواره و سایر اکسسوری ‌های منتخب گرد آوری شده است تا پاسخگوی سلیقه‌ های مختلف باشد. تمرکز ما بر کیفیت، ظرافت در طراحی و ارائه محصولاتی است که بتوانند در کنار زیبایی، ماندگاری و ارزش واقعی را نیز به همراه داشته باشند. ما همواره در تلاشیم تا با ارائه جدید ترین کالکشن‌ ها، خدمات مطمئن و تجربه خریدی آسان، به انتخابی قابل اعتماد برای علاقه ‌مندان به اکسسوری و استایل مدرن تبدیل شویم.";

  return (
    <footer className="mt-16 border-t border-[#D6DBDE] bg-white">
      <div className="mx-auto max-w-[1280px] px-4">
        {/* ردیف بالا: لوگو + آدرس + تلفن + سوشال عین فیگما */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-black/5 py-6 md:flex-row md:items-center">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-left font-serif font-black leading-none text-[#0A5A55]">
              <span className="block text-2xl tracking-tighter">AS</span>
              <span className="block text-[10px] tracking-widest font-sans font-medium">accessory</span>
            </span>
            <span aria-hidden className="h-8 w-px bg-black/10" />
            <span className="leading-tight text-right">
              <span className="block text-base font-extrabold text-[#161B22]">اکسسوری آس</span>
              <span className="block text-xs font-medium text-[#8A9398]">روایتی از سلیقه تو</span>
            </span>
          </Link>
          <p className="flex items-center gap-2 text-sm text-[#4B5563]" dir="ltr">
            <span dir="rtl">{phones}</span>
            <Icon name="icons-20--calling" className="h-4 w-4" alt="" />
          </p>
          <p className="flex items-center gap-2 text-sm text-[#4B5563]">
            {address}
            <Icon name="icons-20--pinned-map" className="h-4 w-4 shrink-0" alt="" />
          </p>
          <div className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="/contact"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 text-[#4B5563] hover:border-[#0A5A55] hover:text-[#0A5A55] transition"
              >
                <Icon name={s.icon} className="h-5 w-5" alt={s.label} />
              </a>
            ))}
          </div>
        </div>

        {/* ردیف میانی: ۳ ستون لینک در راست + نماد اعتماد در چپ */}
        <div className="grid gap-8 py-10 md:grid-cols-4">
          {LINK_GROUPS.map((g) => (
            <div key={g.title} className="text-right">
              <p className="font-extrabold text-[#161B22] text-base">{g.title}</p>
              <ul className="mt-4 space-y-2.5 text-sm text-[#4B5563]">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-[#0A5A55] transition">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex items-start justify-center md:justify-start">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-[#FAFBFB] p-2 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/figma-landing/trust-samandehi.webp" alt="نماد ساماندهی samandehi.ir" className="h-full w-full object-contain" />
            </div>
          </div>
        </div>

        {/* ردیف پرک‌ها (۴ ویژگی با آیکون و جداکننده) */}
        <div className="grid grid-cols-2 gap-4 border-t border-black/5 py-8 md:grid-cols-4">
          {PERKS.map((f, i) => (
            <div
              key={f.title}
              className={i > 0 ? "flex items-center gap-3.5 md:border-r md:border-black/5 md:pr-6" : "flex items-center gap-3.5"}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D7E8E7]">
                <Icon name={f.icon} className="h-6 w-6" alt="" />
              </span>
              <span className="text-right">
                <span className="block text-sm font-bold text-[#161B22]">{f.title}</span>
                <span className="block text-xs text-[#4B5563] mt-0.5">{f.sub}</span>
              </span>
            </div>
          ))}
        </div>

        {/* متن سئو و کپی‌رایت */}
        <div className="border-t border-black/5 py-8 text-right">
          <p className="text-base font-extrabold text-[#0A5A55]">{seoTitle}</p>
          <p className="mt-3 text-xs md:text-sm leading-7 text-[#4B5563]">{seoBody}</p>
          <p className="mt-6 border-t border-black/5 pt-6 text-center text-xs md:text-sm font-medium text-[#8A9398]">
            تمام حقـوق اين وب‌ سـايت برای فروشــگاه اکسســـوری آس است.
          </p>
        </div>
      </div>
    </footer>
  );
}
