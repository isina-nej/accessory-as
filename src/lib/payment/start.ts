import { createPayment } from "@/lib/payment/zarinpal";
import { zibalRequest } from "@/lib/payment/zibal";
import { tomanToRial } from "@/lib/fa";

export type PayProvider = "zarinpal" | "zibal";

// ponytail: بدون merchant واقعی = authority ساختگی؛ فایل جدا از منطق واقعی.
export function isMockPay(): boolean {
  return !process.env.ZARINPAL_MERCHANT_ID && (process.env.ZIBAL_MERCHANT ?? "zibal") === "zibal";
}

export async function startPayment(args: {
  provider: PayProvider;
  totalToman: number;
  orderId: string;
  callbackUrl: string;
  description: string;
  mobile?: string;
}): Promise<{ url: string; authority: string; amountRial: number }> {
  if (isMockPay()) {
    const authority = `MOCK-${args.orderId.slice(0, 8).toUpperCase()}`;
    return {
      url: `${args.callbackUrl}${args.callbackUrl.includes("?") ? "&" : "?"}Authority=${authority}&Status=OK`,
      authority,
      amountRial: tomanToRial(args.totalToman),
    };
  }
  if (args.provider === "zarinpal") {
    const r = await createPayment({
      totalToman: args.totalToman,
      callbackUrl: args.callbackUrl,
      description: args.description,
    });
    return { url: r.url, authority: r.authority, amountRial: r.amountRial };
  }
  const r = await zibalRequest({
    totalToman: args.totalToman,
    callbackUrl: args.callbackUrl,
    description: args.description,
    mobile: args.mobile,
  });
  return { url: r.url, authority: String(r.trackId), amountRial: tomanToRial(args.totalToman) };
}
