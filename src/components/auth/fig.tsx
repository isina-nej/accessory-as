import type { ComponentProps, ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";

const input = "h-12 w-full rounded-lg border border-[#d6dbde] bg-[#f8faf9] py-2.5 pr-10 pl-3 text-right text-sm font-bold text-[#161b22] placeholder:text-[#8a9398] focus:border-[#01413e] focus:outline-none focus:ring-2 focus:ring-[#01413e]/15 aria-invalid:border-[#9f1239]";

export function AuthField({ label, icon, hint, hintTone = "muted", error, required = true, reserveHint = true, ...props }: ComponentProps<"input"> & {
  label: string;
  icon?: string;
  hint?: string;
  hintTone?: "muted" | "error";
  error?: string | null;
  required?: boolean;
  reserveHint?: boolean;
}) {
  return (
    <div className="w-full text-right">
      <label htmlFor={props.id} className="mb-2 flex h-[22px] items-center gap-0.5 text-[13px] font-bold text-[#4b5563]">
        {label}{required && <span aria-hidden="true" className="text-sm font-extrabold text-[#9f1239]">*</span>}
      </label>
      <div className="relative">
        <input {...props} required={required} aria-invalid={!!error} aria-describedby={hint || error ? `${props.id}-hint` : undefined} className={`${input} ${props.className ?? ""}`} />
        {icon && (icon.startsWith("/") ? <Image src={icon} alt="" width={28} height={28} className="pointer-events-none absolute top-2 right-2.5 h-7 w-7 object-contain" /> : <Icon name={icon} className="pointer-events-none absolute top-3.5 right-3.5 h-5 w-5 opacity-55" />)}
      </div>
      <p id={`${props.id}-hint`} role={error ? "alert" : undefined} className={`mt-2 ${reserveHint || error || hint ? "min-h-[18px]" : "hidden"} text-[11px] leading-[18px] ${error || hintTone === "error" ? "text-[#9f1239]" : "text-[#8a9398]"}`}>{error || hint || " "}</p>
    </div>
  );
}

export function AuthButton({ children, pending = false, ...props }: ComponentProps<"button"> & { children: ReactNode; pending?: boolean }) {
  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[10px] bg-[radial-gradient(65.01%_290.66%_at_49.73%_50.88%,#00807A_0%,#01413E_100%)] px-4 text-base font-extrabold text-white shadow-[6px_6px_45px_rgba(20,132,127,0.16)] transition-[filter] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#01413e] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? (
        "لطفاً صبر کنید…"
      ) : (
        <>
          <span>{children}</span>
          <Icon name="icons-20--vector-arrow-left" className="h-5 w-5 shrink-0 brightness-0 invert" />
        </>
      )}
    </button>
  );
}

export function AuthError({ children }: { children?: string | null }) {
  return children ? <p role="alert" className="text-right text-[11px] leading-[18px] text-[#9f1239]">{children}</p> : null;
}

export function ResendCode({ left, pending, onResend }: { left: number; pending: boolean; onResend: () => void }) {
  return left > 0 ? (
    <div className="flex h-6 items-center gap-2 text-sm font-bold">
      <span className="text-[#8a9398]">ارسال مجدد کد بعد از</span>
      <span aria-hidden className="h-4 w-4 rounded-full border-[3px] border-[#0a5a55] border-t-transparent" />
      <span dir="ltr" className="text-[#161b22]">۰:{String(left).padStart(2, "0").replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d])}</span>
    </div>
  ) : <button type="button" disabled={pending} onClick={onResend} className="h-6 text-sm font-extrabold text-[#168bd4] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#01413e] disabled:opacity-50">ارسال مجدد کد</button>;
}
