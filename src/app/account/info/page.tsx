import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { AccountInfo } from "@/components/shop/AccountInfo";
import { getMegaMenu } from "@/lib/menu";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function InfoPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/info");
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));

  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { href: "/account", label: "پروفایل کاربری" }, { label: "اطلاعات حساب" }]} />
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <AccountSidebar active="/account/info" name={user.name ?? "کاربر"} phone={user.email ?? ""} />
          <AccountInfo user={{ name: user.name ?? "کاربر", email: user.email ?? "" }} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
