import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { getMegaMenu } from "@/lib/menu";

export const metadata = { title: "درباره ما | اکسسوری آس" };

export default async function AboutPage() {
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { label: "درباره ما" }]} />
        <h1 className="text-xl font-extrabold">درباره ما</h1>
        <p className="font-bold text-(--color-brand)">اکسسوری آس، روایتی از سلیقه شما</p>
        <div className="space-y-3 rounded-2xl border bg-white p-6 text-sm leading-8">
          <p>
            در اکسسوری آس باور داریم اکسسوری تنها یک محصول نیست؛ بخشی از هویت، سلیقه و سبک زندگی است.
            فروشگاه ما با هدف ارائه مجموعه‌ای از اکسسوری‌های خاص، مدرن و باکیفیت فعالیت خود را آغاز کرده است.
          </p>
          <p>
            ما باور داریم جزئیات نقش مهمی در شکل‌گیری استایل و بیان شخصیت هر فرد دارند؛ به همین دلیل با
            انتخاب محصولاتی متمایز و طراحی‌های چشم‌نواز، تجربه‌ای متفاوت از خرید اکسسوری فراهم می‌کنیم.
          </p>
          <p>تهران، خیابان ولیعصر، بالاتر از خیابان زرتشت، کوچه جاوید، پلاک ۲۴</p>
          <p>تلفن پشتیبانی: ۰۲۱ ۷۰۰۸۰۰۱ ــ ۰۹۳۵ ۱۷۹ ۰۸۵۳</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
