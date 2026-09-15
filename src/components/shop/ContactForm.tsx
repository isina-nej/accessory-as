"use client";

import { useState } from "react";

const input = "h-11 w-full rounded-lg border bg-white px-3 text-sm";

export function ContactForm() {
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      className="space-y-3 rounded-2xl border bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg("پیامت ثبت شد؛ به‌زودی جواب می‌دهیم.");
        (e.target as HTMLFormElement).reset();
      }}
    >
      <p className="font-bold">ارسال پیام</p>
      <div className="grid gap-3 md:grid-cols-2">
        <input className={input} placeholder="نام" required maxLength={100} />
        <input className={input} placeholder="موبایل ۰۹…" required maxLength={11} inputMode="tel" />
      </div>
      <textarea className="w-full rounded-lg border bg-white px-3 py-2 text-sm" rows={4} placeholder="متن پیام" required maxLength={2000} />
      {msg && <p className="text-sm text-(--color-brand)">{msg}</p>}
      <button className="h-11 w-full rounded-lg bg-(--color-brand) text-sm font-bold text-white">ارسال</button>
    </form>
  );
}
