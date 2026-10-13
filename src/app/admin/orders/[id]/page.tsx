import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminCard, AdminEmpty } from "@/components/admin/ui";
import { AdminPage } from "@/components/admin/Shell";
import { OrderOps } from "@/components/admin/OrderOps";
import { getAdminOrder } from "@/server/admin-orders";
import { orderStatusLabel } from "@/lib/order-status";
import { faDateTime, paymentProviderLabel, paymentStatusLabel, shortId } from "@/lib/admin-labels";
import { formatToman, toFa } from "@/lib/fa";
import { requirePermission } from "@/lib/staff";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const gate = await requirePermission("orders.read");
  if (!gate.ok) redirect("/login?next=/admin/orders");
  const { id } = await params;
  const d = await getAdminOrder(id);
  if (!d) redirect("/admin/orders");
  const o = d.order;
  return (
    <AdminPage active="/admin/orders" roles={gate.roles}>
      <AdminCard
        title={`سفارش ${shortId(o.id)}… — ${orderStatusLabel(o.status)}`}
        action={<Link href="/admin/orders" className="text-xs text-(--color-brand)">بازگشت به فهرست</Link>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-sm font-bold">خریدار</p>
            <p className="text-sm">{d.buyer?.name ?? "مهمان"}</p>
            {d.buyer?.email ? <p className="text-xs text-(--color-muted-fg)" dir="ltr">{d.buyer.email}</p> : null}
            {d.buyer?.phoneNumber ? <p className="text-xs text-(--color-muted-fg)" dir="ltr">{d.buyer.phoneNumber}</p> : null}
            {!d.buyer && <p className="text-xs text-(--color-muted-fg)">سفارش مهمان</p>}
          </div>
          <div>
            <p className="mb-1 text-sm font-bold">آدرس ارسال</p>
            {d.address ? (
              <p className="text-sm leading-6">
                {d.address.recipient ? `${d.address.recipient} — ` : ""}
                {d.address.province}، {d.address.city}
                <span className="block">{d.address.detail}</span>
                {d.address.postal ? <span className="block text-xs text-(--color-muted-fg)" dir="ltr">کد پستی: {d.address.postal}</span> : null}
                <span className="block text-xs text-(--color-muted-fg)" dir="ltr">{d.address.phone}</span>
              </p>
            ) : (
              <p className="text-sm text-(--color-muted-fg)">آدرس ثبت نشده است</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <p className="mb-1 text-sm font-bold">اقلام سفارش</p>
          {d.items.length === 0 ? (
            <AdminEmpty text="قلمی برای این سفارش ثبت نشده است." />
          ) : (
            <ul className="space-y-1">
              {d.items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm">
                  <Link href={`/admin/products/${it.productId}`} className="font-bold hover:underline">{it.title}</Link>
                  <span className="text-xs text-(--color-muted-fg)">{toFa(it.qty)} عدد × {formatToman(it.unitToman)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-4 rounded-xl border bg-(--color-mist) p-3 text-sm">
          <p>جمع کالاها و ارسال: <span className="font-bold">{formatToman(o.totalToman)}</span></p>
          {o.discountToman > 0 && <p>تخفیف: {formatToman(o.discountToman)}{o.couponCode ? ` (کد: ${o.couponCode})` : ""}</p>}
          <p>هزینه ارسال: {formatToman(o.shippingFeeToman)}{o.shippingSlug ? ` (${o.shippingSlug})` : ""}</p>
          <p className="mt-1 font-bold">مبلغ قابل پرداخت: {formatToman(o.totalToman)}</p>
        </div>
        <div className="mt-4">
          <p className="mb-1 text-sm font-bold">پرداخت</p>
          {d.payment ? (
            <div className="rounded-xl border p-3 text-sm">
              <p>{paymentProviderLabel(d.payment.provider)} — {paymentStatusLabel(d.payment.status)}</p>
              {d.payment.refId ? <p className="text-xs text-(--color-muted-fg)" dir="ltr">کد پیگیری: {d.payment.refId}</p> : null}
              {d.payment.verifiedAt ? <p className="text-xs text-(--color-muted-fg)">تأیید: {faDateTime(d.payment.verifiedAt)}</p> : null}
            </div>
          ) : (
            <p className="text-sm text-(--color-muted-fg)">پرداختی برای این سفارش ثبت نشده است.</p>
          )}
        </div>
        <div className="mt-4">
          <p className="mb-2 text-sm font-bold">تغییر وضعیت و رهگیری</p>
          <OrderOps id={o.id} status={o.status} tracking={o.trackingCode} />
        </div>
        <div className="mt-4">
          <p className="mb-1 text-sm font-bold">رویدادها</p>
          {d.events.length === 0 ? (
            <p className="text-sm text-(--color-muted-fg)">رویدادی ثبت نشده است.</p>
          ) : (
            <ul className="space-y-1">
              {d.events.map((e) => (
                <li key={e.id} className="text-xs text-(--color-muted-fg)">{orderStatusLabel(e.status)} — {faDateTime(e.createdAt)}</li>
              ))}
            </ul>
          )}
        </div>
      </AdminCard>
    </AdminPage>
  );
}