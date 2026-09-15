import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AdminShell } from "@/components/admin/Shell";
import { AdminCard, AdminTable } from "@/components/admin/ui";
import { MsgBtn } from "@/components/admin/ModerForms";
import { listMessages } from "@/server/admin-content";
import { toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { getMyRoles, isStaff } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "پیام‌ها | پنل" };

export default async function AdminMessages({ searchParams }: { searchParams: Promise<{ unread?: string }> }) {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  if (!(await isStaff("support"))) redirect("/login?next=/admin/messages");
  const roles = await getMyRoles();
  const sp = await searchParams;
  const unread = sp.unread === "1";
  const rows = await listMessages(unread);
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <AdminShell active="/admin/messages" roles={roles}>
          <AdminCard
            title={`پیام‌ها (${toFa(rows.length)})`}
            action={<Link href={unread ? "/admin/messages" : "/admin/messages?unread=1"} className="rounded-lg border px-3 py-1 text-xs">{unread ? "همه" : "فقط نخوانده"}</Link>}
          >
            <AdminTable head={["فرستنده", "متن", ""]}>
              {rows.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="px-2 py-2">
                    <span className="font-bold">{m.name}</span>
                    <span className="block text-xs text-(--color-muted-fg)" dir="ltr">{m.phone}</span>
                    {!m.read && <span className="text-[11px] text-(--color-wine)">جدید</span>}
                  </td>
                  <td className="px-2 py-2 text-xs">{m.body}</td>
                  <td className="px-2 py-2"><MsgBtn id={m.id} read={m.read} /></td>
                </tr>
              ))}
            </AdminTable>
          </AdminCard>
        </AdminShell>
      </main>
      <Footer />
    </div>
  );
}
