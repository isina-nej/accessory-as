import ZarinPal from "zarinpal-node-sdk";
import { tomanToRial } from "@/lib/fa";

const client = new ZarinPal({
  merchantId: process.env.ZARINPAL_MERCHANT_ID ?? "",
  sandbox: (process.env.ZARINPAL_SANDBOX ?? "true") !== "false",
});

export async function createPayment(args: {
  totalToman: number;
  callbackUrl: string;
  description: string;
}) {
  const amount = tomanToRial(args.totalToman);
  const res = await client.payments.create({
    amount,
    callback_url: args.callbackUrl,
    description: args.description,
  });
  return { authority: res.authority, url: client.payments.getRedirectUrl(res.authority), amountRial: amount };
}

export async function verifyPayment(args: { totalToman: number; authority: string }) {
  return client.verifications.verify({
    amount: tomanToRial(args.totalToman),
    authority: args.authority,
  });
}
