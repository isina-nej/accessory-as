import Link from "next/link";
import { cn } from "@/lib/cn";
import type { StaffRole } from "@/lib/roles";

const ITEMS: { href: string; label: string; roles: StaffRole[] }[] = [
  { href: "/admin", label: "داشبورد", roles: ["admin", "content", "support"] },
  { href: "/admin/products", label: "محصولات", roles: ["admin", "content"] },
  { href: "/admin/categories", label: "دسته‌ها", roles: ["admin", "content"] },
  { href: "/admin/orders", label: "سفارش‌ها", roles: ["admin", "support"] },
  { href: "/admin/users", label: "کاربران", roles: ["admin"] },
  { href: "/admin/content", label: "بنر و صفحات", roles: ["admin", "content"] },
  { href: "/admin/reviews", label: "دیدگاه‌ها", roles: ["admin", "content", "support"] },
  { href: "/admin/messages", label: "پیام‌ها", roles: ["admin", "support"] },
  { href: "/admin/marketing", label: "مارکتینگ", roles: ["admin"] },
  { href: "/admin/settings", label: "تنظیمات", roles: ["admin"] },
];

export function AdminShell({ active, roles, children }: { active: string; roles: StaffRole[]; children: React.ReactNode }) {
  const visible = ITEMS.filter((i) => i.roles.some((r) => roles.includes(r) || roles.includes("admin")));
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-2xl border bg-white p-3">
        <p className="px-2 text-xs text-(--color-muted-fg)">پنل مدیریت</p>
        <nav className="mt-2 space-y-1">
          {visible.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={cn("block rounded-lg px-3 py-2 text-sm", active === i.href ? "bg-(--color-mist) font-bold text-(--color-brand)" : "hover:bg-black/5")}
            >
              {i.label}
            </Link>
          ))}
          <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-(--color-muted-fg)">بازگشت به سایت</Link>
        </nav>
      </aside>
      <div className="min-w-0 space-y-4">{children}</div>
    </div>
  );
}

export function AdminCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-extrabold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminTable({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-160 text-right text-sm">
        <thead>
          <tr className="border-b text-xs text-(--color-muted-fg)">
            {head.map((h) => (
              <th key={h} className="px-2 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const inputCls = "h-10 w-full rounded-lg border bg-white px-3 text-sm";
export const labelCls = "mb-1 block text-xs text-(--color-muted-fg)";
