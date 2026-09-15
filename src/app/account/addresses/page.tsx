import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { AccountAddresses } from "@/components/shop/AccountAddresses";
import { listAddresses } from "@/lib/address-actions";
import { getMegaMenu } from "@/lib/menu";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/addresses");
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  const res = await listAddresses();
  const list = res.ok ? res.data : [];

  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { href: "/account", label: "پروفایل کاربری" }, { label: "آدرس‌ها" }]} />
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <AccountSidebar active="/account/addresses" name={user.name ?? "کاربر"} phone={user.email ?? ""} />
          <AccountAddresses list={list.map((a) => ({
            id: a.id,
            recipient: a.recipient,
            province: a.province,
            city: a.city,
            detail: a.detail,
            postal: a.postal,
            phone: a.phone,
            isDefault: a.isDefault,
          }))} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
