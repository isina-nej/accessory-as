import type { Metadata } from "next";

export const metadata: Metadata = { title: "ورود یا ثبت‌نام | اکسسوری آس" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-(--color-brand) font-bold text-white">
        AS
      </span>
      <p className="mt-2 font-bold">اکسسوری آس</p>
      <p className="text-sm text-(--color-muted-fg)">روایتی از سلیقه تو</p>
      <h1 className="mt-6 text-lg font-extrabold">ورود یا ثبت‌نام در اکسسوری آس</h1>
      <div className="mt-4 w-full">{children}</div>
    </main>
  );
}
