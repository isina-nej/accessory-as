import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { ContactForm } from "@/components/shop/ContactForm";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { getMegaMenu } from "@/lib/menu";

export const metadata = { title: "تماس با ما | اکسسوری آس" };

export default async function ContactPage() {
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { label: "تماس با ما" }]} />
        <h1 className="text-xl font-extrabold">تماس با ما</h1>
        <div className="rounded-2xl border bg-white p-4 text-sm leading-8">
          <p>تهران، خیابان ولیعصر، بالاتر از خیابان زرتشت، کوچه جاوید، پلاک ۲۴</p>
          <p>تلفن پشتیبانی: ۰۲۱ ۷۰۰۸۰۰۱ ــ ۰۹۳۵ ۱۷۹ ۰۸۵۳</p>
          <p className="text-(--color-muted-fg)">شنبه تا پنجشنبه، ۹ تا ۱۸</p>
        </div>
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
