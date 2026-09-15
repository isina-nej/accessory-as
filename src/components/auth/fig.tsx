"use client";

import { useRouter } from "next/navigation";

// استایل عین فیگما: لیبل ۱۳px #4B5563 + ستاره #9F1239، فیلد h-12 bg #F8FAF9 border #D6DBDE radius 8، هینت ۱۱px #9F1239، دکمه h-13 radius 10
export const FIG_INPUT = "h-12 w-full rounded-lg border border-[#d6dbde] bg-[#f8faf9] px-3 text-sm text-[#161b22] placeholder:text-[#8a9398] focus:border-[#0a5a55] focus:outline-none";
export const FIG_BTN = "h-13 w-full rounded-[10px] bg-[#0a5a55] py-3.5 text-base font-extrabold text-white disabled:opacity-50 hover:bg-[#084a46]";

export function FigLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-1 block">
      <span className="text-[13px] font-bold text-[#4b5563]">
        <span className="ml-1 font-extrabold text-[#9f1239]">*</span>
        {children}
      </span>
      {hint && <span className="mt-1 block text-[11px] font-medium text-[#9f1239]">{hint}</span>}
    </span>
  );
}

export function FigError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="text-[11px] font-medium text-[#9f1239]">{msg}</p>;
}

export function FigSubmit({ pending, children, onBack }: { pending: boolean; children: React.ReactNode; onBack?: () => void }) {
  const router = useRouter();
  return (
    <span className="block space-y-2">
      <button disabled={pending} className={FIG_BTN}>
        {pending ? "…" : children}
      </button>
      {onBack && (
        <button type="button" onClick={onBack} className="w-full text-center text-sm text-[#0a5a55]">
          بازگشت
        </button>
      )}
      <button type="button" onClick={() => router.push("/")} className="w-full text-center text-xs text-[#8a9398]">
        صفحه اصلی
      </button>
    </span>
  );
}
