"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { normalizeDigits } from "@/lib/auth-ui";
import { isMobileOrEmail, isPhoneAccount } from "@/lib/checkout";
import { toFa } from "@/lib/fa";
import { AuthButton, AuthError, AuthField, ResendCode } from "./fig";

export function ForgotFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [idVal, setIdVal] = useState(() => params.get("identifier") ?? "");
  const [code, setCode] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p3, setP3] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [deadline, setDeadline] = useState(0);
  const [left, setLeft] = useState(0);
  const id = normalizeDigits(idVal.trim());

  useEffect(() => {
    if (!deadline) return;
    const timer = setInterval(() => setLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  async function sendOtp() {
    const response = isPhoneAccount(id)
      ? await authClient.phoneNumber.requestPasswordReset({ phoneNumber: id })
      : await authClient.emailOtp.requestPasswordReset({ email: id });
    if (response.error) throw new Error("ارسال کد ناموفق بود.");
    setDeadline(Date.now() + 60_000);
    setLeft(60);
    setCode("");
  }

  async function submitIdentifier(event: React.FormEvent) {
    event.preventDefault();
    if (!isMobileOrEmail(id)) return setError("شماره / ایمیل نامعتبر است!");
    setPending(true); setError("");
    try { await sendOtp(); setStep(2); }
    catch { setError("ارسال کد ناموفق بود؛ دوباره تلاش کنید."); }
    finally { setPending(false); }
  }

  async function resend() {
    if (pending || left > 0) return;
    setPending(true); setError("");
    try { await sendOtp(); }
    catch { setError("ارسال مجدد کد ناموفق بود."); }
    finally { setPending(false); }
  }

  async function submitOtp(event: React.FormEvent) {
    event.preventDefault();
    const otp = normalizeDigits(code.trim());
    if (!/^\d{6}$/.test(otp)) return setError("کد تایید را به‌درستی وارد کنید.");
    setPending(true); setError("");
    try {
      if (!isPhoneAccount(id)) {
        const response = await authClient.emailOtp.checkVerificationOtp({ email: id, otp, type: "forget-password" });
        if (response.error) return setError("کد اشتباه است؛ دوباره تلاش کنید.");
      }
      // ponytail: phone OTP is consumed atomically with resetPassword in step 3.
      setStep(3);
    } catch { setError("تایید کد ناموفق بود؛ دوباره تلاش کنید."); }
    finally { setPending(false); }
  }

  async function submitPassword(event: React.FormEvent) {
    event.preventDefault();
    const newPass = p1 || p2;
    const confirmPass = p3 || p2;
    if (newPass.length < 8) return setError("رمز عبور شما باید حداقل ۸ حرف باشد.");
    if (newPass.length > 128) return setError("رمز عبور بیش‌ازحد طولانی است.");
    if (newPass !== confirmPass) return setError("رمز عبور خود را به‌درستی تکرار کنید!");
    setPending(true); setError("");
    try {
      const response = isPhoneAccount(id)
        ? await authClient.phoneNumber.resetPassword({ phoneNumber: id, otp: normalizeDigits(code.trim()), newPassword: newPass })
        : await authClient.emailOtp.resetPassword({ email: id, otp: normalizeDigits(code.trim()), password: newPass });
      if (response.error) return setError("تغییر رمز ناموفق بود؛ کد را دوباره بررسی کنید.");
      setStep(4);
    } catch { setError("تغییر رمز ناموفق بود؛ دوباره تلاش کنید."); }
    finally { setPending(false); }
  }

  return (
    <div className="w-full">
      {step === 1 && <form noValidate onSubmit={submitIdentifier} className="space-y-8">
        <AuthField id="reset-identifier" label="شماره موبایل یا ایمیل خود را وارد کنید" required={false} placeholder="شماره موبایل یا ایمیل" icon="icons-20--calling" value={idVal} onChange={(e) => { setIdVal(e.target.value); setError(""); }} autoComplete="username" spellCheck={false} inputMode="email" error={error} reserveHint={!!error} />
        <AuthButton type="submit" pending={pending}>تایید و ادامه</AuthButton>
      </form>}
      {step === 2 && <form noValidate onSubmit={submitOtp} className="space-y-8">
        <AuthField id="reset-otp" label="کد تایید را وارد کنید" required={false} placeholder="کد تایید" icon="/images/auth/otp.png" value={code} onChange={(e) => { setCode(normalizeDigits(e.target.value)); setError(""); }} hint={`کد تایید ارسال‌شده به ${isPhoneAccount(id) ? "شماره" : "آدرس ایمیل"} ${toFa(id)} را وارد کنید.`} error={error} inputMode="numeric" autoComplete="one-time-code" maxLength={6} />
        <ResendCode left={left} pending={pending} onResend={resend} />
        <AuthButton type="submit" pending={pending}>تایید و ادامه</AuthButton>
      </form>}
      {step === 3 && <form noValidate onSubmit={submitPassword} className="space-y-6">
        <AuthField id="reset-p1" label="رمز عبور جدید" type="password" placeholder="رمز عبور جدید" icon="icons-20--password-lock" value={p1} onChange={(e) => { setP1(e.target.value); setError(""); }} autoComplete="new-password" hint="رمز عبور شما باید حداقل ۸ حرف باشد." hintTone="error" error={error && (p1 || p2).length < 8 ? error : null} />
        <AuthField id="reset-p2" label="رمز عبور جدید" type="password" placeholder="رمز عبور" value={p2} onChange={(e) => { setP2(e.target.value); setError(""); }} autoComplete="new-password" hint="رمز عبور شما باید حداقل ۸ حرف باشد." hintTone="error" error={error && (p1 || p2).length < 8 ? error : null} />
        <AuthField id="reset-p3" label="تکرار رمز عبور" type="password" placeholder="تکرار رمز عبور" value={p3} onChange={(e) => { setP3(e.target.value); setError(""); }} autoComplete="new-password" error={error && (p1 || p2) !== (p3 || p2) ? error : null} />
        <AuthError>{error && (p1 || p2).length >= 8 && (p1 || p2) === (p3 || p2) ? error : null}</AuthError>
        <div className="pt-2"><AuthButton type="submit" pending={pending}>تایید و ادامه</AuthButton></div>
      </form>}
      {step === 4 && <div className="text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/auth/success.png" alt="" className="mx-auto h-[70px] w-[72px] object-contain" />
        <h1 className="mt-3 text-xl leading-8 font-extrabold text-[#0a5a55]">عملیات موفقیت‌آمیز!</h1>
        <p className="mt-2 text-sm font-bold text-[#4b5563]">رمز عبور شما با موفقیت ویرایش شد.</p>
        <div className="mt-10"><AuthButton type="button" onClick={() => router.push("/login")}>برگشت به صفحه ورود</AuthButton></div>
      </div>}
    </div>
  );
}
