import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { ContactForm } from "@/components/shop/ContactForm";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { Icon } from "@/components/ui/Icon";
import { getMegaMenu } from "@/lib/menu";

export const metadata = { title: "تماس با ما | اکسسوری آس" };

const ADDRESS = "تهران، خیابان ولیعصر، بالاتر از خیابان زرتشت، کوچه جاوید، پلاک ۲۴";
const MAP_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

function ContactInfo() {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <ul className="flex h-[199px] flex-col gap-6 pt-12 text-right">
        <li className="flex items-center justify-start gap-3 text-base font-bold text-(--color-ink)">
          <Icon name="icons-20--spam-email" className="h-5 w-5 shrink-0" />
          <a href="mailto:Maleki.uix@gmail.com" dir="ltr" className="hover:text-(--color-brand)">Maleki.uix@gmail.com</a>
        </li>
        <li className="flex items-center justify-start gap-3 text-base font-bold text-(--color-ink)">
          <Icon name="icons-20--calling" className="h-5 w-5 shrink-0" />
          <span>۰۲۱ ۷۰۰۸۰۰۱&nbsp;&nbsp;۰۹۳۵ ۱۷۹ ۰۸۵۳</span>
        </li>
        <li className="flex items-center justify-start gap-3 text-base font-bold text-(--color-ink)">
          <Icon name="icons-20--time" className="h-5 w-5 shrink-0" />
          <span>۷ روز هفته، ۲۴ ساعته پاسخگوی شما هستیم.</span>
        </li>
      </ul>

      <div className="relative h-[462px] overflow-hidden rounded-[10px] border border-[#D6DBDE] bg-[#EEF1F1]">
        {/* Figma 2895:5078 map export; replaces third-party map dependency. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/contact-map.png" alt="نقشه شعبه حضوری اکسسوری آس" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: "center 69%" }} />
        <Icon name="contact-map-marker" className="absolute left-[38.2%] top-[44.8%] h-[41px] w-[27px]" />
        <div className="absolute inset-x-4 bottom-4 h-[155px] rounded-[10px] border border-[#D6DBDE] bg-white p-4 shadow-sm">
          <p className="text-right text-base font-extrabold text-(--color-ink)">شعبه حضوری فروشگاه</p>
          <p className="mt-2 flex items-center justify-end gap-2 text-right text-sm font-medium text-(--color-muted-fg)">
            {ADDRESS}
            <Icon name="icons-20--pinned-map" className="h-5 w-5 shrink-0" />
          </p>
          <div className="mt-3 flex justify-start">
            <a href={MAP_LINK} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-3 rounded-[10px] border border-[#D6DBDE] px-5 text-sm font-bold text-(--color-ink) transition hover:border-(--color-brand)">
              مسیریابی
              <Icon name="icons-20--direction-left" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ContactPage() {
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-[100px] pt-8 xl:px-0">
        <div className="mb-8 text-xs">
          <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { label: "تماس با ما" }]} />
        </div>
        <section className="rounded-[10px] border border-[#D6DBDE] bg-white px-4 pb-6 pt-8 md:px-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 h-[62px] w-[62px]">
              <span className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-[#E5F0EF]" aria-hidden="true" />
              <Icon name="contact-dialogue" className="relative h-[62px] w-[62px]" />
            </div>
            <h1 className="text-2xl font-extrabold leading-10 text-(--color-ink)">ارتباط با اکسسوری آس</h1>
            <p className="mt-2 max-w-full text-base font-medium leading-[27px] text-(--color-muted-fg) xl:whitespace-nowrap">
              اگر سوال، درخواست یا نیاز به راهنمایی دارید، تیم اکسسوری آس با افتخار آماده پاسخگویی و همراهی شماست.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="min-w-0 rounded-[10px] border border-[#D6DBDE] p-6">
              <h2 className="text-right text-xl font-extrabold leading-8 text-(--color-ink)">آماده شنیدن شما هستیم</h2>
              <p className="mt-2 text-right text-sm font-medium leading-6 text-(--color-muted-fg)">
                فرم زیر را تکمیل کنید تا تیم اکسسوری آس در کوتاه‌ترین زمان ممکن با شما در ارتباط باشد. همچنین می‌توانید از طریق شماره تماس یا شبکه‌های اجتماعی با ما در ارتباط باشید.
              </p>
              <hr className="my-6 border-[#D6DBDE]" />
              <ContactForm />
            </div>
            <ContactInfo />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
