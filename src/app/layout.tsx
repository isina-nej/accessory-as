import type { Metadata } from "next";
import "./globals.css";
import { doran } from "./fonts";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "اکسسوری آس | فروشگاه",
  description: "اکسسوری آس، روایتی از سلیقه شما — گردنبند، انگشتر، دستبند، گوشواره و ست‌های خاص.",
  openGraph: {
    title: "اکسسوری آس",
    description: "روایتی از سلیقه تو",
    locale: "fa_IR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={doran.variable}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
