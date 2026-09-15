import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { CheckoutSteps } from "@/components/shop/CheckoutSteps";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AddressFlow } from "@/components/shop/AddressFlow";
import { listAddresses } from "@/lib/address-actions";
import { getMegaMenu } from "@/lib/menu";
import { getUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AddressPage() {
  const uid = await getUserId();
  if (!uid) redirect("/login?next=/checkout/address");
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  const res = await listAddresses();
  const list = res.ok ? res.data : [];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb
          trail={[{ href: "/", label: "اکسسوری آس" }, { href: "/cart", label: "سبد خرید" }, { label: "آدرس شما" }]}
        />
        <CheckoutSteps step={2} />
        <AddressFlow
          list={list.map((a) => ({
            id: a.id,
            recipient: a.recipient,
            province: a.province,
            city: a.city,
            detail: a.detail,
            postal: a.postal,
            phone: a.phone,
            isDefault: a.isDefault,
          }))}
        />
      </main>
      <Footer />
    </div>
  );
}
