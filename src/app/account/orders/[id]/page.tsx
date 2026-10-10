import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Breadcrumb } from "@/components/shop/Breadcrumb";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { AccountSidebar } from "@/components/shop/AccountSidebar";
import { Icon } from "@/components/ui/Icon";
import { getOrderDetail } from "@/lib/account-actions";
import { formatToman, toFa } from "@/lib/fa";
import { getMegaMenu } from "@/lib/menu";
import { orderCode } from "@/lib/order-status";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account/orders");
  const { id } = await params;
  const d = await getOrderDetail(id);
  if (!d) notFound();
  const menu = await getMegaMenu().catch((): Awaited<ReturnType<typeof getMegaMenu>> => ({ cats: [], byCat: {} }));
  const { order: o, items, address } = d;

  const isPreparing = ["paid", "preparing", "shipped", "delivered"].includes(o.status);
  const isShipped = ["shipped", "delivered"].includes(o.status);
  const isDelivered = o.status === "delivered";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#F8FAF9]">
      <Header menu={menu} />
      <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-4 sm:px-8 lg:px-20 py-6">
        <div className="h-5">
          <Breadcrumb
            trail={[
              { href: "/", label: "اکسســـوری آس" },
              { href: "/account", label: "پروفایل کاربری" },
              { href: "/account/orders", label: "سفـارش ها" },
              { label: "جزئیات سفارش" },
            ]}
          />
        </div>

        <div className="flex flex-col-reverse lg:flex-row justify-end items-start gap-6">
          {/* پنل جزئیات سفارش ۹۲۷px */}
          <section aria-label="جزئیات سفارش" className="w-full lg:w-[927px] rounded-[10px] border border-[#D6DBDE] bg-white p-6 space-y-6">
            {/* سربرگ جزئیات سفارش با دکمه بازگشت و فاکتور */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D6DBDE] pb-4">
              <div className="flex flex-col gap-1 text-right">
                <div className="flex items-center gap-3">
                  <Link
                    href="/account/orders"
                    aria-label="بازگشت به سفارش‌ها"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D6DBDE] hover:bg-[#F8FAF9]"
                  >
                    <Icon name="icons-20--direction-right" className="h-5 w-5" alt="" />
                  </Link>
                  <h1 className="text-[20px] font-extrabold text-[#161B22]">جزئیات سفارش</h1>
                </div>
                <p className="text-sm font-medium text-[#4B5563] pr-11">
                  تاریخ ثبت سفارش: {toFa(new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(o.createdAt))} — کد پیگیری سفارش: {toFa(orderCode(o.id))}
                </p>
              </div>

              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-[#D6DBDE] bg-[#F8FAF9] px-3 py-2 text-sm font-extrabold text-[#0A5A55] transition hover:bg-[#EAEFEF]"
              >
                <Icon name="icons-20--package-bill" className="h-5 w-5" alt="" />
                <span>مشاهده فاکتور</span>
              </button>
            </div>

            {/* کارت مراحل پیشرفت مرسوله ۳ مرحله‌ای مطابق فیگما */}
            <div className="rounded-[10px] border border-[#D6DBDE] overflow-hidden bg-white">
              <div className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center sm:text-right">
                  {/* مرحله ۳ (در راست): آماده‌سازی سفارش */}
                  <div className="flex flex-col items-center sm:items-start gap-2">
                    <div className="flex items-center gap-2 rounded-md bg-[#F8FAF9] px-2.5 py-1 text-xs sm:text-sm font-extrabold text-[#0A5A55]">
                      <Icon name="icons-20--check-circle" className="h-4 w-4" alt="" />
                      <span>آماده‌سازی سفارش</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#E8EBED] overflow-hidden">
                      <div className="h-full w-full rounded-full bg-gradient-to-l from-[#178D85] to-[#0A5A55]" />
                    </div>
                  </div>

                  {/* مرحله ۲ (در وسط): تحویل به پستچی */}
                  <div className="flex flex-col items-center sm:items-start gap-2">
                    <div className={`flex items-center gap-2 rounded-md bg-[#F8FAF9] px-2.5 py-1 text-xs sm:text-sm font-extrabold ${isShipped ? "text-[#0A5A55]" : "text-[#8A9398]"}`}>
                      <Icon name="icons-20--trolley" className="h-4 w-4" alt="" />
                      <span>تحویل به پستچی</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#E8EBED] overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-l from-[#178D85] to-[#0A5A55] ${isShipped ? "w-full" : isPreparing ? "w-1/2" : "w-0"}`} />
                    </div>
                  </div>

                  {/* مرحله ۱ (در چپ): ارسال به آدرس مشتری */}
                  <div className="flex flex-col items-center sm:items-start gap-2">
                    <div className={`flex items-center gap-2 rounded-md bg-[#F8FAF9] px-2.5 py-1 text-xs sm:text-sm font-extrabold ${isDelivered ? "text-[#0A5A55]" : "text-[#8A9398]"}`}>
                      <Icon name="icons-20--delivery" className="h-4 w-4" alt="" />
                      <span>ارسال به مشتری</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#E8EBED] overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-l from-[#178D85] to-[#0A5A55] ${isDelivered ? "w-full" : "w-0"}`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* نوار پایین داک‌شده اطلاعات زمان‌بندی */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#D6DBDE] bg-[#F8FAF9] px-6 py-3 text-sm font-bold text-[#4B5563] gap-2">
                <span>آخرین بروزرسانی: {toFa(new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" }).format(o.createdAt))}</span>
                <span>زمان تقریبی تحویل: ۳ تا ۵ روز کاری</span>
              </div>
            </div>

            {/* دو ستون پایین: کارت پرداخت و آدرس در راست، رهگیری و محصولات در چپ */}
            <div className="grid grid-cols-1 md:grid-cols-[339px_1fr] gap-4">
              {/* ستون راست (۳۳۹px) */}
              <div className="space-y-4">
                {/* جعبه مبلغ پرداختی */}
                <div className="rounded-[10px] border border-[#D6DBDE] bg-white p-4 space-y-3 text-right">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-[#161B22]">
                    <Icon name="icons-20--fee" className="h-5 w-5" alt="" />
                    <span>مبلغ پرداختی</span>
                  </div>
                  <div className="flex items-baseline justify-end gap-1 text-[#161B22]">
                    <span className="text-[22px] font-bold">{toFa(o.totalToman.toLocaleString("en-US"))}</span>
                    <span className="text-xs font-bold text-[#4B5563]">تومان</span>
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-[#D6DBDE] bg-[#F8FAF9] px-3 py-2 text-xs font-medium text-[#4B5563]">
                    <span>هزینه ارسال:</span>
                    <span className="font-bold text-[#161B22]">{formatToman(o.shippingFeeToman)}</span>
                  </div>
                </div>

                {/* جعبه آدرس ارسالی */}
                <div className="rounded-[10px] border border-[#D6DBDE] bg-white p-4 space-y-3 text-right">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-[#161B22]">
                    <Icon name="icons-20--pinned-map" className="h-5 w-5" alt="" />
                    <span>آدرس تحویل سفارش</span>
                  </div>
                  <div className="h-24 w-full rounded-lg border border-[#D6DBDE] overflow-hidden bg-[#FAFBFB]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/contact-map.png" alt="" className="h-full w-full object-cover opacity-80" />
                  </div>
                  <p className="text-xs font-bold leading-6 text-[#4B5563]">
                    {address ? `${address.detail} — ${address.city}، ${address.province}` : "تهران، خیابان ولیعصر، بالاتر از زرتشت، پلاک ۲۴"}
                  </p>
                </div>
              </div>

              {/* ستون چپ */}
              <div className="space-y-4">
                {/* جعبه کد رهگیری پستی */}
                <div className="rounded-[10px] border border-[#D6DBDE] bg-white p-4 space-y-2 text-right">
                  <p className="text-xs font-bold text-[#4B5563]">
                    با استفاده از سامانه رهگیری پست می‌توانید از وضعیت مرسوله باخبر شوید.
                  </p>
                  <div className="flex items-center justify-between rounded-md border border-[#D6DBDE] bg-[#F8FAF9] px-3 py-2 text-sm">
                    <span className="font-medium text-[#4B5563]">کد رهگیری:</span>
                    <span dir="ltr" className="font-bold text-[#161B22]">
                      {o.trackingCode ? toFa(o.trackingCode) : "۱۹۱۴۸۰۱۰۶۲۰۲۲۴۲۲۰۰۴۵۹۱۱۱"}
                    </span>
                    <Icon name="icons-20--copy" className="h-4 w-4 text-[#4B5563]" alt="" />
                  </div>
                </div>

                {/* لیست اقلام سفارش */}
                <div className="rounded-[10px] border border-[#D6DBDE] bg-white p-4 space-y-3">
                  <h2 className="text-sm font-extrabold text-[#161B22] text-right">اقلام سفارش</h2>
                  <div className="divide-y divide-[#D6DBDE]">
                    {items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between py-3 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#D6DBDE] bg-white p-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={it.image ?? "/images/product-01.webp"} alt={it.title} className="h-full w-full object-contain" />
                          </div>
                          <div className="text-right">
                            <Link href={`/products/${it.slug}`} className="text-sm font-bold text-[#161B22] hover:text-[#0A5A55]">
                              {it.title}
                            </Link>
                            <p className="text-xs text-[#8A9398] mt-1">تعداد: {toFa(it.qty)}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className="text-sm font-bold text-[#161B22]">{formatToman(it.unitToman * it.qty)}</span>
                          <Link
                            href={`/products/${it.slug}#reviews`}
                            className="flex items-center gap-1.5 rounded-lg border border-[#FFB23F] bg-white px-2.5 py-1 text-xs font-extrabold text-[#FFB23F] transition hover:bg-[#FFF8EE]"
                          >
                            <Icon name="icons-20--bubble-chat-edit" className="h-4 w-4" alt="" />
                            <span>ثبت دیدگـاه</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* سایدبار سمت راست */}
          <AccountSidebar
            active="/account/orders"
            name={user.name ?? "علی ملکی"}
            phone={user.email ?? "۰۹۳۵ ۱۷۹ ۰۸۵۳"}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
