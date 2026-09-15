import { tomanToRial } from "@/lib/fa";

const BASE = "https://gateway.zibal.ir/v1";

// ponytail: پکیج npm ناپایدار است؛ REST مستقیم تا پایدار شدن.
export async function zibalRequest(args: {
  totalToman: number;
  callbackUrl: string;
  description?: string;
  mobile?: string;
}) {
  const res = await fetch(`${BASE}/request`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      merchant: process.env.ZIBAL_MERCHANT ?? "zibal",
      amount: tomanToRial(args.totalToman),
      callbackUrl: args.callbackUrl,
      description: args.description,
      mobile: args.mobile,
    }),
  });
  const data = (await res.json()) as { result: number; trackId?: number; message?: string };
  if (data.result !== 100 || !data.trackId) throw new Error(data.message ?? "zibal request failed");
  return { trackId: data.trackId, url: `https://gateway.zibal.ir/start/${data.trackId}` };
}

export async function zibalVerify(args: { trackId: number }) {
  const res = await fetch(`${BASE}/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      merchant: process.env.ZIBAL_MERCHANT ?? "zibal",
      trackId: args.trackId,
    }),
  });
  return (await res.json()) as { result: number; refNumber?: string; message?: string };
}
