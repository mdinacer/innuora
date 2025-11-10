import {
  Tajawal as ArabicBodyFont,
  Cairo as ArabicTitleFont,
  Inter as LatinSans,
  DM_Serif_Display as LatinSerif,
} from "next/font/google";

// Latin fonts
export const sans = LatinSans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const serif = LatinSerif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

// Arabic fonts
export const arabicBody = ArabicBodyFont({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-arabic-body",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const arabicTitle = ArabicTitleFont({
  subsets: ["arabic"],
  weight: ["400", "700", "800"],
  variable: "--font-arabic-title",
  display: "swap",
  fallback: ["system-ui", "serif"],
});
