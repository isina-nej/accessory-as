"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { completeSignup } from "@/lib/auth-actions";
import { needsSignup, normalizeDigits, safeNextPath } from "@/lib/auth-ui";
import { isMobileOrEmail, isPhoneAccount } from "@/lib/checkout";
import { toFa } from "@/lib/fa";
import { AuthButton, AuthError, AuthField, ResendCode } from "./fig";

type Step = "id" | "otp" | "password" | "signup";

export function LoginFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next") ?? params.get("callbackURL"));
  const [step, setStep] = useState<Step>("id");
  const [idVal, setIdVal] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
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
    if (isPhoneAccount(id)) {
      const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber: id });
      if (error) throw new Error("ارسال کد ناموفق بود.");
    } else {
      const { error } = await authClient.emailOtp.sendVerificationOtp({ email: id, type: "sign-in" });
      if (error) throw new Error("ارسال کد ناموفق بود.");
    }
    setDeadline(Date.now() + 60_000);
    setLeft(60);
    setCode("");
  }

  function submitId(event: React.FormEvent) {
    event.preventDefault();
    if (!isMobileOrEmail(id)) return setError("شماره / ایمیل نامعتبر است!");
    setError("");
    setStep("password");
  }

  async function useCode() {
    if (pending) return;
    setPending(true); setError("");
    try { await sendOtp(); setStep("otp"); }
    catch { setError("ارسال کد ناموفق بود؛ دوباره تلاش کنید."); }
    finally { setPending(false); }
  }

  async function resend() {
    if (left > 0 || pending) return;
    setPending(true); setError("");
    try { await sendOtp(); }
    catch { setError("ارسال مجدد کد ناموفق بود."); }
    finally { setPending(false); }
  }

  async function submitOtp(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(normalizeDigits(code.trim()))) return setError("کد تایید را به‌درستی وارد کنید.");
    setPending(true); setError("");
    try {
      const response = isPhoneAccount(id)
        ? await authClient.phoneNumber.verify({ phoneNumber: id, code: normalizeDigits(code.trim()) })
        : await authClient.signIn.emailOtp({ email: id, otp: normalizeDigits(code.trim()) });
      if (response.error || !response.data?.user) return setError("کد اشتباه است؛ دوباره تلاش کنید.");
      if (needsSignup(response.data.user, id)) setStep("signup");
      else router.replace(next);
    } catch { setError("تایید کد ناموفق بود؛ دوباره تلاش کنید."); }
    finally { setPending(false); }
  }

  async function submitPassword(event: React.FormEvent) {
    event.preventDefault();
    if (!password) return setError("رمز عبور را وارد کنید.");
    setPending(true); setError("");
    try {
      const response = isPhoneAccount(id)
        ? await authClient.signIn.phoneNumber({ phoneNumber: id, password })
        : await authClient.signIn.email({ email: id, password });
      if (response.error) {
        const status = (response.error as { status?: number }).status;
        if (status && status >= 500) {
          setError("خطای ارتباط با پایگاه‌داده سرور؛ لطفاً وضعیت دیتابیس را بررسی کنید.");
        } else {
          setError("رمز عبور اشتباه است!");
        }
      } else {
        window.location.href = next;
      }
    } catch { setError("ورود ناموفق بود؛ دوباره تلاش کنید."); }
    finally { setPending(false); }
  }

  async function submitSignup(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) return setError("نام و نام خانوادگی را کامل وارد کنید.");
    if (password.length < 8) return setError("رمز عبور شما باید حداقل ۸ حرف باشد.");
    if (password.length > 128) return setError("رمز عبور بیش‌ازحد طولانی است.");
    if (password !== confirm) return setError("رمز خود را به‌درستی تکرار کنید!");
    setPending(true); setError("");
    try {
      const result = await completeSignup(name, password);
      if (!result.ok) return setError(result.error ?? "ثبت‌نام ناموفق بود.");
      router.replace(next);
    } catch { setError("ثبت‌نام ناموفق بود؛ دوباره تلاش کنید."); }
    finally { setPending(false); }
  }

  return (
    <div className="w-full">
      {step === "id" && <form noValidate onSubmit={submitId} className="space-y-8">
        <AuthField id="login-identifier" label="شماره موبایل یا ایمیل خود را وارد کنید" placeholder="شماره موبایل یا ایمیل" icon="icons-20--edit-user" value={idVal} onChange={(e) => { setIdVal(e.target.value); setError(""); }} error={error} autoComplete="username" spellCheck={false} inputMode="email" reserveHint />
        <AuthButton type="submit">ادامه با رمز عبور</AuthButton>
      </form>}

      {step === "otp" && <form noValidate onSubmit={submitOtp} className="space-y-8">
        <input type="text" name="username" value={id} readOnly tabIndex={-1} aria-hidden="true" autoComplete="username" className="sr-only" />
        <AuthField id="login-otp" label="کد تایید را وارد کنید" placeholder="کد تایید" icon="/images/auth/otp.png" value={code} onChange={(e) => { setCode(normalizeDigits(e.target.value)); setError(""); }} error={error} hintTone="error" hint={`کد تایید به ${isPhoneAccount(id) ? "شماره" : "آدرس ایمیل"} ${toFa(id)} ارسال شد. لطفاً آن را وارد کنید.`} inputMode="numeric" autoComplete="one-time-code" maxLength={6} />
        <ResendCode left={left} pending={pending} onResend={resend} />
        <AuthButton type="submit" pending={pending}>تایید و ادامه</AuthButton>
        <button type="button" onClick={() => { setError(""); setStep("password"); }} className="w-full text-center text-sm font-bold text-[#168bd4] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#01413e]">ورود با رمز عبور</button>
      </form>}

      {step === "password" && <form noValidate onSubmit={submitPassword} className="space-y-8">
        <input type="text" name="username" value={id} readOnly tabIndex={-1} aria-hidden="true" autoComplete="username" className="sr-only" />
        <AuthField id="login-password" label="رمز عبور" required={false} type="password" placeholder="رمز عبور" icon="icons-20--password-lock" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} error={error} autoComplete="current-password" />
        <div className="flex flex-col items-start gap-4 text-sm font-extrabold text-[#168bd4]">
          <button type="button" disabled={pending} onClick={useCode} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#01413e] disabled:opacity-50">ورود با کد تایید <span aria-hidden>‹</span></button>
          <button type="button" onClick={() => router.push(`/forgot-password?identifier=${encodeURIComponent(id)}`)} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#01413e]">فراموشی رمز عبور <span aria-hidden>‹</span></button>
          <button type="button" onClick={() => { setError(""); setStep("id"); }} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#01413e]">تغییر شماره موبایل یا ایمیل <span aria-hidden>‹</span></button>
        </div>
        <AuthButton type="submit" pending={pending}>تایید و ادامه</AuthButton>
      </form>}

      {step === "signup" && <form noValidate onSubmit={submitSignup} className="space-y-6">
        <input type="text" name="username" value={id} readOnly tabIndex={-1} aria-hidden="true" autoComplete="username" className="sr-only" />
        <AuthField id="signup-name" label="نام و نام خانوادگی" placeholder="علی ملکی" icon="icons-20--edit-user" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} maxLength={100} autoComplete="name" error={error && name.trim().length < 2 ? error : null} />
        <AuthField id="signup-password" label="رمز عبور" type="password" placeholder="رمز عبور" icon="icons-20--password-lock" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} autoComplete="new-password" error={error && password.length < 8 ? error : null} />
        <AuthField id="signup-confirm" label="تکرار رمز عبور" type="password" placeholder="تکرار رمز عبور" icon="icons-20--password-lock" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(""); }} autoComplete="new-password" error={error && password !== confirm ? error : null} />
        <AuthError>{error && name.trim().length >= 2 && password.length >= 8 && password === confirm ? error : null}</AuthError>
        <div className="pt-2"><AuthButton type="submit" pending={pending}>ورود به اکسسوری آس</AuthButton></div>
      </form>}


    </div>
  );
}
