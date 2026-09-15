import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { CartView } from "@/components/shop/CartView";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { getMegaMenu } from "@/lib/menu";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { label: "سبد خرید" }]} />
        <CartView />
      </main>
      <Footer />
    </div>
  );
}
