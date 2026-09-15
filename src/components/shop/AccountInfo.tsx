"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { saveWalletIban } from "@/lib/account-actions";
import { toFa } from "@/lib/fa";

const input = "h-10 w-full rounded-lg border bg-white px-3 text-sm";

export function AccountInfo({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const [tab, setTab] = useState<"main" | "phone" | "email" | "password" | "iban">("main");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // phone change
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  // email change
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  // password
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [current, setCurrent] = useState("");
  // iban
  const [iban, setIban] = useState("");

  async function run(fn: () => Promise<void>) {
    setPending(true);
    setMsg(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "ناموفق بود");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border bg-white p-4 text-sm">
        <p className="font-bold">اطلاعات حساب کاربری</p>
        <p className="mt-2">نام و نام خانوادگی: {user.name}</p>
        <p className="mt-1">ایمیل: <span dir="ltr">{user.email}</span></p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["phone", "ویرایش موبایل"],
              ["email", "ویرایش ایمیل"],
              ["password", "تغییر رمز"],
              ["iban", "حساب بازگشت وجه"],
            ] as const
          ).map(([v, label]) => (
            <button key={v} onClick={() => { setTab(v); setMsg(null); }} className="rounded-lg border px-3 py-1.5 text-xs">
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "phone" && (
        <div className="space-y-2 rounded-2xl border bg-white p-4">
          <p className="text-sm font-bold">ویرایش شماره موبایل</p>
          <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="۰۹…" inputMode="tel" dir="ltr" />
          <button
            disabled={pending}
            className="h-10 w-full rounded-lg border text-sm disabled:opacity-50"
            onClick={() => run(async () => {
              const r = await authClient.phoneNumber.sendOtp({ phoneNumber: phone.trim() });
              if (r.error) throw new Error("ارسال کد ناموفق بود");
              setMsg(`کد به ${toFa(phone.trim())} ارسال شد`);
            })}
          >
            ارسال کد
          </button>
          <input className={input} value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} placeholder="کد تایید" dir="ltr" inputMode="numeric" />
          <button
            disabled={pending}
            className="h-10 w-full rounded-lg bg-(--color-brand) text-sm font-bold text-white disabled:opacity-50"
            onClick={() => run(async () => {
              const r = await authClient.phoneNumber.verify({ phoneNumber: phone.trim(), code: phoneCode.trim(), updatePhoneNumber: true });
              if (r.error) throw new Error("کد اشتباه است");
              setMsg("شماره تایید شد");
              setTab("main");
            })}
          >
            تایید
          </button>
          {msg && <p className="text-xs">{msg}</p>}
        </div>
      )}

      {tab === "email" && (
        <div className="space-y-2 rounded-2xl border bg-white p-4">
          <p className="text-sm font-bold">ویرایش ایمیل</p>
          <input className={input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ایمیل جدید" dir="ltr" />
          <button
            disabled={pending}
            className="h-10 w-full rounded-lg border text-sm disabled:opacity-50"
            onClick={() => run(async () => {
              const r = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: "change-email" });
              if (r.error) throw new Error("ارسال کد ناموفق بود");
              setMsg("کد به ایمیل جدید ارسال شد");
            })}
          >
            ارسال کد
          </button>
          <input className={input} value={emailCode} onChange={(e) => setEmailCode(e.target.value)} placeholder="کد تایید" dir="ltr" inputMode="numeric" />
          <button
            disabled={pending}
            className="h-10 w-full rounded-lg bg-(--color-brand) text-sm font-bold text-white disabled:opacity-50"
            onClick={() => run(async () => {
              const r = await authClient.emailOtp.verifyEmail({ email: email.trim(), otp: emailCode.trim() });
              if (r.error) throw new Error("کد اشتباه است");
              setMsg("ایمیل تایید شد");
              setTab("main");
            })}
          >
            تایید
          </button>
          {msg && <p className="text-xs">{msg}</p>}
        </div>
      )}

      {tab === "password" && (
        <div className="space-y-2 rounded-2xl border bg-white p-4">
          <p className="text-sm font-bold">تغییر رمز عبور</p>
          <input type="password" className={input} value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="رمز فعلی" autoComplete="current-password" />
          <input type="password" className={input} value={p1} onChange={(e) => setP1(e.target.value)} placeholder="رمز جدید (حداقل ۸ حرف)" autoComplete="new-password" />
          <input type="password" className={input} value={p2} onChange={(e) => setP2(e.target.value)} placeholder="تکرار رمز جدید" autoComplete="new-password" />
          {msg && <p className="text-xs text-(--color-wine)">{msg}</p>}
          <button
            disabled={pending}
            className="h-10 w-full rounded-lg bg-(--color-brand) text-sm font-bold text-white disabled:opacity-50"
            onClick={() => {
              if (p1.length < 8) return setMsg("رمز عبور شما باید حداقل ۸ حرف باشد.");
              if (p1 !== p2) return setMsg("رمز عبور خود را به درستی تکرار بکنید!");
              run(async () => {
                const r = await authClient.changePassword({ currentPassword: current, newPassword: p1 });
                if (r.error) throw new Error("رمز فعلی اشتباه است");
                setMsg("رمز با موفقیت ویرایش شد");
                setTab("main");
              });
            }}
          >
            ثبت
          </button>
        </div>
      )}

      {tab === "iban" && (
        <div className="space-y-2 rounded-2xl border bg-white p-4">
          <p className="text-sm font-bold">حساب برای بازگشت وجه</p>
          <p className="text-xs text-(--color-muted-fg)">شبا (IR + ۲۴ رقم) برای واریز مرجوعی.</p>
          <input className={input} value={iban} onChange={(e) => setIban(e.target.value)} placeholder="IR…" dir="ltr" maxLength={30} />
          {msg && <p className="text-xs">{msg}</p>}
          <button
            disabled={pending}
            className="h-10 w-full rounded-lg bg-(--color-brand) text-sm font-bold text-white disabled:opacity-50"
            onClick={() => run(async () => {
              const r = await saveWalletIban(iban);
              if (!r.ok) throw new Error(r.error);
              setMsg("شبا ثبت شد");
              setTab("main");
            })}
          >
            ثبت شبا
          </button>
        </div>
      )}
    </div>
  );
}
