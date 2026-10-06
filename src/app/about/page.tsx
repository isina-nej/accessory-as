import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { getMegaMenu } from "@/lib/menu";

export const metadata = { title: "درباره ما | اکسسوری آس" };

/* Figma 3277:1593 — کارت سفید 1280×428، radius=10، پدینگ 24، گپ تایتل تا بدنه 16 */
const PARAS = [
  "در اکسسوری آس، باور داریم که اکسسوری تنها یک محصول نیست؛ بلکه بخشی از هویت، سلیقه و سبک زندگی هر فرد است. به همین دلیل از نخستین روز فعالیت، تلاش کرده‌ایم مجموعه‌ای از اکسسوری‌های باکیفیت، مدرن و خاص را گرد هم آوریم تا هر انتخاب، تجربه‌ای متفاوت و لذت‌بخش برای مشتریان ما باشد.",
  "هدف ما فراتر از فروش محصولات است. ما می‌خواهیم فضایی ایجاد کنیم که در آن، خرید آنلاین با حس اعتماد، کیفیت و رضایت همراه باشد. به همین منظور، تمامی محصولات پیش از عرضه از نظر کیفیت و جزئیات بررسی می‌شوند تا اطمینان حاصل کنیم آنچه به دست شما می‌رسد، شایسته اعتماد شماست.",
  "در اکسسوری آس، سادگی، کیفیت و توجه به جزئیات، سه اصل اساسی در تمام مراحل فعالیت ما هستند. از انتخاب محصولات گرفته تا تجربه کاربری وب‌سایت، فرآیند ثبت سفارش، بسته‌بندی و ارسال، همه چیز با هدف ارائه تجربه‌ای حرفه‌ای و دلنشین طراحی شده است.",
  "ما باور داریم هر انتخاب، بازتابی از شخصیت افراد است. به همین دلیل تلاش می‌کنیم مجموعه‌ای متنوع و به‌روز از اکسسوری‌ها را ارائه دهیم تا هر سلیقه‌ای بتواند محصولی متناسب با سبک خود پیدا کند. برای ما، رضایت مشتری تنها به لحظه خرید محدود نمی‌شود؛ بلکه آغاز یک ارتباط بلندمدت بر پایه اعتماد، کیفیت و احترام است.",
  "از اینکه اکسسوری آس را برای همراهی در انتخاب‌های خود برگزیده‌اید، سپاسگزاریم. حضور و اعتماد شما، انگیزه ما برای ارائه خدمات بهتر و توسعه این مسیر خواهد بود.",
];

export default async function AboutPage() {
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 md:px-0">
        <div className="mb-8 text-xs">
          <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { label: "درباره ما" }]} />
        </div>
        <section className="rounded-[10px] border border-black/10 bg-white p-6">
          <h1 className="text-right text-2xl font-extrabold leading-10 text-(--color-ink)">
            <span className="text-(--color-brand)">اکسسوری آس،</span> روایتی از سلیقه شما
          </h1>
          <div className="mt-4 space-y-4">
            {PARAS.map((p) => (
              <p key={p.slice(0, 24)} className="text-right text-base font-medium leading-[26.67px] text-(--color-muted-fg)">
                {p}
              </p>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
