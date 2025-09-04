// /lib/fonts.ts
import { Geist, Geist_Mono, Tajawal, Zain } from "next/font/google";

export const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
export const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const zain = Zain({
  variable: "--font-zain",
  subsets: ["arabic"],
  weight: ["400", "700"],
});
export const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
});
