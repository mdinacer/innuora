// /lib/fonts.ts
import { Tajawal as ArabicBodyFont, Cairo as ArabicTitleFont, Geist, Geist_Mono } from "next/font/google";

export const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
export const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const cairo = ArabicTitleFont({
  variable: "--font-arabic-title",
  subsets: ["arabic"],
  weight: ["400", "700", "800"],
});
export const tajawal = ArabicBodyFont({
  variable: "--font-arabic-body",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
});
