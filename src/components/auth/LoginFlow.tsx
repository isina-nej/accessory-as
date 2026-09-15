"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { isMobileOrEmail, isPhoneAccount, isValidMobile } from "@/lib/checkout";
import { toFa } from "@/lib/fa";
import { FIG_BTN, FIG_INPUT, FigError, FigLabel, FigSubmit } from "./fig";

function useCountdown(active: boolean) {
  const [left, setLeft] = useState(60);
  useEffect(() => {
    if (!active) return;
    setLeft(60);
    const t = setInterval(() => setLeft((v) => (v <= 1 ? 0 : v - 1)), 1000);
    return () => clearInterval(t);
  }, [active]);
  return left;
}

export function LoginFlow() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/";

  const [step, setStep] = useState<"id" | "otp" | "password" | "signup">("id");
  const [idVal, setIdVal] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const left = useCountdown(otpSent);
  const started = useRef(false);

  async function sendOtp(id: string) {
    if (isPhoneAccount(id)) {
      const r = await authClient.phoneNumber.sendOtp({ phoneNumber: id });
      if (r.error) throw new Error("ارسال کد ناموفق بود");
    } else {
      const r = await authClient.emailOtp.sendVerificationOtp({ email: id, type: "sign-in" });
      if (r.error) throw new Error("ارسال کد ناموفق بود");
    }
    setOtpSent(true);
  }

  async function submitId(e: React.FormEvent) {
    e.preventDefault();
    const v = idVal.trim();
    if (!isMobileOrEmail(v)) {
      setErr("شماره / ایمیل نامعتبر است!");
      return;
    }
    setPending(true);
    setErr(null);
    try {
      await sendOtp(v);
      setStep("otp");
    } catch {
      setErr("ارسال کد ناموفق بود؛ دوباره تلاش کن");
    } finally {
      setPending(false);
    }
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    const v = idVal.trim();
    if (code.trim().length < 4) {
      setErr("کد تایید را وارد کنید");
      return;
    }
    setPending(true);
    setErr(null);
    try {
      if (isPhoneAccount(v)) {
        const r = await authClient.phoneNumber.verify({ phoneNumber: v, code: code.trim() });
        if (r.error) {
          // کاربر جدیدِ موبایلی → تکمیل ثبت‌نام
          setStep("signup");
          return;
        }
        router.push(next);
      } else {
        const r = await authClient.signIn.emailOtp({
          email: v,
          otp: code.trim(),
          fetchOptions: { onSuccess: () => router.push(next) },
        } as Parameters<typeof authClient.signIn.emailOtp>[0]);
        if (r?.error) setErr("کد اشتباه است؛ دوباره تلاش کن");
      }
    } catch {
      setErr("تایید کد ناموفق بود");
    } finally {
      setPending(false);
    }
  }

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setErr(null);
    try {
      const v = idVal.trim();
      const body = isPhoneAccount(v)
        ? { phoneNumber: v, password }
        : { email: v, password };
      const r = await authClient.signIn.email(body as { email: string; password: string });
      if (r.error) setErr("رمز عبور اشتباه است!");
      else router.push(next);
    } catch {
      setErr("ورود ناموفق بود");
    } finally {
      setPending(false);
    }
  }

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setErr("نام و نام خانوادگی را کامل وارد کن");
      return;
    }
    if (password.length < 8) {
      setErr("رمز عبور شما باید حداقل ۸ حرف باشد.");
      return;
    }
    if (password !== confirm) {
      setErr("رمز خود را به درستی تکرار بکنید!");
      return;
    }
    setPending(true);
    setErr(null);
    try {
      const v = idVal.trim();
      const r = isPhoneAccount(v)
        ? await authClient.signUp.email({
            email: `${v.replace(/[^0-9]/g, "")}@phone.accessory-as.local`,
            password,
            name: name.trim(),
          })
        : await authClient.signUp.email({ email: v, password, name: name.trim() });
      if (r.error) setErr("ثبت‌نام ناموفق بود؛ شاید قبلاً ثبت شده‌ای");
      else router.push(next);
    } catch {
      setErr("ثبت‌نام ناموفق بود");
    } finally {
      setPending(false);
    }
  }

  // جلوگیری از double-submit در StrictMode — ponytail: بدون تغییر منطق
  useEffect(() => {
    started.current = true;
  }, []);

  return (
    <div className="w-full">
      {step === "id" && (
        <form onSubmit={submitId} className="space-y-4">
          <label className="block">
            <FigLabel hint={err ?? undefined}>شماره موبایل یا ایمیل خود را وارد کنید</FigLabel>
            <input
              className={FIG_INPUT}
              value={idVal}
              onChange={(e) => setIdVal(e.target.value)}
              placeholder="شماره موبایل یا ایمیل"
              dir="ltr"
              autoComplete="username"
            />
          </label>
          <button disabled={pending} className={FIG_BTN}>
            {pending ? "…" : "ورود به اکسسوری آس"}
          </button>
          <p className="text-center text-xs text-[#8a9398]">
            با ورود، شرایط استفاده را می‌پذیری.
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={submitOtp} className="space-y-4">
          <label className="block">
            <FigLabel hint={isValidMobile(idVal.trim()) ? `کد تأیید به شماره ${toFa(idVal.trim())} ارسال شد. لطفاً آن را وارد کنید.` : undefined}>
              کد تایید را وارد کنید
            </FigLabel>
            <input
              className={FIG_INPUT}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="کد تایید"
              dir="ltr"
              inputMode="numeric"
              maxLength={8}
            />
          </label>
          <p className="flex items-center justify-between text-sm">
            <span className="font-bold text-[#161b22]">
              {left > 0 ? <>ارسال مجدد کد بعد از {toFa(`۰۱:${String(left).padStart(2, "0").slice(-2)}`)}</> : (
                <button
                  type="button"
                  className="text-[#1888f1]"
                  onClick={() => sendOtp(idVal.trim()).catch(() => setErr("ارسال مجدد ناموفق بود"))}
                >
                  ارسال مجدد کد
                </button>
              )}
            </span>
          </p>
          <FigError msg={err} />
          <button disabled={pending} className={FIG_BTN}>
            {pending ? "…" : "تایید و ادامه"}
          </button>
          <button type="button" onClick={() => setStep("password")} className="w-full text-center text-sm font-extrabold text-[#0a5a55]">
            ورود با رمز عبور
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={submitPassword} className="space-y-4">
          <label className="block">
            <FigLabel hint={err ?? undefined}>رمز عبور</FigLabel>
            <input
              type="password"
              className={FIG_INPUT}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="رمز عبور"
              autoComplete="current-password"
            />
          </label>
          <button disabled={pending} className={FIG_BTN}>
            {pending ? "…" : "تایید و ادامه"}
          </button>
          <span className="flex justify-between text-sm">
            <button type="button" onClick={() => setStep("otp")} className="font-extrabold text-[#0a5a55]">ورود با شماره موبایل</button>
            <a href="/forgot-password" className="font-extrabold text-[#1888f1]">فراموشی رمز عبور</a>
          </span>
        </form>
      )}

      {step === "signup" && (
        <form onSubmit={submitSignup} className="space-y-4">
          <label className="block">
            <FigLabel>نام و نام خانوادگی</FigLabel>
            <input className={FIG_INPUT} value={name} onChange={(e) => setName(e.target.value)} placeholder="علی ملکی" maxLength={100} />
          </label>
          <label className="block">
            <FigLabel hint={password && password.length < 8 ? "رمز عبور شما باید حداقل ۸ حرف باشد." : undefined}>رمز عبور</FigLabel>
            <input type="password" className={FIG_INPUT} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="رمز عبور" autoComplete="new-password" />
          </label>
          <label className="block">
            <FigLabel hint={confirm && password !== confirm ? "رمز خود را به درستی تکرار بکنید!" : undefined}>تکرار رمز عبور</FigLabel>
            <input type="password" className={FIG_INPUT} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="تکرار رمز عبور" autoComplete="new-password" />
          </label>
          <FigError msg={err} />
          <FigSubmit pending={pending}>ورود به اکسسوری آس</FigSubmit>
        </form>
      )}
    </div>
  );
}
