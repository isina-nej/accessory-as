import type { Metadata } from "next";

export const metadata: Metadata = { title: "ورود یا ثبت‌نام | اکسسوری آس" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-white px-4 py-8">
      <section className="w-full max-w-[444px] rounded-[10px] border border-[#d6dbde] bg-white p-8 shadow-[0_4px_90px_rgba(0,0,0,0.04)] max-[420px]:p-6">
        <header className="flex h-[98px] flex-col items-center justify-center gap-2 text-center">
          {/* Asset extracted from the provided reference screenshot, not a generic substitute. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/auth/brand.png" alt="AS accessory" width="54" height="43" className="h-[43px] w-[54px] object-contain" />
          <div className="flex flex-col items-center gap-1.5">
            <p className="text-base leading-[27px] font-extrabold text-[#161b22]">اکسسوری آس</p>
            <p className="text-xs leading-[14px] font-medium text-[#8a9398]">روایتی از سلیقه تو</p>
          </div>
        </header>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}
