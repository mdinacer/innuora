import { Metadata } from "next";

export const METADATA: Metadata = {
  title: "Mirael — AI for Emotional Clarity, Reflection, and Insight",
  description:
    "Mirael is an emotionally intelligent AI designed for high-functioning women navigating burnout, perfectionism, and emotional overwhelm. It reflects your emotions, highlights silent rules and cognitive distortions, and guides you toward clarity and actionable self-insight.",
  keywords: [
    "Mirael",
    "AI emotional companion",
    "emotional clarity",
    "burnout recovery",
    "perfectionism support",
    "self-awareness",
    "CBT inspired AI",
    "emotional reflection",
    "stress management",
    "personal growth",
    "mental wellbeing",
    "high-functioning women",
  ],

  applicationName: "Mirael",
  authors: [{ name: "Abdenasser Mohammedi" }],
  creator: "Abdenasser Mohammedi",
  category: "health",
  metadataBase: new URL("https://www.mirael.life"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      ar: "/ar",
      fr: "/fr",
    },
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // iOS PWA Support
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mirael",
    startupImage: [
      {
        url: "/assets/icons/ios/1024.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },

  // Icons
  icons: {
    icon: [
      { url: "/assets/icons/ios/16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/icons/ios/32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/icons/ios/192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/icons/ios/512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/assets/icons/ios/180.png", sizes: "180x180", type: "image/png" },
      { url: "/assets/icons/ios/152.png", sizes: "152x152", type: "image/png" },
      { url: "/assets/icons/ios/144.png", sizes: "144x144", type: "image/png" },
      { url: "/assets/icons/ios/120.png", sizes: "120x120", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-startup-image",
        url: "/assets/icons/ios/1024.png",
      },
    ],
  },

  openGraph: {
    title: "Mirael — AI for Emotional Clarity, Reflection, and Insight",
    description:
      "Mirael helps high-functioning women navigate emotional exhaustion, perfectionism, and stress by reflecting emotions, uncovering silent rules, and offering actionable self-insight.",
    url: "https://www.mirael.life",
    siteName: "Mirael",
    images: [
      {
        url: "/og/mirael-cover.png",
        width: 1200,
        height: 630,
        alt: "Mirael App Open Graph Cover",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Mirael — AI for Emotional Clarity, Reflection, and Insight",
    description:
      "Mirael is a unique AI companion helping high-functioning women gain clarity, process overwhelm, and navigate perfectionism with emotional reflection and insight.",
    creator: "@miraelapp",
    images: ["/og/mirael-cover.png"],
  },

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Mirael",
    "msapplication-TileColor": "#ffffff",
    "msapplication-config": "/browserconfig.xml",
  },
};
