"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { isMobileOrEmail, isPhoneAccount } from "@/lib/checkout";
import { toFa } from "@/lib/fa";
import { FIG_BTN, FIG_INPUT, FigError, FigLabel } from "./fig";

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
    <div className="w-full">
      {step === 1 && (
        <form onSubmit={step1} className="space-y-4">
          <label className="block">
            <FigLabel hint={err ?? undefined}>شماره موبایل یا ایمیل خود را وارد کنید</FigLabel>
            <input className={FIG_INPUT} value={idVal} onChange={(e) => setIdVal(e.target.value)} placeholder="شماره موبایل یا ایمیل" dir="ltr" />
          </label>
          <button disabled={pending} className={FIG_BTN}>
            {pending ? "…" : "تایید و ادامه"}
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={step2} className="space-y-4">
          <label className="block">
            <FigLabel hint={`کد ارسال‌شده به ${toFa(idVal.trim())} را وارد کنید.`}>کد تایید را وارد کنید</FigLabel>
            <input className={FIG_INPUT} value={code} onChange={(e) => setCode(e.target.value)} placeholder="کد تایید" dir="ltr" inputMode="numeric" />
          </label>
          <FigError msg={err} />
          <button disabled={pending} className={FIG_BTN}>
            {pending ? "…" : "تایید و ادامه"}
          </button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={step3} className="space-y-4">
          <label className="block">
            <FigLabel>رمز عبور جدید</FigLabel>
            <input type="password" className={FIG_INPUT} value={p1} onChange={(e) => setP1(e.target.value)} placeholder="رمز عبور جدید" autoComplete="new-password" />
          </label>
          <label className="block">
            <FigLabel>تکرار رمز عبور</FigLabel>
            <input type="password" className={FIG_INPUT} value={p2} onChange={(e) => setP2(e.target.value)} placeholder="تکرار رمز عبور" autoComplete="new-password" />
          </label>
          <FigError msg={err} />
          <button disabled={pending} className={FIG_BTN}>
            {pending ? "…" : "تایید و ادامه"}
          </button>
        </form>
      )}
      {step === 4 && (
        <div className="space-y-4 text-center">
          <p className="text-lg font-extrabold text-[#0a5a55]">عملیات موفقیت‌آمیز!</p>
          <p className="text-sm text-[#4b5563]">رمز عبور شما با موفقیت ویرایش شد.</p>
          <button onClick={() => router.push("/login")} className={FIG_BTN}>
            برگشت به صفحه ورود
          </button>
        </div>
      )}
    </div>
  );
}
