import { redirect } from "next/navigation";
import { AdminCard } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { listSettings } from "@/server/admin-content";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "تنظیمات | پنل" };

export default async function AdminSettings() {
  const gate = await requirePermission("settings.read");
  if (!gate.ok) redirect("/login?next=/admin/settings");
  const rows = await listSettings();
  const initial: Record<string, string> = {};
  for (const r of rows) initial[r.key] = r.value;
  return (
    <AdminPage active="/admin/settings" roles={gate.roles}>
      <AdminCard title="تنظیمات سایت و فوتر">
        <SettingsForm initial={initial} />
      </AdminCard>
      <AdminCard title="ساخت اولین ادمین (ADMIN_EMAIL)">
        <p className="text-xs leading-6 text-(--color-muted-fg)">
          برای ساخت اولین ادمین: در تنظیمات محیطی (env) مقدار ADMIN_EMAIL را با ایمیل مدیر بگذار، با همان ایمیل وارد سایت شو و صفحه /admin را باز کن. بعد از ساخت نقش، این مقدار را حذف کن.
        </p>
      </AdminCard>
    </AdminPage>
  );
}