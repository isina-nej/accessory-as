import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { db } from "@/db";
import { orders, payments } from "@/db/schema";
import { formatToman, toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { orderCode } from "@/lib/order-status";
import { getUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

function faDateTime(d: Date): string {
  try {
    return toFa(
      new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(d),
    );
  } catch {
    return toFa(d.toISOString().slice(0, 16));
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const uid = await getUserId();
  if (!uid) redirect("/login");
  const { order } = await searchParams;
  if (!order) redirect("/");
  const [o] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, order), eq(orders.userId, uid)))
    .limit(1)
    .catch(() => [undefined]);
  if (!o) redirect("/");
  const [pay] = await db.select().from(payments).where(eq(payments.orderId, order)).limit(1).catch(() => [undefined]);
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));

  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { label: "نتیجه پرداخت" }]} />
        <div className="space-y-3 rounded-2xl border bg-white p-6 text-center">
          <p className="text-xl font-extrabold text-(--color-brand)">پرداخت شما با موفقیت انجام شد!</p>
          <p className="text-sm text-(--color-muted-fg)">از خرید شما متشکریم</p>
          <dl className="mx-auto mt-4 max-w-md space-y-2 rounded-2xl bg-(--color-mist) p-4 text-sm">
            <div className="flex justify-between">
              <dt>مبلغ پرداخت شده</dt>
              <dd className="font-bold">{formatToman(o.totalToman)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>شناسه تراکنش</dt>
              <dd dir="ltr">{toFa(pay?.refId ?? pay?.authority ?? "—")}</dd>
            </div>
            <div className="flex justify-between">
              <dt>کد سفارش</dt>
              <dd>{toFa(orderCode(o.id))}</dd>
            </div>
            <div className="flex justify-between">
              <dt>تاریخ تراکنش</dt>
              <dd>{faDateTime(pay?.verifiedAt ?? o.createdAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>وضعیت سفارش</dt>
              <dd className="font-bold text-(--color-brand)">تایید شده</dd>
            </div>
          </dl>
          <div className="flex justify-center gap-2 pt-2">
            <Link href={`/account/orders/${o.id}`} className="rounded-lg bg-(--color-brand) px-5 py-2 text-sm text-white">
              پیگیری سفارش
            </Link>
            <Link href="/shop" className="rounded-lg border px-5 py-2 text-sm">
              برگشت به فروشگاه
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
