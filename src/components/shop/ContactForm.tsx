"use client";

import { useState, type FormEvent } from "react";
import { submitContactMessage } from "@/lib/contact-actions";
import { Icon } from "@/components/ui/Icon";

const inputClass =
  "h-12 w-full rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-4 text-right text-sm font-bold text-(--color-ink) outline-none transition placeholder:text-[#8A9398] focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/15";

export function ContactForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending(true);
    setStatus(null);
    const form = new FormData(formElement);
    try {
      const result = await submitContactMessage({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        body: String(form.get("body") ?? ""),
      });
      setStatus(result.ok ? "پیام شما با موفقیت ارسال شد." : result.error);
      if (result.ok) formElement.reset();
    } catch {
      setStatus("ارسال ناموفق بود، دوباره تلاش کنید");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div>
        <label htmlFor="contact-name" className="mb-2 block text-right text-sm font-bold text-(--color-muted-fg)">
          <span className="text-(--color-wine)">* </span>نام و نام خانوادگی
        </label>
        <div className="relative">
          <input id="contact-name" name="name" className={`${inputClass} pr-12`} placeholder="علی ملکی" maxLength={100} required />
          <Icon name="icons-20--edit-user" className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
        </div>
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-2 block text-right text-sm font-bold text-(--color-muted-fg)">
          <span className="text-(--color-wine)">* </span>ایمیل
        </label>
        <div className="relative">
          <input id="contact-email" name="email" className={`${inputClass} pr-12`} placeholder="maleki.uix@gmail.com" type="email" maxLength={255} dir="ltr" required />
          <Icon name="icons-20--spam-email" className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
        </div>
      </div>

      <div>
        <label htmlFor="contact-body" className="mb-2 block text-right text-sm font-bold text-(--color-muted-fg)">
          <span className="text-(--color-wine)">* </span>پیام شما
        </label>
        <textarea id="contact-body" name="body" className="h-[184px] w-full resize-y rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-4 py-3 text-right text-sm font-medium text-(--color-ink) outline-none transition placeholder:text-[#8A9398] focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/15" placeholder="پیام خود را بنویسید..." maxLength={2000} required />
      </div>

      {status && <p role="status" className="text-right text-sm font-bold text-(--color-brand)">{status}</p>}
      <button type="submit" disabled={pending} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[10px] bg-[linear-gradient(90deg,#07534F,#008079)] text-base font-extrabold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "در حال ارسال..." : "ارسال پیام"}
        <Icon name="icons-20--send-icon" className="h-5 w-5 brightness-0 invert" />
      </button>
    </form>
  );
}
