import Link from "next/link";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { FaqAccordion, FaqJsonLd } from "@/components/shop/FaqAccordion";
import { getMegaMenu } from "@/lib/menu";

export const metadata = { title: "سوالات متداول | اکسسوری آس" };

export default async function FaqPage() {
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { label: "سوالات متداول" }]} />
        <h1 className="text-xl font-extrabold">سوالات متداول</h1>
        <p className="text-sm text-(--color-muted-fg)">پاسخ رایج‌ترین پرسش‌های شما را اینجا گردآوری کرده‌ایم.</p>
        <FaqAccordion />
        <FaqJsonLd />
        <p className="text-center text-sm">
          جوابت را پیدا نکردی؟ <Link href="/contact" className="text-(--color-brand)">تماس با ما</Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
