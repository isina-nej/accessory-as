import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { toFa } from "@/lib/fa";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  ["/account", "نمای کلـی", "icons-solid-20--home"],
  ["/account/orders", "سفـارش ها", "icons-20--delivery-process"],
  ["/account/favorites", "علاقـه منـدی ها", "icons-20--favorite-icon"],
  ["/account/addresses", "آدرس ها", "icons-20--location-user"],
  ["/account/info", "اطلاعـات حسـاب کاربـری", "icons-20--edit-user"],
] as const;

export function AccountSidebar({
  active,
  name,
  phone,
}: {
  active: string;
  name: string;
  phone: string;
}) {
  return (
    <aside className="h-fit w-full lg:w-[329px] shrink-0 rounded-[10px] border border-[#D6DBDE] bg-white p-6">
      {/* پروفایل کاربر */}
      <div className="flex items-center justify-between border-b border-[#D6DBDE] pb-6">
        <div className="text-right">
          <p className="text-base font-extrabold text-[#161B22]">{name}</p>
          <p dir="ltr" className="mt-1 text-right text-sm font-bold text-[#8A9398]">
            {toFa(phone)}
          </p>
        </div>
        <Link
          href="/account/info"
          aria-label="ویرایش اطلاعات حساب کاربری"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] text-[#1889F2] transition-colors hover:bg-[#EAEFEF]"
        >
          <Icon name="icons-20--edit-pen" className="h-5 w-5" alt="" />
        </Link>
      </div>

      {/* منوی ناوبری */}
      <nav className="mt-2 flex flex-col">
        {NAV_ITEMS.map(([href, label, iconName]) => {
          const isActive = active === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex h-[52px] items-center justify-between border-b border-[#D6DBDE] text-sm font-extrabold transition-colors",
                isActive ? "text-[#0A5A55]" : "text-[#161B22] hover:text-[#0A5A55]",
              )}
            >
              {isActive && (
                <span className="absolute -right-6 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-full bg-[#0A5A55]" />
              )}
              <div className="flex items-center gap-3">
                <Icon
                  name={iconName}
                  className={cn("h-5 w-5", isActive ? "brightness-100" : "opacity-75")}
                  alt=""
                />
                <span>{label}</span>
              </div>
              <Icon name="icons-20--direction-left" className="h-4 w-4 opacity-40" alt="" />
            </Link>
          );
        })}
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
      className="pt-4"
    >
      <button
        type="submit"
        className="flex w-full items-center gap-3 text-right text-sm font-extrabold text-[#9F1239] transition-opacity hover:opacity-80"
      >
        <Icon name="icons-20--semicircle-logout" className="h-5 w-5" alt="" />
        <span>خروج از حساب کاربری</span>
      </button>
    </form>
  );
}
