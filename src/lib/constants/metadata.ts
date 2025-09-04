import { Metadata } from "next";

export const METADATA = {
  title: "Mirael — A Gentle Companion for Emotional Clarity",
  description:
    "Mirael is a soft and emotionally intelligent space for high-functioning yet emotionally exhausted women to reconnect with themselves, gain clarity, and find gentle insight.",
  keywords: [
    "emotional wellness",
    "self-awareness",
    "burnout recovery",
    "CBT",
    "emotional exhaustion",
    "women mental health",
    "introspective app",
    "gentle companion",
    "Mirael",
    "healing",
    "clarity",
  ],

  applicationName: "Mirael",
  authors: [{ name: "Mirael" }],
  creator: "Mirael",
  category: "health",
  metadataBase: new URL("https://mirael.app"),

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
    title: "Mirael — A Gentle Companion for Emotional Clarity",
    description:
      "Designed for emotionally exhausted, high-functioning women. Mirael helps you reconnect with your inner self and find peace through introspective flow.",
    url: "https://mirael.app",
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
    title: "Mirael — A Gentle Companion for Emotional Clarity",
    description:
      "Mirael is an emotionally intelligent app helping high-functioning women navigate disconnection, burnout, and emotional numbness with grace.",
    creator: "@miraelapp",
    images: ["/og/mirael-cover.png"],
  },

  // Additional meta tags for iOS
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Mirael",
    "msapplication-TileColor": "#ffffff",
    "msapplication-config": "/browserconfig.xml",
  },
} as Metadata;
