import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderEvents, orders, payments } from "@/db/schema";
import { verifyPayment } from "@/lib/payment/zarinpal";
import { zibalVerify } from "@/lib/payment/zibal";
import { mockConfirmOrder } from "@/lib/pay-actions";
import { getUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  const provider = url.searchParams.get("provider") ?? "zarinpal";
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");
  if (!orderId) redirect("/checkout/fail?reason=no-order");

  const uid = await getUserId();
  if (!uid) redirect(`/login?next=/checkout/pay`);

  // mock: تایید داخلی
  const [pay] = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1).catch(() => [undefined]);
  if (pay?.authority?.startsWith("MOCK-")) {
    const ok = await mockConfirmOrder(orderId, uid);
    redirect(ok ? `/checkout/success?order=${orderId}` : `/checkout/fail?order=${orderId}&reason=mock`);
  }

  // واقعی
  try {
    const [o] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, uid)))
      .limit(1);
    if (!o || !authority) redirect(`/checkout/fail?order=${orderId}&reason=invalid`);

    if (provider === "zibal") {
      const trackId = Number(authority);
      const v = await zibalVerify({ trackId });
      if (v.result !== 100 || !v.refNumber) throw new Error(v.message ?? "zibal verify failed");
      await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));
      await db
        .update(payments)
        .set({ status: "verified", refId: v.refNumber, verifiedAt: new Date() })
        .where(eq(payments.orderId, orderId));
    } else {
      if (status !== "OK") throw new Error("payment cancelled");
      await verifyPayment({ totalToman: o.totalToman, authority });
      await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));
      await db
        .update(payments)
        .set({ status: "verified", refId: authority, verifiedAt: new Date() })
        .where(eq(payments.orderId, orderId));
    }
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/shop");
    revalidatePath("/");
    await db.insert(orderEvents).values({ orderId, status: "paid" });
    redirect(`/checkout/success?order=${orderId}`);
  } catch (e) {
    console.error("[pay:callback]", e instanceof Error ? e.message : e);
    await db.update(orders).set({ status: "failed" }).where(eq(orders.id, orderId)).catch(() => {});
    redirect(`/checkout/fail?order=${orderId}&reason=verify`);
  }
}
