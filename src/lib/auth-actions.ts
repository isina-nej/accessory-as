"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// The OTP establishes the session. Only the owner of that session may finish the account.
export async function completeSignup(name: string, password: string) {
  const fullName = name.trim();
  if (fullName.length < 2 || fullName.length > 100 || password.length < 8 || password.length > 128)
    return { ok: false, error: "نام یا رمز عبور معتبر نیست." };
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session) return { ok: false, error: "نشست منقضی شد؛ دوباره وارد شوید." };
    await auth.api.updateUser({ body: { name: fullName }, headers: requestHeaders });
    await auth.api.setPassword({ body: { newPassword: password }, headers: requestHeaders });
    return { ok: true };
  } catch {
    return { ok: false, error: "تکمیل ثبت‌نام ناموفق بود؛ دوباره تلاش کنید." };
  }
}
