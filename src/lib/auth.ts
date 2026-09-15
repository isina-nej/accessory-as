import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, phoneNumber } from "better-auth/plugins";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "mysql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  plugins: [
    phoneNumber({
      // ponytail: SMS واقعی (کاوه‌نگار/ملّی‌پیامک) بعداً؛ فعلاً کد در لاگ سرور.
      sendOTP: async ({ phoneNumber, code }) => {
        console.log(`[auth:sms] otp for ${phoneNumber}: ${code}`);
      },
      signUpOnVerification: {
        getTempEmail: (p) => `${p.replace(/[^0-9]/g, "")}@phone.accessory-as.local`,
        getTempName: (p) => p,
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`[auth:email-otp] ${type} for ${email}: ${otp}`);
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
