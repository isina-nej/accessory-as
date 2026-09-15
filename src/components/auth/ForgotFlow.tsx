"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { isMobileOrEmail, isPhoneAccount } from "@/lib/checkout";
import { toFa } from "@/lib/fa";

const input = "h-11 w-full rounded-lg border bg-white px-3 text-sm";

export function ForgotFlow() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [idVal, setIdVal] = useState("");
  const [code, setCode] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function step1(e: React.FormEvent) {
    e.preventDefault();
    const v = idVal.trim();
    if (!isMobileOrEmail(v)) {
      setErr("شماره / ایمیل نامعتبر است!");
      return;
    }
    setPending(true);
    setErr(null);
    try {
      if (isPhoneAccount(v)) {
        const r = await authClient.phoneNumber.requestPasswordReset({ phoneNumber: v });
        if (r.error) throw new Error();
      } else {
        const r = await authClient.emailOtp.sendVerificationOtp({ email: v, type: "forget-password" });
        if (r.error) throw new Error();
      }
      setStep(2);
    } catch {
      setErr("ارسال کد ناموفق بود");
    } finally {
      setPending(false);
    }
  }

  async function step2(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr(null);
    try {
      const v = idVal.trim();
      if (isPhoneAccount(v)) {
        // صحت کد در مرحله ۳ همراه ریست بررسی می‌شود
        if (code.trim().length < 4) throw new Error("short");
      } else {
        const r = await authClient.emailOtp.checkVerificationOtp({
          email: v,
          otp: code.trim(),
          type: "forget-password",
        });
        if (r.error) throw new Error();
      }
      setStep(3);
    } catch {
      setErr("کد اشتباه است؛ دوباره تلاش کن");
    } finally {
      setPending(false);
    }
  }

  async function step3(e: React.FormEvent) {
    e.preventDefault();
    if (p1.length < 8) {
      setErr("رمز عبور شما باید حداقل ۸ حرف باشد.");
      return;
    }
    if (p1 !== p2) {
      setErr("رمز عبور خود را به درستی تکرار بکنید!");
      return;
    }
    setPending(true);
    setErr(null);
    try {
      const v = idVal.trim();
      if (isPhoneAccount(v)) {
        const r = await authClient.phoneNumber.resetPassword({
          phoneNumber: v,
          otp: code.trim(),
          newPassword: p1,
        });
        if (r.error) throw new Error();
      } else {
        const r = await authClient.emailOtp.resetPassword({
          email: v,
          otp: code.trim(),
          password: p1,
        });
        if (r.error) throw new Error();
      }
      setStep(4);
    } catch {
      setErr("تغییر رمز ناموفق بود؛ کد را دوباره بررسی کن");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border bg-white p-5">
      {step === 1 && (
        <form onSubmit={step1} className="space-y-3">
          <p className="text-sm">شماره موبایل یا ایمیل خود را وارد کنید</p>
          <input className={input} value={idVal} onChange={(e) => setIdVal(e.target.value)} placeholder="شماره موبایل یا ایمیل" dir="ltr" />
          {err && <p className="text-sm text-(--color-wine)">{err}</p>}
          <button disabled={pending} className="h-11 w-full rounded-lg bg-(--color-brand) font-bold text-white disabled:opacity-50">
            تایید و ادامه
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={step2} className="space-y-3">
          <p className="text-sm font-bold">کد تایید را وارد کنید</p>
          <p className="text-xs text-(--color-muted-fg)">کد ارسال‌شده به {toFa(idVal.trim())} را وارد کنید.</p>
          <input className={input} value={code} onChange={(e) => setCode(e.target.value)} placeholder="کد تایید" dir="ltr" inputMode="numeric" />
          {err && <p className="text-sm text-(--color-wine)">{err}</p>}
          <button disabled={pending} className="h-11 w-full rounded-lg bg-(--color-brand) font-bold text-white disabled:opacity-50">
            تایید و ادامه
          </button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={step3} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block">رمز عبور جدید</span>
            <input type="password" className={input} value={p1} onChange={(e) => setP1(e.target.value)} placeholder="رمز عبور جدید" autoComplete="new-password" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block">تکرار رمز عبور</span>
            <input type="password" className={input} value={p2} onChange={(e) => setP2(e.target.value)} placeholder="تکرار رمز عبور" autoComplete="new-password" />
          </label>
          {err && <p className="text-sm text-(--color-wine)">{err}</p>}
          <button disabled={pending} className="h-11 w-full rounded-lg bg-(--color-brand) font-bold text-white disabled:opacity-50">
            تایید و ادامه
          </button>
        </form>
      )}
      {step === 4 && (
        <div className="space-y-3 text-center">
          <p className="font-extrabold text-(--color-brand)">عملیات موفقیت‌آمیز!</p>
          <p className="text-sm text-(--color-muted-fg)">رمز عبور شما با موفقیت ویرایش شد.</p>
          <button onClick={() => router.push("/login")} className="h-11 w-full rounded-lg bg-(--color-brand) font-bold text-white">
            برگشت به صفحه ورود
          </button>
          <Link href="/" className="block text-sm text-(--color-muted-fg)">صفحه اصلی</Link>
        </div>
      )}
    </div>
  );
}
