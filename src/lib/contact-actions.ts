"use server";

import { z } from "zod";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";

export type ContactActionResult =
  | { ok: true; data: null }
  | { ok: false; error: string };

const contactSchema = z.object({
  name: z.string().trim().min(2, "نام و نام خانوادگی ضروری است!").max(100),
  email: z.string().trim().email("ایمیل معتبر وارد بکنید!").max(255),
  body: z.string().trim().min(2, "پیام شما ضروری است!").max(2000),
});

export async function submitContactMessage(input: {
  name: string;
  email: string;
  body: string;
}): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" };
  }

  try {
    await db.insert(contactMessages).values({
      id: crypto.randomUUID(),
      name: parsed.data.name,
      email: parsed.data.email,
      phone: null,
      body: parsed.data.body,
    });
    return { ok: true, data: null };
  } catch (error) {
    console.error("[contact:submit]", error instanceof Error ? error.message : error);
    return { ok: false, error: "ارسال ناموفق بود، دوباره تلاش کنید" };
  }
}
