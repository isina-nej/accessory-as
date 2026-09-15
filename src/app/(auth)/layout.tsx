import type { Metadata } from "next";

export const metadata: Metadata = { title: "ورود یا ثبت‌نام | اکسسوری آس" };

// فیگما Login/*: مودال ۴۴۴px وسط صفحه سفید، کادر Content بوردر #D6DBDE radius 10
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-111 flex-1 flex-col px-4 py-10">
      <div className="rounded-[10px] border border-[#d6dbde] bg-white p-8">
        <div className="flex flex-col items-center text-center">
          <span className="text-base font-extrabold text-[#01413e]">AS accessory</span>
          <p className="mt-2 font-bold text-[#161b22]">اکسسوری آس</p>
          <p className="text-xs text-[#8a9398]">روایتی از سلیقه تو</p>
          <h1 className="mt-4 text-sm font-bold text-[#161b22]">ورود یا ثبت‌نام در اکسسوری آس</h1>
        </div>
        <div className="mt-4 w-full">{children}</div>
      </div>
    </main>
  );
}
