import Link from "next/link";
import { cn } from "@/lib/cn";

const ITEMS = [
  ["/account", "نمای کلی"],
  ["/account/orders", "سفارش‌ها"],
  ["/account/favorites", "علاقه‌مندی‌ها"],
  ["/account/addresses", "آدرس‌ها"],
  ["/account/info", "اطلاعات حساب کاربری"],
] as const;

export function AccountSidebar({ active, name, phone }: { active: string; name: string; phone: string }) {
  return (
    <aside className="h-fit rounded-2xl border bg-white p-4">
      <p className="font-bold">{name}</p>
      <p dir="ltr" className="text-left text-sm text-(--color-muted-fg)">{phone}</p>
      <nav className="mt-3 space-y-1">
        {ITEMS.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm",
              active === href ? "bg-(--color-mist) font-bold text-(--color-brand)" : "hover:bg-black/5",
            )}
          >
            {label}
          </Link>
        ))}
        <SignOutBtn />
      </nav>
    </aside>
  );
}

function SignOutBtn() {
  return (
    <form
      action={async () => {
        "use server";
        const { auth } = await import("@/lib/auth");
        const { headers } = await import("next/headers");
        await auth.api.signOut({ headers: await headers() });
        const { redirect } = await import("next/navigation");
        redirect("/");
      }}
    >
      <button className="block w-full rounded-lg px-3 py-2 text-right text-sm text-(--color-wine)">
        خروج از حساب کاربری
      </button>
    </form>
  );
}
