import type { Metadata } from "next";
import "./globals.css";
import { doran } from "./fonts";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "اکسسوری آس | فروشگاه",
  description: "اکسسوری آس، روایتی از سلیقه شما",
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
