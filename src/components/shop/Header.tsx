import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";

const NAV = [
  { href: "/?cat=necklace", label: "دسته‌بندی محصولات" },
  { href: "/", label: "فروشگاه" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/about", label: "درباره ما" },
];

export function Header({ cartCount = 0 }: { cartCount?: number }) {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex h-22 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--color-brand) font-bold text-white">
            AS
          </span>
          <span className="leading-tight">
            <span className="block font-bold">اکسسوری آس</span>
            <span className="block text-xs text-(--color-muted-fg)">روایتی از سلیقه تو</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} className="hover:text-(--color-brand)">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/auth"
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-black/5"
          >
            <User className="h-4 w-4" />
            ورود یا ثبت‌نام
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1 rounded-lg bg-(--color-brand) px-3 py-2 text-sm text-white"
          >
            <ShoppingBag className="h-4 w-4" />
            سبد
            {cartCount > 0 && (
              <span className="absolute -top-2 -left-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--color-wine) px-1 text-xs">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto border-t px-4 py-2 text-sm md:hidden">
        {NAV.map((n) => (
          <Link key={n.label} href={n.href} className="whitespace-nowrap">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
