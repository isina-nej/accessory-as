import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { listSettings } from "@/server/admin-content";
import { getMegaMenu } from "@/lib/menu";
import { getMyRoles } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "تنظیمات | پنل" };

export default async function AdminSettings() {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  const roles = await getMyRoles();
  if (!roles.includes("admin")) redirect("/login?next=/admin/settings");
  const rows = await listSettings();
  const initial: Record<string, string> = {};
  for (const r of rows) initial[r.key] = r.value;
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin/settings" roles={roles}>
          <AdminCard title="تنظیمات سایت و فوتر">
            <SettingsForm initial={initial} />
          </AdminCard>
          <AdminCard title="ADMIN_EMAIL">
            <p className="text-xs leading-6 text-(--color-muted-fg)">
              برای ساخت اولین ادمین: در ورسل env با نام ADMIN_EMAIL ایمیل مدیر را بگذار، با همان ایمیل وارد سایت شو و صفحه /admin را باز کن. بعد مقدار را حذف کن.
            </p>
          </AdminCard>
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}
