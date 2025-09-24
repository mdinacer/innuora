import { Metadata } from "next";

import { APP_CONFIG, APP_NAMES } from "@/config/app";

export const METADATA: Metadata = {
  title: APP_NAMES.taglined,
  description: APP_CONFIG.description,
  keywords: [
    // Primary keywords - core problems Innuora solves
    "emotional burnout support",
    "women burnout recovery",
    "high-functioning women support",
    "emotional overwhelm relief",
    "perfectionist burnout help",
    "emotional exhaustion support",
    "cognitive distortions help",
    "emotional clarity app",
    "women emotional wellness",
    "overachiever stress relief",

    // Secondary keywords - specific features & benefits
    "safe space for women online",
    "emotional mirror app",
    "emotional reflection tool",
    "support for overwhelmed women",
    "silent rules therapy",
    "emotional patterns recognition",
    "self-criticism help",
    "internal pressure relief",
    "emotional validation app",
    "working women emotional support",

    // Branding keywords - what Innuora is
    "AI emotional companion",
    "digital emotional support",
    "emotional companion for women",
    "compassionate AI support",
    "emotional awareness tool",
    "emotional insight companion",
    "gentle emotional guidance",
    "emotional safe space app",
    "emotional wellness companion",

    // Long-tail problem-focused keywords
    "app for emotionally exhausted women",
    "support for high-functioning anxiety",
    "emotional burnout recovery for women",
    "help with perfectionist tendencies",
    "emotional overwhelm support app",
    "cognitive distortion awareness tool",
    "safe space for emotional reflection",
    "support for women carrying expectations",
    "emotional clarity for working women",
    "help with silent emotional rules",

    // Core identity
    APP_CONFIG.name,
    "emotional companion",
    "women emotional clarity",
  ],

  applicationName: APP_CONFIG.name,
  authors: [{ name: APP_CONFIG.company.founder }],
  creator: APP_CONFIG.company.founder,
  category: "health",
  metadataBase: new URL(APP_CONFIG.domains.primary),
  alternates: {
    canonical: "/en",
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
    title: APP_CONFIG.name,
    startupImage: [
      // iPadOS / iPad
      {
        url: "/splash_screens/10.2__iPad_landscape.png",
        media:
          "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/10.2__iPad_portrait.png",
        media:
          "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/10.5__iPad_Air_landscape.png",
        media:
          "screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/10.5__iPad_Air_portrait.png",
        media:
          "screen and (device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/10.9__iPad_Air_landscape.png",
        media:
          "screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/10.9__iPad_Air_portrait.png",
        media:
          "screen and (device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/11__iPad_Pro_M4_landscape.png",
        media:
          "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/11__iPad_Pro_M4_portrait.png",
        media:
          "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/12.9__iPad_Pro_landscape.png",
        media:
          "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/12.9__iPad_Pro_portrait.png",
        media:
          "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },

      // iPhone / iOS
      {
        url: "/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png",
        media:
          "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png",
        media:
          "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPhone_11__iPhone_XR_landscape.png",
        media:
          "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_11__iPhone_XR_portrait.png",
        media:
          "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png",
        media:
          "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png",
        media:
          "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png",
        media:
          "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png",
        media:
          "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },

      // iPhone SE / 4-inch
      {
        url: "/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png",
        media:
          "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png",
        media:
          "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },

      // iPad Mini 8.3-inch
      {
        url: "/splash_screens/8.3__iPad_Mini_landscape.png",
        media:
          "screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/8.3__iPad_Mini_portrait.png",
        media:
          "screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },

  // Icons
  icons: {
    icon: [
      { url: "/assets/icons/ios/32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/icons/ios/192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/icons/ios/512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/assets/icons/ios/180.png", sizes: "180x180", type: "image/png" },
      { url: "/assets/icons/ios/152.png", sizes: "152x152", type: "image/png" },
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
    title: `${APP_CONFIG.name} - AI Emotional Companion for High-Functioning Women`,
    description: `${APP_CONFIG.name} helps high-functioning women overcome emotional exhaustion, burnout, overwhelm, and perfectionism by reflecting emotions, uncovering silent rules, and providing actionable self-insight.`,
    url: APP_CONFIG.domains.primary,
    siteName: APP_CONFIG.name,
    images: [
      {
        url: "/og/innuora-cover.png",
        width: 1200,
        height: 630,
        alt: `${APP_CONFIG.name} App Open Graph Cover`,
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: `${APP_CONFIG.name} - AI Emotional Companion for High-Functioning Women`,
    description: `${APP_CONFIG.name} helps high-functioning women overcome emotional exhaustion, burnout, overwhelm, and perfectionism by reflecting emotions, uncovering silent rules, and providing actionable self-insight.`,
    creator: APP_CONFIG.social.twitter.creator,
    images: ["/og/innuora-cover.png"],
  },

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": APP_CONFIG.name,
    "msapplication-TileColor": "#ffffff",
    "msapplication-config": "/browserconfig.xml",
  },
};
