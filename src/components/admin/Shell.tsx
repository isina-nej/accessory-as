import Link from "next/link";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { cn } from "@/lib/cn";
import { getMegaMenu } from "@/lib/menu";
import type { AdminPermission, StaffRole } from "@/lib/roles";
import { hasStaffPermission, ROLE_FA } from "@/lib/roles";

export { AdminCard, AdminTable, inputCls, labelCls } from "@/components/admin/ui";

const ITEMS: { href: string; label: string; permission: AdminPermission }[] = [
  { href: "/admin", label: "داشبورد", permission: "dashboard.read" },
  { href: "/admin/products", label: "محصولات", permission: "products.read" },
  { href: "/admin/categories", label: "دسته‌ها", permission: "categories.read" },
  { href: "/admin/attributes", label: "ویژگی‌ها", permission: "attributes.read" },
  { href: "/admin/orders", label: "سفارش‌ها", permission: "orders.read" },
  { href: "/admin/users", label: "کاربران", permission: "users.read" },
  { href: "/admin/payments", label: "پرداخت‌ها", permission: "payments.read" },
  { href: "/admin/refunds", label: "بازپرداخت‌ها", permission: "refunds.read" },
  { href: "/admin/content", label: "بنر و صفحات", permission: "content.read" },
  { href: "/admin/reviews", label: "دیدگاه‌ها", permission: "reviews.read" },
  { href: "/admin/messages", label: "پیام‌ها", permission: "messages.read" },
  { href: "/admin/marketing", label: "مارکتینگ", permission: "marketing.read" },
  { href: "/admin/settings", label: "تنظیمات", permission: "settings.read" },
];

export type AdminPageProps = {
  active: string;
  roles: StaffRole[];
  children: React.ReactNode;
};

// هدر/فوتر فروشگاه در همه صفحه‌های پنل یکسان است
export async function AdminPage({ active, roles, children }: AdminPageProps) {
  const menu = await getMegaMenu().catch(() => ({ cats: [], byCat: {} }));
  const visible = ITEMS.filter((i) => hasStaffPermission(roles, i.permission));
  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="flex-1">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[220px_1fr]">
          <aside className="h-fit rounded-2xl border bg-white p-3">
            <p className="px-2 text-xs text-(--color-muted-fg)">پنل مدیریت</p>
            <p className="mt-1 px-2 text-[11px] text-(--color-muted-fg)">نقش: {roles.map((r) => ROLE_FA[r]).join("، ")}</p>
            <nav className="mt-2 space-y-1">
              {visible.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  aria-current={active === i.href ? "page" : undefined}
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
      </main>
      <Footer />
    </div>
  );
}

// نسخه هم‌شکل بدون هدر/فوتر برای صفحه‌هایی که خودشان چیدمان کامل دارند (مثلاً لودینگ)
export function AdminGrid({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[220px_1fr]">{children}</div>;
}