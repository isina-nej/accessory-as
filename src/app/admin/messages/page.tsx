import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty, AdminPager, AdminTable } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { MsgBtn } from "@/components/admin/ModerForms";
import { listMessages } from "@/server/admin-content";
import { faDateTime } from "@/lib/admin-labels";
import { toFa } from "@/lib/fa";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";
export const metadata = { title: "پیام‌ها | پنل" };

export default async function AdminMessages({ searchParams }: { searchParams: Promise<{ unread?: string; q?: string; page?: string }> }) {
  const gate = await requirePermission("messages.read");
  if (!gate.ok) redirect("/login?next=/admin/messages");
  const sp = await searchParams;
  const unread = sp.unread === "1";
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const { items, total, pageSize, unreadTotal } = await listMessages({ unreadOnly: unread, q, page });
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const query = new URLSearchParams({ ...(unread ? { unread: "1" } : {}), ...(q ? { q } : {}) });
  return (
    <AdminPage active="/admin/messages" roles={gate.roles}>
      <AdminCard
        title={`پیام‌ها (${toFa(total)}) — نخوانده: ${toFa(unreadTotal)}`}
        action={<Link href={unread ? "/admin/messages" : "/admin/messages?unread=1"} className="rounded-lg border px-3 py-1 text-xs">{unread ? "همه" : "فقط نخوانده"}</Link>}
      >
        <form className="mb-3 flex gap-2" action="/admin/messages">
          <input name="q" defaultValue={q} placeholder="جستجو با نام، ایمیل، موبایل یا متن پیام…" className="h-10 flex-1 rounded-lg border px-3 text-sm" aria-label="جستجوی پیام" />
          {unread && <input type="hidden" name="unread" value="1" />}
          <button className="h-10 rounded-lg bg-(--color-brand) px-4 text-sm text-white">جستجو</button>
          <Link href="/admin/messages" className="flex h-10 items-center rounded-lg border px-4 text-sm">پاک‌کردن</Link>
        </form>
        {items.length === 0 ? (
          <AdminEmpty text={query.size > 0 ? "پیامی با این فیلترها پیدا نشد." : "هنوز پیامی ثبت نشده است."} />
        ) : (
          <AdminTable head={["فرستنده", "متن", "تاریخ", ""]}>
            {items.map((m) => (
              <tr key={m.id} className="border-b">
                <td className="px-2 py-2">
                  <span className="font-bold">{m.name}</span>
                  <span className="block text-xs text-(--color-muted-fg)" dir="ltr">{m.email}</span>
                  {m.phone ? <span className="block text-xs text-(--color-muted-fg)" dir="ltr">{m.phone}</span> : null}
                  {!m.read && <span className="text-[11px] text-(--color-wine)">جدید</span>}
                </td>
                <td className="px-2 py-2 text-xs">{m.body}</td>
                <td className="px-2 py-2 text-xs">{faDateTime(m.createdAt)}</td>
                <td className="px-2 py-2"><MsgBtn id={m.id} read={m.read} /></td>
              </tr>
            ))}
          </AdminTable>
        )}
        <AdminPager basePath="/admin/messages" query={query} page={page} pages={pages} />
      </AdminCard>
    </AdminPage>
  );
}