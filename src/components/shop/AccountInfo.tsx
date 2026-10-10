"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { authClient } from "@/lib/auth-client";
import { saveWalletIban } from "@/lib/account-actions";
import { toFa } from "@/lib/fa";

export function AccountInfo({ user }: { user: { name: string; email: string; phone?: string; iban?: string } }) {
  const router = useRouter();
  const [modal, setModal] = useState<"phone" | "email" | "password" | "iban" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // فرم‌های مودال
  const [phone, setPhone] = useState(user.phone ?? "");
  const [phoneCode, setPhoneCode] = useState("");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [repeatPass, setRepeatPass] = useState("");
  const [iban, setIban] = useState(user.iban ?? "");

  async function run(fn: () => Promise<void>) {
    setPending(true);
    setMsg(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "عملیات ناموفق بود");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="rounded-[10px] border border-[#D6DBDE] bg-white p-6 space-y-6 text-right">
        <h1 className="text-[20px] font-extrabold text-[#161B22]">اطلاعـات حساب کاربـری</h1>

        {/* شبکه دو ستونه فیلدهای اطلاعات حساب کاربری مطابق فیگما */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* نام و نام خانوادگی */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-[#4B5563]">نام و نام خانوادگی</label>
            <div className="flex h-12 items-center justify-between rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm">
              <button
                type="button"
                onClick={() => setModal("phone")}
                className="flex h-7 w-8 items-center justify-center rounded-md text-[#1889F2] hover:bg-black/5"
              >
                <Icon name="icons-20--edit-pen" className="h-5 w-5" alt="" />
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#4B5563]">{user.name}</span>
                <Icon name="icons-20--edit-user" className="h-5 w-5 opacity-70" alt="" />
              </div>
            </div>
          </div>

          {/* شماره تماس */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="rounded bg-[#0A5A55] px-1.5 py-0.5 text-[11px] font-bold text-white">تایید شده</span>
              <label className="text-sm font-bold text-[#4B5563]">شماره تماس</label>
            </div>
            <div className="flex h-12 items-center justify-between rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm">
              <button
                type="button"
                onClick={() => { setModal("phone"); setMsg(null); }}
                className="flex h-7 w-8 items-center justify-center rounded-md text-[#1889F2] hover:bg-black/5"
              >
                <Icon name="icons-20--edit-pen" className="h-5 w-5" alt="" />
              </button>
              <div className="flex items-center gap-2">
                <span dir="ltr" className="font-bold text-[#4B5563]">{toFa(user.phone ?? "۰۹۳۵ ۱۷۹ ۰۸۵۳")}</span>
                <Icon name="icons-20--calling" className="h-5 w-5 opacity-70" alt="" />
              </div>
            </div>
          </div>

          {/* رمز عبور */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="rounded bg-[#0A5A55] px-1.5 py-0.5 text-[11px] font-bold text-white">تغییر رمز</span>
              <label className="text-sm font-bold text-[#4B5563]">رمز عبور</label>
            </div>
            <div className="flex h-12 items-center justify-between rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm">
              <button
                type="button"
                onClick={() => { setModal("password"); setMsg(null); }}
                className="flex h-7 w-8 items-center justify-center rounded-md text-[#1889F2] hover:bg-black/5"
              >
                <Icon name="icons-20--edit-pen" className="h-5 w-5" alt="" />
              </button>
              <div className="flex items-center gap-2">
                <span className="tracking-widest font-bold text-[#4B5563]">••••••••</span>
                <Icon name="icons-20--password-lock" className="h-5 w-5 opacity-70" alt="" />
              </div>
            </div>
          </div>

          {/* ایمیل */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="rounded bg-[#0A5A55] px-1.5 py-0.5 text-[11px] font-bold text-white">ویرایش ایمیل</span>
              <label className="text-sm font-bold text-[#4B5563]">ایمیل</label>
            </div>
            <div className="flex h-12 items-center justify-between rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm">
              <button
                type="button"
                onClick={() => { setModal("email"); setMsg(null); }}
                className="flex h-7 w-8 items-center justify-center rounded-md text-[#1889F2] hover:bg-black/5"
              >
                <Icon name="icons-20--edit-pen" className="h-5 w-5" alt="" />
              </button>
              <div className="flex items-center gap-2">
                <span dir="ltr" className="font-bold text-[#4B5563] truncate max-w-[200px]">{user.email}</span>
                <Icon name="icons-20--spam-email" className="h-5 w-5 opacity-70" alt="" />
              </div>
            </div>
          </div>

          {/* شماره شبا جهت بازگشت وجه */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="rounded bg-[#0A5A55] px-1.5 py-0.5 text-[11px] font-bold text-white">بازگشت وجه</span>
              <label className="text-sm font-bold text-[#4B5563]">شماره شبا جهت بازگشت وجه</label>
            </div>
            <div className="flex h-12 items-center justify-between rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm">
              <button
                type="button"
                onClick={() => { setModal("iban"); setMsg(null); }}
                className="flex h-7 w-8 items-center justify-center rounded-md text-[#1889F2] hover:bg-black/5"
              >
                <Icon name="icons-20--edit-pen" className="h-5 w-5" alt="" />
              </button>
              <div className="flex items-center gap-2">
                <span dir="ltr" className="font-bold text-[#4B5563]">{user.iban ?? "IR — — —"}</span>
                <Icon name="icons-20--credit-card-accept" className="h-5 w-5 opacity-70" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مودال‌های تعاملی اطلاعات حساب مطابق فریم‌های مودال فیگما */}
      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-[444px] rounded-[10px] border border-[#D6DBDE] bg-white p-6 shadow-2xl text-right space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6DBDE] pb-3">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="text-lg font-bold text-[#8A9398] hover:text-[#161B22]"
              >
                ✕
              </button>
              <h2 className="text-base font-extrabold text-[#161B22]">
                {modal === "phone" && "ویرایش شماره موبایل"}
                {modal === "email" && "ویرایش آدرس ایمیل"}
                {modal === "password" && "تغییر رمز عبور"}
                {modal === "iban" && "ثبت شماره شبا"}
              </h2>
            </div>

            {modal === "phone" && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#4B5563]">شماره موبایل جدید</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="۰۹..."
                  className="h-11 w-full rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm text-right focus:outline-none focus:border-[#0A5A55]"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(async () => {
                    const r = await authClient.phoneNumber.sendOtp({ phoneNumber: phone.trim() });
                    if (r.error) throw new Error("ارسال کد پیامکی ناموفق بود");
                    setMsg(`کد تایید به ${toFa(phone.trim())} ارسال شد.`);
                  })}
                  className="w-full rounded-lg border border-[#D6DBDE] py-2 text-xs font-bold text-[#4B5563] hover:bg-[#F8FAF9]"
                >
                  ارسال کد تایید
                </button>
                <input
                  type="text"
                  dir="ltr"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  placeholder="کد تایید ۴ یا ۶ رقمی"
                  className="h-11 w-full rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm text-center focus:outline-none focus:border-[#0A5A55]"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(async () => {
                    const r = await authClient.phoneNumber.verify({ phoneNumber: phone.trim(), code: phoneCode.trim(), updatePhoneNumber: true });
                    if (r.error) throw new Error("کد واردشده اشتباه است");
                    setModal(null);
                  })}
                  className="w-full rounded-lg bg-[#0A5A55] py-3 text-sm font-extrabold text-white transition hover:bg-[#084844]"
                >
                  تایید و ذخیره
                </button>
              </div>
            )}

            {modal === "email" && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#4B5563]">آدرس ایمیل جدید</label>
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="h-11 w-full rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm text-right focus:outline-none focus:border-[#0A5A55]"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(async () => {
                    const r = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: "change-email" });
                    if (r.error) throw new Error("ارسال کد به ایمیل ناموفق بود");
                    setMsg("کد تایید به ایمیل جدید ارسال شد.");
                  })}
                  className="w-full rounded-lg border border-[#D6DBDE] py-2 text-xs font-bold text-[#4B5563] hover:bg-[#F8FAF9]"
                >
                  ارسال کد تایید ایمیل
                </button>
                <input
                  type="text"
                  dir="ltr"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  placeholder="کد تایید"
                  className="h-11 w-full rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm text-center focus:outline-none focus:border-[#0A5A55]"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(async () => {
                    const r = await authClient.emailOtp.verifyEmail({ email: email.trim(), otp: emailCode.trim() });
                    if (r.error) throw new Error("کد ایمیل اشتباه است");
                    setModal(null);
                  })}
                  className="w-full rounded-lg bg-[#0A5A55] py-3 text-sm font-extrabold text-white transition hover:bg-[#084844]"
                >
                  تایید و جایگزینی ایمیل
                </button>
              </div>
            )}

            {modal === "password" && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#4B5563]">رمز عبور فعلی</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm text-right focus:outline-none focus:border-[#0A5A55]"
                />
                <label className="block text-xs font-bold text-[#4B5563]">رمز عبور جدید (حداقل ۸ حرف)</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm text-right focus:outline-none focus:border-[#0A5A55]"
                />
                <label className="block text-xs font-bold text-[#4B5563]">تکرار رمز عبور جدید</label>
                <input
                  type="password"
                  value={repeatPass}
                  onChange={(e) => setRepeatPass(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm text-right focus:outline-none focus:border-[#0A5A55]"
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (newPass.length < 8) return setMsg("رمز عبور جدید باید حداقل ۸ کاراکتر باشد.");
                    if (newPass !== repeatPass) return setMsg("تکرار رمز عبور جدید مطابقت ندارد.");
                    run(async () => {
                      const r = await authClient.changePassword({ currentPassword: currentPass, newPassword: newPass });
                      if (r.error) throw new Error("رمز عبور فعلی نامعتبر است");
                      setModal(null);
                    });
                  }}
                  className="w-full rounded-lg bg-[#0A5A55] py-3 text-sm font-extrabold text-white transition hover:bg-[#084844]"
                >
                  ثبت رمز عبور جدید
                </button>
              </div>
            )}

            {modal === "iban" && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#4B5563]">شماره شبا (IR + ۲۴ رقم)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  placeholder="IR..."
                  className="h-11 w-full rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 text-sm font-mono focus:outline-none focus:border-[#0A5A55]"
                />
                <p className="text-[11px] text-[#8A9398]">در صورت مرجوعی، مبالغ بازگشتی به این شبا واریز خواهد شد.</p>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(async () => {
                    const r = await saveWalletIban(iban);
                    if (!r.ok) throw new Error(r.error);
                    setModal(null);
                  })}
                  className="w-full rounded-lg bg-[#0A5A55] py-3 text-sm font-extrabold text-white transition hover:bg-[#084844]"
                >
                  ثبت و تأیید شبا
                </button>
              </div>
            )}

            {msg && <p role="alert" className="text-xs font-bold text-[#9F1239] text-center">{msg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
