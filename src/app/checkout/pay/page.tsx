import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { CheckoutSteps } from "@/components/shop/CheckoutSteps";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { PayFlow } from "@/components/shop/PayFlow";
import { getMegaMenu } from "@/lib/menu";
import { getUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ addressId?: string; shippingSlug?: string; coupon?: string }>;
}) {
  const uid = await getUserId();
  if (!uid) redirect("/login?next=/checkout/address");
  const sp = await searchParams;
  if (!sp.addressId || !sp.shippingSlug) redirect("/checkout/address");
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));

  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb
          trail={[
            { href: "/", label: "اکسسوری آس" },
            { href: "/cart", label: "سبد خرید" },
            { label: "پرداخت" },
          ]}
        />
        <CheckoutSteps step={4} />
        <PayFlow addressId={sp.addressId} shippingSlug={sp.shippingSlug} coupon={sp.coupon} />
      </main>
      <Footer />
    </div>
  );
}
