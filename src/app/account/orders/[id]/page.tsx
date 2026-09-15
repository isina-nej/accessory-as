import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { getOrderDetail } from "@/lib/account-actions";
import { formatToman, toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { ORDER_STATUS_FA, orderCode } from "@/lib/order-status";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const TIMELINE = [
  ["preparing", "آماده‌سازی سفارش"],
  ["shipped", "تحویل به پستچی"],
  ["delivered", "ارسال به آدرس مشتری"],
] as const;

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/orders");
  const { id } = await params;
  const d = await getOrderDetail(id);
  if (!d) notFound();
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  const { order: o, items, address } = d;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-(--color-mist)">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-6">
        <Breadcrumb trail={[{ href: "/", label: "اکسسوری آس" }, { href: "/account", label: "پروفایل کاربری" }, { label: "جزئیات سفارش" }]} />
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <AccountSidebar active="/account/orders" name={user.name ?? "کاربر"} phone={user.email ?? ""} />
          <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold">جزئیات سفارش</h2>
                <span className="text-sm text-(--color-brand)">مشاهده فاکتور</span>
              </div>
              <p className="mt-1 text-xs text-(--color-muted-fg)">
                تاریخ ثبت سفارش: {toFa(new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(o.createdAt))} — کد پیگیری سفارش: {toFa(orderCode(o.id))}
              </p>
              <ol className="mt-4 space-y-2">
                {TIMELINE.map(([s, label]) => (
                  <li key={s} className="flex items-center gap-2 text-sm">
                    <span className={`h-3 w-3 rounded-full ${["paid", "preparing", "shipped", "delivered"].includes(o.status) ? "bg-(--color-brand)" : "bg-black/15"}`} />
                    {label}
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-(--color-muted-fg)">وضعیت: {ORDER_STATUS_FA[o.status] ?? o.status}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border bg-white p-4 text-sm">
                <p className="font-bold">مبلغ پرداختی</p>
                <p className="mt-1">مبلغ: {formatToman(o.totalToman - o.shippingFeeToman + o.discountToman)}</p>
                <p>هزینه ارسال: {formatToman(o.shippingFeeToman)}</p>
                {o.discountToman > 0 && <p>تخفیف: {formatToman(o.discountToman)}</p>}
                <p className="font-bold">جمع: {formatToman(o.totalToman)}</p>
              </div>
              <div className="rounded-2xl border bg-white p-4 text-sm">
                <p className="font-bold">آدرس ارسالی</p>
                <p className="mt-1 leading-7">{address ? `${address.detail} — ${address.city}، ${address.province}` : "—"}</p>
                <p className="mt-2 text-xs text-(--color-muted-fg)">با استفاده از سامانه رهگیری پست می‌توانید از وضعیت مرسوله باخبر شوید.</p>
                <p className="mt-1">کد رهگیری: <span dir="ltr">{o.trackingCode ? toFa(o.trackingCode) : "در حال آماده‌سازی…"}</span></p>
              </div>
            </div>
            <div className="space-y-2 rounded-2xl border bg-white p-4">
              <p className="font-bold">اقلام سفارش</p>
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between text-sm">
                  <Link href={`/products/${it.slug}`} className="hover:underline">{it.title} × {toFa(it.qty)}</Link>
                  <span>{formatToman(it.unitToman * it.qty)}</span>
                </div>
              ))}
              <Link href={`/products/${items[0]?.slug ?? ""}`} className="inline-block rounded-lg border px-4 py-2 text-sm">
                ثبت دیدگاه
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
