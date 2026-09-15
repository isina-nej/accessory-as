import Link from "next/link";
import { cn } from "@/lib/cn";

// فیگما Account: سایدبار سفید، آیتم فعال bg #F8FAF9 + متن #0A5A55، خروج wine
const ITEMS = [
  ["/account", "نمای کلی"],
  ["/account/orders", "سفارش‌ها"],
  ["/account/favorites", "علاقه‌مندی‌ها"],
  ["/account/addresses", "آدرس‌ها"],
  ["/account/info", "اطلاعات حساب کاربری"],
] as const;

export function AccountSidebar({ active, name, phone }: { active: string; name: string; phone: string }) {
  return (
    <aside className="h-fit rounded-[10px] border border-[#d6dbde] bg-white p-4">
      <p className="text-base font-extrabold text-[#161b22]">{name}</p>
      <p dir="ltr" className="mt-1 text-left text-base font-bold text-[#161b22]">{phone}</p>
      <nav className="mt-4 space-y-1">
        {ITEMS.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "block rounded-lg px-3 py-2.5 text-sm font-extrabold",
              active === href ? "bg-[#f8faf9] text-[#0a5a55]" : "text-[#161b22] hover:bg-black/5",
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
      <button className="block w-full rounded-lg px-3 py-2.5 text-right text-sm font-extrabold text-[#9f1239]">
        خروج از حساب کاربری
      </button>
    </form>
  );
}
