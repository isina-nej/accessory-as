import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { CheckoutSteps } from "@/components/shop/CheckoutSteps";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { ShippingFlow } from "@/components/shop/ShippingFlow";
import { db } from "@/db";
import { shippingMethods } from "@/db/schema";
import { getMegaMenu } from "@/lib/menu";
import { getUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ShippingPage({
  searchParams,
}: {
  searchParams: Promise<{ addressId?: string }>;
}) {
  const uid = await getUserId();
  if (!uid) redirect("/login?next=/checkout/address");
  const { addressId } = await searchParams;
  if (!addressId) redirect("/checkout/address");
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  const methods = await db.select().from(shippingMethods).catch(() => []);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb
          trail={[
            { href: "/", label: "اکسسوری آس" },
            { href: "/cart", label: "سبد خرید" },
            { label: "روش ارسال" },
          ]}
        />
        <CheckoutSteps step={3} />
        <ShippingFlow
          addressId={addressId}
          methods={methods.map((m) => ({
            slug: m.slug,
            title: m.title,
            feeToman: m.feeToman,
            freeOverToman: m.freeOverToman,
          }))}
          subtotal={null}
        />
      </main>
      <Footer />
    </div>
  );
}
