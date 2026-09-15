import localFont from "next/font/local";

export const doran = localFont({
  variable: "--font-doran",
  display: "swap",
  src: [
    { path: "./fonts/DoranFaNum-Thin.ttf", weight: "100", style: "normal" },
    { path: "./fonts/DoranFaNum-Light.ttf", weight: "300", style: "normal" },
    { path: "./fonts/DoranFaNum-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/DoranFaNum-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/DoranFaNum-Bold.ttf", weight: "700", style: "normal" },
    { path: "./fonts/DoranFaNum-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
});
